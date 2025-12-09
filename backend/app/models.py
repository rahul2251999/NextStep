from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    auth_provider_id = Column(String, nullable=True)  # Stores password hash for custom auth
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resumes = relationship("Resume", back_populates="user")
    jobs = relationship("Job", back_populates="user")


class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    file_path = Column(String, nullable=False)
    parsed_json = Column(JSONB, nullable=True)
    text_content = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resumes")
    bullets = relationship("Bullet", back_populates="resume")
    resume_embeddings = relationship("ResumeEmbedding", back_populates="resume")


class Bullet(Base):
    __tablename__ = "bullets"

    bullet_id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"), nullable=False)
    section = Column(String, nullable=False)  # e.g., "Work Experience", "Education"
    text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=True)  # For E5-large (768 dims)

    resume = relationship("Resume", back_populates="bullets")


class ResumeEmbedding(Base):
    __tablename__ = "resume_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"), nullable=False)
    section = Column(String, nullable=False)  # e.g., "full", "experience", "skills"
    embedding = Column(Vector(768), nullable=False)

    resume = relationship("Resume", back_populates="resume_embeddings")


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    description_text = Column(Text, nullable=False)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="jobs")
    job_embeddings = relationship("JobEmbedding", back_populates="job")


class JobEmbedding(Base):
    __tablename__ = "job_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    section = Column(String, nullable=False)  # e.g., "full", "requirements"
    embedding = Column(Vector(768), nullable=False)

    job = relationship("Job", back_populates="job_embeddings")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"), nullable=False)
    improved_resume_json = Column(JSONB, nullable=True)
    recruiter_message_text = Column(Text, nullable=True)
    referral_message_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


