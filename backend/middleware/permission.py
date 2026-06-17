"""Permission middleware — JWT validation + user injection into request.state."""

from typing import Callable

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware

from api.services.fastapi_code_generator.auth import resolve_user, set_cached_user

_bearer = HTTPBearer(auto_error=False)


class PermissionMiddleware(BaseHTTPMiddleware):
    """Inject user into request.state and cache for every authenticated route.

    On successful auth: sets request.state.user and caches in _cached_user ContextVar
    so that get_current_user() dependency can reuse without re-decoding JWT or re-querying DB.

    Raises 401 for /api/* routes on auth failure (backward-compatible protection for
    routes that don't explicitly declare Depends(get_current_user)).
    """

    EXEMPT_PATHS = {
        "/",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/health",
    }

    async def dispatch(self, request: Request, call_next: Callable):
        if request.url.path in self.EXEMPT_PATHS or request.url.path.startswith("/uploads"):
            return await call_next(request)

        try:
            credentials: HTTPAuthorizationCredentials | None = await _bearer(request)
            if not credentials:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

            from api.services.fastapi_code_generator.database import get_db

            # Use the single canonical resolve_user() — no duplicate JWT decode + DB lookup
            async for db in get_db():
                try:
                    user = await resolve_user(credentials.credentials, db)
                    request.state.user = user
                    set_cached_user(user)
                finally:
                    await db.close()
                break
        except HTTPException:
            if request.url.path.startswith("/api/"):
                raise
            return await call_next(request)

        return await call_next(request)
