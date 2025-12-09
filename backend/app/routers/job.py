from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.auth import verify_token
from app.models import User, Job, JobEmbedding, Recommendation, Resume, UserSettings, Bullet
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service

router = APIRouter()


async def generate_initial_recommendations(
    db: Session,
    user_id: int,
    job_id: int,
    resume_id: int,
    job_title: str,
    job_company: str | None,
    job_description: str
):
    """Generate initial recommendations when job is created with linked resume."""
    try:
        # Get fresh DB session for background task
        from app.database import SessionLocal
        local_db = SessionLocal()
        
        try:
            # Get resume
            resume = local_db.query(Resume).filter(
                Resume.resume_id == resume_id,
                Resume.user_id == user_id
            ).first()
            
            if not resume:
                return
            
            # Get user settings for API keys
            settings = local_db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
            provider = settings.ai_provider if settings else None
            api_key = settings.api_key if settings else None
            model = settings.model_preference if settings else None
            
            if not api_key:
                # Skip if no API key configured
                return
            
            # Generate recruiter message
            parsed_data = resume.parsed_json or {}
            candidate_summary = f"Professional with experience in {parsed_data.get('sections', {}).get('experience', 'various roles')[:200]}"
            if parsed_data.get("experience_count"):
                candidate_summary += f" ({parsed_data['experience_count']} positions)"
            
            recruiter_msg = None
            try:
                recruiter_msg = await llm_service.generate_recruiter_message(
                    candidate_summary=candidate_summary,
                    job_title=job_title,
                    company=job_company or "the company",
                    recipient_name=None,
                    provider=provider,
                    api_key=api_key,
                    model=model
                )
            except Exception as e:
                print(f"Failed to generate recruiter message: {str(e)}")
            
            # Generate resume improvements
            improvements = []
            try:
                bullets = local_db.query(Bullet).filter(
                    Bullet.resume_id == resume_id,
                    Bullet.section == "Work Experience"
                ).all()
                
                if bullets:
                    job_text = job_description.lower()
                    job_requirements = []
                    common_skills = ["python", "javascript", "java", "react", "aws", "docker", "kubernetes", "sql", "machine learning", "data science"]
                    for skill in common_skills:
                        if skill in job_text:
                            job_requirements.append(skill.title())
                    
                    num_to_improve = max(1, min(3, len(bullets)))
                    for bullet in bullets[:num_to_improve]:
                        try:
                            improved_text = await llm_service.improve_resume_bullet(
                                bullet.text,
                                job_requirements,
                                job_title,
                                provider=provider,
                                api_key=api_key,
                                model=model
                            )
                            improvements.append({
                                "original_bullet": bullet.text,
                                "improved_bullet": improved_text,
                            })
                        except:
                            improvements.append({
                                "original_bullet": bullet.text,
                                "improved_bullet": bullet.text,
                            })
            except Exception as e:
                print(f"Failed to generate improvements: {str(e)}")
            
            # Save to Recommendation table
            if recruiter_msg or improvements:
                recommendation = Recommendation(
                    user_id=user_id,
                    job_id=job_id,
                    resume_id=resume_id,
                    recruiter_message_text=recruiter_msg,
                    improved_resume_json={"improvements": improvements} if improvements else None,
                )
                local_db.add(recommendation)
                local_db.commit()
        finally:
            local_db.close()
    except Exception as e:
        print(f"Error in background recommendation generation: {str(e)}")


class JobSubmitRequest(BaseModel):
    job_title: str
    company: str
    description: str
    resume_id: Optional[int] = None


class JobSubmitResponse(BaseModel):
    job_id: int
    status: str


class JobStatusUpdate(BaseModel):
    application_status: str  # applied, interviewing, offer_received, rejected


class JobListItem(BaseModel):
    job_id: int
    title: str
    company: Optional[str]
    application_status: str
    resume_id: Optional[int]
    posted_at: str
    match_score: Optional[float] = None


class JobDetail(BaseModel):
    job_id: int
    title: str
    company: Optional[str]
    description_text: str
    application_status: str
    resume_id: Optional[int]
    posted_at: str
    match_score: Optional[float] = None
    recruiter_message: Optional[str] = None
    referral_message: Optional[str] = None
    resume_suggestions: Optional[dict] = None


