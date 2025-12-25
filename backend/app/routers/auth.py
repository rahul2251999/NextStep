from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from app.database import get_db
from app.models import User

load_dotenv()

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEFAULT_SECRET = "dev-nextauth-secret-change-me"
JWT_SECRET = os.getenv("NEXTAUTH_SECRET", DEFAULT_SECRET)
if JWT_SECRET == DEFAULT_SECRET:
    print("Warning: NEXTAUTH_SECRET not set. Using insecure development default; set NEXTAUTH_SECRET for production tokens.")
JWT_ALGORITHM = "HS256"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a JWT token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user."""
    try:
        # Validate email
        if not user_data.email or not user_data.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required",
            )
        
        # Validate password
        if not user_data.password or len(user_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters",
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email.strip().lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create new user
        print(f"Hashing password of length: {len(user_data.password)}")
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email.strip().lower(),
            name=user_data.name.strip() if user_data.name else None,
            auth_provider_id=hashed_password,  # Store hash as provider ID for custom auth
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create JWT token
        token_data = {
            "sub": str(user.user_id),
            "email": user.email,
            "name": user.name,
        }
        token = create_access_token(token_data)
        
        return AuthResponse(
            token=token,
            user={
                "id": user.user_id,
                "email": user.email,
                "name": user.name,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """Login with email and password."""
    try:
        # Validate input
        if not login_data.email or not login_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )
        
        # Find user (case-insensitive email lookup)
        user = db.query(User).filter(User.email == login_data.email.strip().lower()).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Check if user has a password set
        if not user.auth_provider_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Verify password (stored in auth_provider_id for custom auth)
        if not verify_password(login_data.password, user.auth_provider_id):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Create JWT token
        token_data = {
            "sub": str(user.user_id),
            "email": user.email,
            "name": user.name,
        }
        token = create_access_token(token_data)
        
        return AuthResponse(
            token=token,
            user={
                "id": user.user_id,
                "email": user.email,
                "name": user.name,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )
