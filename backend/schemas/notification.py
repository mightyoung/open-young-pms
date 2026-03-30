"""通知 Pydantic schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    content: Optional[str]
    data: dict
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime


class NotificationSettingUpdate(BaseModel):
    issue_assign: Optional[bool] = None
    issue_verify: Optional[bool] = None
    reply_like: Optional[bool] = None
    mention: Optional[bool] = None
    approval: Optional[bool] = None
    system: Optional[bool] = None
    in_app: Optional[bool] = None
    email: Optional[bool] = None
    push: Optional[bool] = None


class NotificationSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    issue_assign: bool
    issue_verify: bool
    reply_like: bool
    mention: bool
    approval: bool
    system: bool
    in_app: bool
    email: bool
    push: bool


class UnreadCountResponse(BaseModel):
    unread_count: int