@router.post("/submit", response_model=JobSubmitResponse)
async def submit_job(
    job_data: JobSubmitRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Submit a job description for analysis."""
    # Get or create user
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        user = User(
            email=current_user["email"],
            name=current_user.get("name"),
            auth_provider_id=current_user["user_id"],
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create job record
    job = Job(
        user_id=user.user_id,
        title=job_data.job_title,
        company=job_data.company,
        description_text=job_data.description,
        application_status="applied",
        resume_id=job_data.resume_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Generate embedding for job description
    try:
        # Limit text length for embedding
        job_text = job_data.description[:5000]
        embedding = embedding_service.encode_single(job_text)
        
        job_embedding = JobEmbedding(
            job_id=job.job_id,
            section="full",
            embedding=embedding,
        )
        db.add(job_embedding)
        db.commit()
    except Exception as e:
        print(f"Failed to create job embedding: {str(e)}")
        # Continue without embedding
    
    # If resume is linked, generate initial recommendations (messages and suggestions) in background
    # We'll do this asynchronously so job creation doesn't block
    if job_data.resume_id:
        try:
            # Verify resume belongs to user
            resume = db.query(Resume).filter(
                Resume.resume_id == job_data.resume_id,
                Resume.user_id == user.user_id
            ).first()
            
            if resume:
                # Schedule background task to generate recommendations
                background_tasks.add_task(
                    generate_initial_recommendations,
                    db,
                    user.user_id,
                    job.job_id,
                    job_data.resume_id,
                    job.title,
                    job.company,
                    job.description_text
                )
        except Exception as e:
            print(f"Error scheduling recommendation generation: {str(e)}")
            # Continue without recommendations
    
    return JobSubmitResponse(job_id=job.job_id, status="saved")


@router.get("/match-score")
async def get_match_score(
    resume_id: int,
    job_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Calculate job fit score between resume and job description."""
    from app.models import Resume, ResumeEmbedding
    from sqlalchemy import func
    import numpy as np
    
    # Get user
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get resume and job
    resume = db.query(Resume).filter(
        Resume.resume_id == resume_id, Resume.user_id == user.user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    job = db.query(Job).filter(
        Job.job_id == job_id, Job.user_id == user.user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get embeddings
    resume_embedding = db.query(ResumeEmbedding).filter(
        ResumeEmbedding.resume_id == resume_id,
        ResumeEmbedding.section == "full"
    ).first()
    
    job_embedding = db.query(JobEmbedding).filter(
        JobEmbedding.job_id == job_id,
        JobEmbedding.section == "full"
    ).first()
    
    # Calculate semantic similarity
    semantic_score = 0.0
    if resume_embedding and job_embedding and resume_embedding.embedding and job_embedding.embedding:
        try:
            semantic_score = embedding_service.cosine_similarity(
                resume_embedding.embedding,
                job_embedding.embedding
            )
            # Convert to 0-100 scale
            semantic_score = max(0, min(100, semantic_score * 100))
        except Exception as e:
            print(f"Error calculating similarity: {str(e)}")
    
    # Keyword matching (simple approach)
    resume_text = (resume.text_content or "").lower()
    job_text = job.description_text.lower()
    
    # Extract skills/keywords from job description
    common_skills = [
        "python", "javascript", "java", "react", "aws", "docker", "kubernetes",
        "sql", "machine learning", "data science", "agile", "scrum", "leadership",
        "project management", "communication", "team", "analytics", "cloud",
    ]
    
    job_skills = [skill for skill in common_skills if skill in job_text]
    resume_skills = [skill for skill in common_skills if skill in resume_text]
    
    matched_skills = set(job_skills) & set(resume_skills)
    missing_skills = set(job_skills) - set(resume_skills)
    
    skills_match = (len(matched_skills) / len(job_skills) * 100) if job_skills else 0
    
    # Experience level matching (simple heuristic)
    experience_keywords = ["senior", "lead", "principal", "junior", "entry", "intern"]
    job_level = None
    for keyword in experience_keywords:
        if keyword in job_text:
            job_level = keyword
            break
    
    resume_level = None
    for keyword in experience_keywords:
        if keyword in resume_text:
            resume_level = keyword
            break
    
    experience_match = 100.0
    if job_level and resume_level:
        # Simple matching logic
        if "senior" in job_level and "junior" in resume_level:
            experience_match = 60.0
        elif "lead" in job_level and "junior" in resume_level:
            experience_match = 50.0
    
    # Overall score: weighted combination
    overall_score = (
        semantic_score * 0.5 +  # 50% semantic similarity
        skills_match * 0.3 +     # 30% keyword matching
        experience_match * 0.2   # 20% experience level
    )
    
    return {
        "job_id": job_id,
        "resume_id": resume_id,
        "score": round(overall_score, 1),
        "missing_skills": list(missing_skills)[:10],  # Top 10 missing
        "details": {
            "skills_match": round(skills_match, 1),
            "experience_match": round(experience_match, 1),
            "overall_fit": round(semantic_score, 1),
        },
    }


@router.get("/list", response_model=List[JobListItem])
async def get_jobs(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get all jobs for the current user with their application status."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    jobs = db.query(Job).filter(Job.user_id == user.user_id).order_by(Job.posted_at.desc()).all()
    
    result = []
    for job in jobs:
        # Get match score if resume is linked
        match_score = None
        if job.resume_id:
            try:
                from app.models import ResumeEmbedding
                resume_embedding = db.query(ResumeEmbedding).filter(
                    ResumeEmbedding.resume_id == job.resume_id,
                    ResumeEmbedding.section == "full"
                ).first()
                job_embedding = db.query(JobEmbedding).filter(
                    JobEmbedding.job_id == job.job_id,
                    JobEmbedding.section == "full"
                ).first()
                if resume_embedding and job_embedding and resume_embedding.embedding and job_embedding.embedding:
                    semantic_score = embedding_service.cosine_similarity(
                        resume_embedding.embedding,
                        job_embedding.embedding
                    )
                    match_score = round(max(0, min(100, semantic_score * 100)), 1)
            except:
                pass
        
        result.append(JobListItem(
            job_id=job.job_id,
            title=job.title,
            company=job.company,
            application_status=job.application_status or "applied",
            resume_id=job.resume_id,
            posted_at=job.posted_at.isoformat() if job.posted_at else "",
            match_score=match_score,
        ))
    
    return result


@router.patch("/{job_id}/status", response_model=JobListItem)
async def update_job_status(
    job_id: int,
    status_update: JobStatusUpdate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update job application status (for drag and drop)."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.user_id == user.user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Validate status
    valid_statuses = ["applied", "interviewing", "offer_received", "rejected"]
    if status_update.application_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    job.application_status = status_update.application_status
    db.commit()
    db.refresh(job)
    
    # Get match score if resume is linked
    match_score = None
    if job.resume_id:
        try:
            from app.models import ResumeEmbedding
            resume_embedding = db.query(ResumeEmbedding).filter(
                ResumeEmbedding.resume_id == job.resume_id,
                ResumeEmbedding.section == "full"
            ).first()
            job_embedding = db.query(JobEmbedding).filter(
                JobEmbedding.job_id == job.job_id,
                JobEmbedding.section == "full"
            ).first()
            if resume_embedding and job_embedding and resume_embedding.embedding and job_embedding.embedding:
                semantic_score = embedding_service.cosine_similarity(
                    resume_embedding.embedding,
                    job_embedding.embedding
                )
                match_score = round(max(0, min(100, semantic_score * 100)), 1)
        except:
            pass
    
    return JobListItem(
        job_id=job.job_id,
        title=job.title,
        company=job.company,
        application_status=job.application_status,
        resume_id=job.resume_id,
        posted_at=job.posted_at.isoformat() if job.posted_at else "",
        match_score=match_score,
    )


@router.get("/{job_id}/details", response_model=JobDetail)
async def get_job_details(
    job_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get detailed job information including messages and suggestions."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    job = db.query(Job).filter(
        Job.job_id == job_id,
        Job.user_id == user.user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get match score if resume is linked
    match_score = None
    if job.resume_id:
        try:
            from app.models import ResumeEmbedding
            resume_embedding = db.query(ResumeEmbedding).filter(
                ResumeEmbedding.resume_id == job.resume_id,
                ResumeEmbedding.section == "full"
            ).first()
            job_embedding = db.query(JobEmbedding).filter(
                JobEmbedding.job_id == job.job_id,
                JobEmbedding.section == "full"
            ).first()
            if resume_embedding and job_embedding and resume_embedding.embedding and job_embedding.embedding:
                semantic_score = embedding_service.cosine_similarity(
                    resume_embedding.embedding,
                    job_embedding.embedding
                )
                match_score = round(max(0, min(100, semantic_score * 100)), 1)
        except:
            pass
    
    # Get recommendations (messages and suggestions)
    recruiter_message = None
    referral_message = None
    resume_suggestions = None
    
    if job.resume_id:
        recommendation = db.query(Recommendation).filter(
            Recommendation.job_id == job_id,
            Recommendation.resume_id == job.resume_id
        ).first()
        
        if recommendation:
            recruiter_message = recommendation.recruiter_message_text
            referral_message = recommendation.referral_message_text
            resume_suggestions = recommendation.improved_resume_json
    
    return JobDetail(
        job_id=job.job_id,
        title=job.title,
        company=job.company,
        description_text=job.description_text,
        application_status=job.application_status or "applied",
        resume_id=job.resume_id,
        posted_at=job.posted_at.isoformat() if job.posted_at else "",
        match_score=match_score,
        recruiter_message=recruiter_message,
        referral_message=referral_message,
        resume_suggestions=resume_suggestions,
    )

