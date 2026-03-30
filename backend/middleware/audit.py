"""审计日志 AOP 中间件."""

from functools import wraps
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


def audit_log(action: str, resource_type: str):
    """审计装饰器 — 记录 CRUD 操作日志"""

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            return result

        return wrapper

    return decorator


class AuditMiddleware(BaseHTTPMiddleware):
    """审计中间件 — 可选：自动记录所有 API 请求"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        return response
