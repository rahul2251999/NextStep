from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Job, Recommendation

router = APIRouter()


@router.get("/history")
async def get_user_history(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get user's history of resumes, jobs, and recommendations."""
    # Get user
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get resumes
    resumes = db.query(Resume).filter(Resume.user_id == user.user_id).all()
    
    # Get jobs
    jobs = db.query(Job).filter(Job.user_id == user.user_id).all()
    
    # Get recommendations
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == user.user_id
    ).order_by(Recommendation.created_at.desc()).limit(10).all()
    
    return {
        "resumes": [
            {
                "resume_id": r.resume_id,
                "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            }
            for r in resumes
        ],
        "jobs": [
            {
                "job_id": j.job_id,
                "title": j.title,
                "company": j.company,
                "posted_at": j.posted_at.isoformat() if j.posted_at else None,
            }
            for j in jobs
        ],
        "recommendations": [
            {
                "id": rec.id,
                "job_id": rec.job_id,
                "resume_id": rec.resume_id,
                "created_at": rec.created_at.isoformat() if rec.created_at else None,
            }
            for rec in recommendations
        ],
    }

