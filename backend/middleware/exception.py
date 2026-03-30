from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from schemas.error_code import ErrorCode


class ApiException(HTTPException):
    """API 异常"""
    def __init__(self, code: int, message: str, **kwargs):
        super().__init__(
            status_code=200,
            headers={"X-Error-Code": str(code)},
            detail=message
        )
        self.code = code
        self.message = message

    @classmethod
    def from_error_code(cls, error_code: ErrorCode, message: str = None) -> "ApiException":
        return cls(code=error_code.code, message=message or error_code.message)


async def api_exception_handler(request: Request, exc: ApiException):
    return JSONResponse(
        status_code=200,
        content={
            "code": exc.code,
            "message": exc.message,
            "request_id": request.state.request_id if hasattr(request.state, "request_id") else None
        }
    )
