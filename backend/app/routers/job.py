from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.auth import verify_token
from app.models import User, Job, JobEmbedding
from app.services.embedding_service import embedding_service

router = APIRouter()


class JobSubmitRequest(BaseModel):
    job_title: str
    company: str
    description: str


class JobSubmitResponse(BaseModel):
    job_id: int
    status: str


@router.post("/submit", response_model=JobSubmitResponse)
async def submit_job(
    job_data: JobSubmitRequest,
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

