from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.auth import verify_token
from app.models import User, UserSettings
from app.services.llm_service import llm_service

router = APIRouter()


class SettingsUpdate(BaseModel):
    ai_provider: str
    api_key: Optional[str] = None
    model_preference: Optional[str] = None


class TestConnectionRequest(BaseModel):
    ai_provider: str
    api_key: str
    model_preference: str


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


@router.post("/test")
async def test_connection(
    test_request: TestConnectionRequest,
    current_user: dict = Depends(verify_token),
):
    """Test the AI provider connection with the provided credentials."""
    try:
        # Test the connection by making a simple API call
        test_prompt = "Say 'Connection successful' if you can read this."
        response = await llm_service.generate_text(
            prompt=test_prompt,
            system_prompt="You are a helpful assistant.",
            max_tokens=50,
            provider=test_request.ai_provider,
            api_key=test_request.api_key,
            model=test_request.model_preference,
        )
        
        if response and len(response.strip()) > 0:
            return {
                "success": True,
                "message": "Connection successful! Your API key is working correctly."
            }
        else:
            return {
                "success": False,
                "error": "Connection test failed: No response from API"
            }
    except ValueError as e:
        # Missing API key or invalid provider
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        # API error (invalid key, network issue, etc.)
        error_msg = str(e)
        if "API key" in error_msg or "authentication" in error_msg.lower() or "unauthorized" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="Invalid API key. Please check your credentials."
            )
        elif "rate limit" in error_msg.lower() or "quota" in error_msg.lower():
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Connection failed: {error_msg}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
