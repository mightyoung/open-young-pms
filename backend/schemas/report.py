"""Report schemas."""

import json
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from schemas.forum import UserBrief


class ReportCreate(BaseModel):
    title: str
    content: dict = Field(default_factory=dict)
    type: str = Field(..., pattern="^(daily|weekly|monthly)$")
    project_id: str


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[dict] = None


class ReportResponse(BaseModel):
    id: str
    title: str
    content: dict
    type: str
    project_id: str
    author: UserBrief
    status: str
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[UserBrief] = None
    approval_comment: Optional[str] = None
    created_at: datetime

    @classmethod
    def from_orm_with_author(cls, report, author: UserBrief, approver: Optional[UserBrief] = None):
        content = {}
        if report.content:
            try:
                content = json.loads(report.content) if isinstance(report.content, str) else report.content
            except Exception:
                content = {}
        return cls(
            id=report.id,
            title=report.title,
            content=content,
            type=report.type,
            project_id=report.project_id,
            author=author,
            status=report.status,
            submitted_at=report.submitted_at,
            approved_at=report.approved_at,
            approved_by=approver,
            approval_comment=report.approval_comment,
            created_at=report.created_at,
        )


class ReportStats(BaseModel):
    total_count: int
    draft_count: int
    submitted_count: int
    approved_count: int
    rejected_count: int
    by_type: dict


class ReportGenerateRequest(BaseModel):
    project_id: str
    date: Optional[date] = None
    week_start: Optional[date] = None
