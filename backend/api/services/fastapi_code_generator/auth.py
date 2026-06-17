"""JWT authentication — strict mode: no demo/fallback users.

Single canonical user resolution:
- resolve_user() — core JWT decode + DB lookup (shared by middleware and dependency)
- get_current_user() — dependency with ContextVar fast path (middleware sets cache)
- set_cached_user() / _cached_user — in-request cache populated by middleware
"""

import os
from contextvars import ContextVar
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.database import get_db

SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", ""))
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET or JWT_SECRET_KEY environment variable must be set")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

security = HTTPBearer()

# In-request cache — PermissionMiddleware populates this after resolving the user.
# get_current_user() checks this first to avoid redundant decode + DB query.
_cached_user: ContextVar[Optional["User"]] = ContextVar("cached_user", default=None)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {e}")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def set_cached_user(user: "User") -> None:
    """Called by PermissionMiddleware after successfully resolving the user."""
    _cached_user.set(user)


async def resolve_user(token: str, db: AsyncSession) -> "User":
    """Core user resolution: decode JWT + load from DB.

    This is the single implementation of JWT->user resolution.
    Used by both PermissionMiddleware and get_current_user() slow path.
    """
    from api.services.fastapi_code_generator.models import User

    payload = decode_token(token)
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


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> "User":
    """Extract and validate current user from JWT.

    Fast path: user was already resolved by PermissionMiddleware and cached.
    Slow path: calls resolve_user() to decode JWT and query DB.

    Raises 401 if token is invalid or user does not exist in database.
    No demo/fallback users — authentication must be explicit.
    """
    cached = _cached_user.get()
    if cached is not None:
        return cached

    return await resolve_user(credentials.credentials, db)


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
