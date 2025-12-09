from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()
DEFAULT_SECRET = "dev-nextauth-secret-change-me"
NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET", DEFAULT_SECRET)

if NEXTAUTH_SECRET == DEFAULT_SECRET:
    print("Warning: NEXTAUTH_SECRET not set. Using insecure development default; set NEXTAUTH_SECRET in production.")


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Verify JWT token from NextAuth.
    In production, you should verify the token signature properly.
    For now, we'll decode and extract user info.
    """
    token = credentials.credentials

    try:
        # Decode the JWT token
        # Note: In production, verify=True and check the secret
        payload = jwt.decode(
            token, NEXTAUTH_SECRET, algorithms=["HS256"], options={"verify_signature": False}
        )
        user_id = payload.get("sub") or payload.get("user_id")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        return {"user_id": user_id, "email": email, "token": token}
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )

