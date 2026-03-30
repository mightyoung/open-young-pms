"""Permission middleware — JWT validation + user injection into request.state."""

from typing import Callable
from uuid import UUID

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware

SECRET_KEY = "pms-secret-key-change-in-production"
ALGORITHM = "HS256"

_bearer = HTTPBearer(auto_error=False)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {e}")


async def get_current_user_from_request(request: Request):
    """Extract user from Authorization header, validate JWT, and load from DB."""
    credentials: HTTPAuthorizationCredentials | None = await _bearer(request)
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    from api.services.fastapi_code_generator.database import get_sync_db
    from api.services.fastapi_code_generator.models import User
    db_gen = get_sync_db()
    db = next(db_gen)
    try:
        result = db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return result


class PermissionMiddleware(BaseHTTPMiddleware):
    """Inject user into request.state for every authenticated route."""

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
        except HTTPException:
            if request.url.path.startswith("/api/"):
                raise
            return await call_next(request)
        return await call_next(request)
