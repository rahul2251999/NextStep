from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.auth import verify_token
from app.models import User, Resume, Job
from app.services.llm_service import llm_service

router = APIRouter()


class RecruiterMessageRequest(BaseModel):
    resume_id: int
    job_id: int
    recipient_name: str = None
    recipient_email: str = None


class MessageResponse(BaseModel):
    message: str
    email_sent: bool = False


@router.post("/recruiter", response_model=MessageResponse)
async def generate_recruiter_message(
    request: RecruiterMessageRequest,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Generate a LinkedIn message for a recruiter."""
    # Get user
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get resume and job
    resume = db.query(Resume).filter(
        Resume.resume_id == request.resume_id,
        Resume.user_id == user.user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    job = db.query(Job).filter(
        Job.job_id == request.job_id,
        Job.user_id == user.user_id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create candidate summary from resume
    parsed_data = resume.parsed_json or {}
    candidate_summary = f"Professional with experience in {parsed_data.get('sections', {}).get('experience', 'various roles')[:200]}"
    
    if parsed_data.get("experience_count"):
        candidate_summary += f" ({parsed_data['experience_count']} positions)"
    
    try:
        message = await llm_service.generate_recruiter_message(
            candidate_summary=candidate_summary,
            job_title=job.title,
            company=job.company or "the company",
            recipient_name=request.recipient_name,
        )
        
        # Send email if recipient email is provided
        email_sent = False
        if request.recipient_email:
            subject = f"Application for {job.title} at {job.company or 'your company'}"
            email_sent = send_email(
                to_email=request.recipient_email,
                subject=subject,
                body=message,
                from_email=user.email,
            )
        
        return MessageResponse(message=message, email_sent=email_sent)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate message: {str(e)}"
        )


def send_email(to_email: str, subject: str, body: str, from_email: str = None) -> bool:
    """Send email using SMTP or email service."""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import os
    
    # Get email configuration from environment
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    email_from = from_email or smtp_user or os.getenv("EMAIL_FROM", "noreply@nextstep.com")
    
    if not smtp_user or not smtp_password:
        print("Email not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg["From"] = email_from
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        
        # Send email
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

