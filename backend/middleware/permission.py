"""Permission middleware — JWT validation + user injection into request.state."""

import os
from typing import Callable

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from starlette.middleware.base import BaseHTTPMiddleware

from api.services.fastapi_code_generator.auth import set_cached_user

SECRET_KEY = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", ""))
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET or JWT_SECRET_KEY environment variable must be set")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

_bearer = HTTPBearer(auto_error=False)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {e}")


async def get_current_user_from_request(request: Request):
    """Extract user from Authorization header, validate JWT, and load from DB.

    Uses the same database as the business layer (not a separate SQLite).
    Raises 401 if token is invalid or user does not exist.
    """
    credentials: HTTPAuthorizationCredentials | None = await _bearer(request)
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    from api.services.fastapi_code_generator.database import get_db
    from api.services.fastapi_code_generator.models import User
    from uuid import UUID

    async for db in get_db():
        try:
            result = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
            return user
        finally:
            await db.close()


class PermissionMiddleware(BaseHTTPMiddleware):
    """Inject user into request.state and cache for every authenticated route.

    On successful auth: sets request.state.user and caches in _cached_user ContextVar
    so that get_current_user() dependency can reuse without re-decoding JWT or re-querying DB.

    Raises 401 for /api/* routes on auth failure (backward-compatible protection for
    routes that don't explicitly declare Depends(get_current_user)).
    """

    EXEMPT_PATHS = {
        "/", "/docs", "/openapi.json", "/redoc",
        "/api/v1/auth/login", "/api/v1/auth/register",
        "/health",
    }

    async def dispatch(self, request: Request, call_next: Callable):
        if request.url.path in self.EXEMPT_PATHS or request.url.path.startswith("/uploads"):
            return await call_next(request)

        try:
            user = await get_current_user_from_request(request)
            request.state.user = user
            set_cached_user(user)  # enable get_current_user dependency to short-circuit
        except HTTPException:
            if request.url.path.startswith("/api/"):
                raise
            return await call_next(request)

        return await call_next(request)
