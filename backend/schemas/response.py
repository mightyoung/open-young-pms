from pydantic import BaseModel, ConfigDict, Field
from typing import Generic, TypeVar, Optional
from datetime import datetime

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一 API 响应格式"""

    code: int = 0
    message: str = "success"
    data: Optional[T] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    request_id: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={"example": {"code": 0, "message": "success", "data": {}, "timestamp": "2026-03-30T10:00:00"}}
    )

    @classmethod
    def ok(cls, data: T = None, message: str = "success") -> "ApiResponse[T]":
        return cls(code=0, message=message, data=data)

    @classmethod
    def error(cls, code: int, message: str, data: dict = None) -> "ApiResponse":
        return cls(code=code, message=message, data=data)


class PageResult(BaseModel, Generic[T]):
    """分页响应"""

    items: list[T]
    total: int
    page: int
    page_size: int
    has_more: bool

    model_config = ConfigDict(
        json_schema_extra={"example": {"items": [], "total": 0, "page": 1, "page_size": 20, "has_more": False}}
    )
