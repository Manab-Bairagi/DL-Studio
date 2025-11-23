"""
Dependencies for API endpoints
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.core.security import decode_access_token
from backend.db.models import User
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Debug: Log token received
    print(f"DEBUG: Token received (first 30 chars): {token[:30] if token else 'None'}...")
    
    payload = decode_access_token(token)
    if payload is None:
        print("DEBUG: Token decode failed - payload is None")
        raise credentials_exception
    
    print(f"DEBUG: Token decoded successfully. Payload: {payload}")
    
    email: str = payload.get("sub")
    if email is None:
        print("DEBUG: Email not found in token payload")
        raise credentials_exception
    
    print(f"DEBUG: Looking up user with email: {email}")
    user = await User.find_one(User.email == email)
    if user is None:
        print(f"DEBUG: User not found in database for email: {email}")
        raise credentials_exception
    
    print(f"DEBUG: User found: {user.email}")
    return user

def validate_object_id(id_str: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
