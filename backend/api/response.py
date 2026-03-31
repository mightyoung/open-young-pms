"""统一 API 响应格式 — 所有接口统一使用此格式返回"""
from datetime import datetime, timezone
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一响应格式：code/message/data/timestamp/request_id"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    code: str = "A0000"
    message: str = "操作成功"
    data: Optional[T] = None
    timestamp: str = ""
    request_id: Optional[str] = None

    @classmethod
    def ok(cls, data: T = None, message: str = "操作成功") -> "ApiResponse[T]":
        return cls(
            code="A0000",
            message=message,
            data=data,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
        )

    @classmethod
    def error(cls, code: str, message: str, detail: str = "") -> "ApiResponse":
        return cls(
            code=code,
            message=message,
            data={"detail": detail} if detail else None,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
        )


class PaginatedResponse(BaseModel, Generic[T]):
    """统一分页响应"""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    code: str = "A0000"
    message: str = "查询成功"
    items: list[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
    timestamp: str = ""

    @classmethod
    def ok(
        cls,
        items: list[T],
        total: int,
        page: int = 1,
        page_size: int = 20,
    ) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            pages=(total + page_size - 1) // page_size,
            timestamp=datetime.now(timezone.utc).isoformat() + "Z",
        )


class BusinessException(Exception):
    """业务异常（对应错误码 B 类）"""

    def __init__(self, code: str, message: str, detail: str = ""):
        self.code = code
        self.message = message
        self.detail = detail
        super().__init__(message)
