"""审计日志 Pydantic Schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UserBrief(BaseModel):
    id: str
    username: str
    full_name: str


class AuditLogResponse(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: str
    operator: UserBrief
    detail: dict
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime


class AuditLogSearch(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    operator_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action: Optional[str] = None
    page: int = 1
    page_size: int = 20


class AuditLogDetail(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: str
    operator: UserBrief
    detail: dict
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime


class UserActivityItem(BaseModel):
    id: str
    action: str
    resource_type: str
    resource_id: str
    detail: dict
    created_at: datetime


class ResourceHistoryItem(BaseModel):
    id: str
    action: str
    operator: UserBrief
    detail: dict
    created_at: datetime
