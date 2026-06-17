"""全局异常处理器 + 请求 ID 中间件"""

import logging
import uuid
import traceback

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from api.exceptions import (
    ERR_INTERNAL,
)
from api.response import ApiResponse, BusinessException

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """请求 ID 中间件 — 为每个请求生成唯一 ID"""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """全局异常处理器"""
    req_id = getattr(request.state, "request_id", "unknown")
    tb = traceback.format_exc()
    logger.error("Unhandled request error request_id=%s error=%s", req_id, exc)
    logger.debug("Unhandled request traceback request_id=%s\n%s", req_id, tb)

    if isinstance(exc, BusinessException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=ApiResponse.error(exc.code, exc.message, exc.detail).model_dump(),
            headers={"X-Request-ID": req_id},
        )

    # FastAPI 内置 HTTPException
    from fastapi import HTTPException

    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ApiResponse.error(
                "D0103" if exc.status_code == 400 else "E0101",
                exc.detail,
            ).model_dump(),
            headers={"X-Request-ID": req_id},
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ApiResponse.error(ERR_INTERNAL, "服务器内部错误", str(exc)).model_dump(),
        headers={"X-Request-ID": req_id},
    )
