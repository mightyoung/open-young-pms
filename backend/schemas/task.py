"""WBS任务 Pydantic Schemas."""
from datetime import datetime, date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class UserBrief(BaseModel):
    id: str
    username: str
    full_name: str


class TaskCreate(BaseModel):
    project_id: UUID
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    assignee_id: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed|cancelled)$")
    progress: Optional[int] = Field(None, ge=0, le=100)
    assignee_id: Optional[UUID] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str]
    wbs_code: Optional[str]
    level: int
    progress: int
    status: str
    planned_start: Optional[datetime]
    planned_end: Optional[datetime]
    assignee: Optional[UserBrief]
    children: list["TaskResponse"] = []
    created_at: datetime


class GanttTask(BaseModel):
    id: str
    title: str
    wbs_code: str
    level: int
    planned_start: Optional[datetime]
    planned_end: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    progress: int
    status: str
    assignee: Optional[UserBrief]
    dependencies: list[str] = []


class KanbanColumnData(BaseModel):
    tasks: list[TaskResponse]
    count: int


class KanbanBoard(BaseModel):
    columns: dict[str, KanbanColumnData]


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: str
    content: str
    author: UserBrief
    created_at: datetime
