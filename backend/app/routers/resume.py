from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Bullet, ResumeEmbedding
from app.utils.resume_parser import parse_resume
from app.services.storage_service import storage_service
from app.services.embedding_service import embedding_service
from pydantic import BaseModel

router = APIRouter()


class ResumeUploadResponse(BaseModel):
    resume_id: int
    parse_summary: dict


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    resume: UploadFile = File(...),
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Upload and parse a resume file."""
    # Verify file type
    if not resume.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not (resume.filename.endswith(".pdf") or resume.filename.endswith(".docx")):
        raise HTTPException(
            status_code=400, detail="Only PDF and DOCX files are supported"
        )
    
    # Read file content
    file_content = await resume.read()
    
    if len(file_content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    try:
        # Parse resume
        parsed_data = parse_resume(file_content, resume.filename)
        
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
        
        # Generate unique file path
        file_path = f"{user.user_id}/{uuid.uuid4()}_{resume.filename}"
        
        # Upload to storage
        try:
            storage_url = storage_service.upload_file(file_content, file_path)
        except Exception as e:
            # If storage fails, we can still proceed with database storage
            print(f"Storage upload failed: {str(e)}")
            storage_url = file_path
        
        # Create resume record
        resume_record = Resume(
            user_id=user.user_id,
            file_path=storage_url,
            parsed_json=parsed_data,
            text_content=parsed_data.get("text_content", ""),
        )
        db.add(resume_record)
        db.commit()
        db.refresh(resume_record)
        
        # Create bullet records and generate embeddings
        if parsed_data.get("experience_bullets"):
            for idx, bullet_text in enumerate(parsed_data["experience_bullets"][:20]):
                try:
                    embedding = embedding_service.encode_single(bullet_text)
                    bullet = Bullet(
                        resume_id=resume_record.resume_id,
                        section="Work Experience",
                        text=bullet_text,
                        embedding=embedding,
                    )
                    db.add(bullet)
                except Exception as e:
                    print(f"Failed to create embedding for bullet {idx}: {str(e)}")
                    # Create bullet without embedding
                    bullet = Bullet(
                        resume_id=resume_record.resume_id,
                        section="Work Experience",
                        text=bullet_text,
                    )
                    db.add(bullet)
        
        # Create full resume embedding
        if parsed_data.get("text_content"):
            try:
                full_embedding = embedding_service.encode_single(parsed_data["text_content"][:5000])  # Limit to 5000 chars
                resume_embedding = ResumeEmbedding(
                    resume_id=resume_record.resume_id,
                    section="full",
                    embedding=full_embedding,
                )
                db.add(resume_embedding)
            except Exception as e:
                print(f"Failed to create full resume embedding: {str(e)}")
        
        db.commit()
        
        return ResumeUploadResponse(
            resume_id=resume_record.resume_id,
            parse_summary={
                "name": parsed_data.get("name"),
                "email": parsed_data.get("email"),
                "education_count": parsed_data.get("education_count", 0),
                "experience_count": parsed_data.get("experience_count", 0),
            },
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.post("/improve")
async def improve_resume(
    resume_id: int,
    job_id: int,
    ai_content_percentage: int = 50,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Generate improved resume suggestions."""
    from app.models import Job
    from app.services.llm_service import llm_service
    
    # Get resume and job
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
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
    
    # Get resume bullets
    bullets = db.query(Bullet).filter(
        Bullet.resume_id == resume_id,
        Bullet.section == "Work Experience"
    ).all()
    
    if not bullets:
        raise HTTPException(status_code=400, detail="No experience bullets found in resume")
    
    # Extract job requirements (simple keyword extraction)
    job_text = job.description_text.lower()
    # This is a simple extraction - in production, use better NLP
    job_requirements = []
    common_skills = ["python", "javascript", "java", "react", "aws", "docker", "kubernetes", "sql", "machine learning", "data science"]
    for skill in common_skills:
        if skill in job_text:
            job_requirements.append(skill.title())
    
    # Determine how many bullets to improve based on percentage
    num_to_improve = max(1, int(len(bullets) * (ai_content_percentage / 100)))
    bullets_to_improve = bullets[:num_to_improve]
    
    improvements = []
    for bullet in bullets_to_improve:
        try:
            improved_text = await llm_service.improve_resume_bullet(
                bullet.text,
                job_requirements,
                job.title,
            )
            improvements.append({
                "original_bullet": bullet.text,
                "improved_bullet": improved_text,
            })
        except Exception as e:
            print(f"Error improving bullet: {str(e)}")
            # Include original if improvement fails
            improvements.append({
                "original_bullet": bullet.text,
                "improved_bullet": bullet.text,
            })
    
    # Optionally generate new bullets if percentage is high
    new_bullets = []
    if ai_content_percentage > 50 and job_requirements:
        # Generate 1-2 new bullets based on missing skills
        try:
            # This is a simplified version - in production, be more careful
            new_bullet_prompt = f"Generate a professional resume bullet point for someone with experience in {', '.join(job_requirements[:3])}. Keep it realistic and professional."
            new_bullet = await llm_service.generate_text(new_bullet_prompt, max_tokens=100)
            if new_bullet:
                new_bullets.append(new_bullet.strip())
        except Exception as e:
            print(f"Error generating new bullet: {str(e)}")
    
    return {
        "resume_id": resume_id,
        "improvements": improvements,
        "new_bullets": new_bullets,
    }

