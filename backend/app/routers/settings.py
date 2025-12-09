from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.auth import verify_token
from app.models import User, UserSettings

router = APIRouter()


class SettingsUpdate(BaseModel):
    ai_provider: str
    api_key: Optional[str] = None
    model_preference: Optional[str] = None


class SettingsResponse(BaseModel):
    ai_provider: str
    api_key_masked: Optional[str] = None
    model_preference: Optional[str] = None


@router.get("/", response_model=SettingsResponse)
async def get_settings(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get user settings."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.user_id).first()
    
    if not settings:
        # Return defaults with best models
        return SettingsResponse(
            ai_provider="openai",
            model_preference="gpt-4-turbo-preview"
        )
    
    # Mask API key for security
    masked_key = None
    if settings.api_key:
        if len(settings.api_key) > 8:
            masked_key = f"{settings.api_key[:4]}...{settings.api_key[-4:]}"
        else:
            masked_key = "********"
            
    return SettingsResponse(
        ai_provider=settings.ai_provider,
        api_key_masked=masked_key,
        model_preference=settings.model_preference,
    )


@router.put("/", response_model=SettingsResponse)
async def update_settings(
    settings_update: SettingsUpdate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update user settings."""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=user.user_id)
        db.add(settings)
    
    settings.ai_provider = settings_update.ai_provider
    if settings_update.api_key:
        settings.api_key = settings_update.api_key
    if settings_update.model_preference:
        settings.model_preference = settings_update.model_preference
        
    db.commit()
    db.refresh(settings)
    
    # Mask API key for response
    masked_key = None
    if settings.api_key:
        if len(settings.api_key) > 8:
            masked_key = f"{settings.api_key[:4]}...{settings.api_key[-4:]}"
        else:
            masked_key = "********"
            
    return SettingsResponse(
        ai_provider=settings.ai_provider,
        api_key_masked=masked_key,
        model_preference=settings.model_preference,
    )
