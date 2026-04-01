"""JWT authentication — strict mode: no demo/fallback users."""

import os
from contextvars import ContextVar
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.database import get_db

SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", ""))
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET or JWT_SECRET_KEY environment variable must be set")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Caches the authenticated user from PermissionMiddleware for reuse by get_current_user,
# avoiding a redundant JWT decode + DB query on every authenticated request.
_cached_user: ContextVar[Optional["User"]] = ContextVar("cached_user", default=None)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {e}")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def set_cached_user(user: "User") -> None:
    """Called by PermissionMiddleware after successfully loading the user."""
    _cached_user.set(user)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> "User":
    """Extract and validate current user from JWT.

    Short-circuits using the user cached by PermissionMiddleware when available,
    avoiding a redundant JWT decode + DB query on every authenticated request.

    Raises 401 if token is invalid or user does not exist in database.
    No demo/fallback users — authentication must be explicit.
    """
    from api.services.fastapi_code_generator.models import User

    # Fast path: user was already loaded by PermissionMiddleware
    cached = _cached_user.get()
    if cached is not None:
        return cached

    # Slow path: decode and validate
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    try:
        result = await db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"User lookup failed: {e}")

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_role(*role_names: str):
    """Dependency factory to require specific roles.

    Raises 403 if the authenticated user lacks the required role.
    No fallback — all unauthenticated or unauthorized requests are rejected.
    """

    async def check_role(current_user=Depends(get_current_user)):
        if not hasattr(current_user, "role") or current_user.role is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No role assigned")
        role_value = getattr(current_user.role, "name", None) or getattr(current_user.role, "value", None)
        if role_value not in role_names:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return check_role
