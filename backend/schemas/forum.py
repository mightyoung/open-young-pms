from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class UserBrief(BaseModel):
    id: str
    username: str
    full_name: str

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    content: str
    project_id: Optional[str] = None


class ReplyCreate(BaseModel):
    content: str
    reply_to_id: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    title: str
    content: str
    author: UserBrief
    project_id: Optional[str]
    is_pinned: bool
    is_essence: bool
    view_count: int
    like_count: int
    reply_count: int
    is_liked: bool
    is_favorited: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ReplyResponse(BaseModel):
    id: str
    content: str
    author: UserBrief
    reply_to_id: Optional[str]
    mentioned_users: List[UserBrief]
    created_at: datetime

    class Config:
        from_attributes = True
