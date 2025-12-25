from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

from app.database import get_db
from app.routers import resume, job, message, user, auth, settings
from app.auth import verify_token

load_dotenv()

app = FastAPI(
    title="NextStep API",
    description="AI-powered job search and resume optimization platform",
    version="0.1.0",
)

# CORS configuration
# In development, allow common localhost ports
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

# Add any additional origins from environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(job.router, prefix="/api/job", tags=["job"])
app.include_router(message.router, prefix="/api/message", tags=["message"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

# Add match-score endpoint at /api/match-score (frontend expects this path)
from app.routers.job import get_match_score
app.add_api_route("/api/match-score", get_match_score, methods=["GET"], tags=["job"])


@app.get("/")
async def root():
    return {"message": "NextStep API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


