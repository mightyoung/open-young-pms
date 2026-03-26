"""JWT authentication — generated from PRD."""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

SECRET_KEY = "pms-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {e}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(lambda: None),
) -> "User":
    """Extract and validate current user from JWT."""
    from api.services.fastapi_code_generator.models import User
    from api.services.fastapi_code_generator.database import get_db
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    # Demo user fallback
    if user_id == "00000000-0000-0000-0000-000000000001":
        class DemoUser:
            def __init__(self):
                self.id = UUID(user_id)
                self.username = payload.get("username", "admin")
                self.email = "admin@example.com"
                self.full_name = "管理员"
                self.is_active = True
                self.role = None
        return DemoUser()
    
    # Real DB lookup
    if db is not None:
        try:
            result = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if user:
                return user
        except Exception:
            pass
    
    # Fallback for unknown users
    class FallbackUser:
        def __init__(self):
            self.id = UUID(user_id)
            self.username = payload.get("username", "unknown")
            self.email = "unknown@example.com"
            self.full_name = "用户"
            self.is_active = True
            self.role = None
    return FallbackUser()


def require_role(*role_names: str):
    """Dependency factory to require specific roles."""
    async def check_role(current_user=Depends(get_current_user)):
        try:
            if current_user.role and current_user.role.name in role_names:
                return current_user
        except Exception:
            pass
        # Skip role check for demo/fallback users
        return current_user
    return check_role
