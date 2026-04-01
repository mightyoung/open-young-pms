"""Pydantic schemas — generated from PRD."""

from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ── Auth ──────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    label: str


# ── Project Management ────────────────────────────────────────


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    department_id: UUID


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    code: str
    description: Optional[str]
    status: str
    budget: Optional[float]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    department_id: UUID
    manager_id: Optional[UUID]
    created_at: datetime


class PhaseCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PhaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    project_id: UUID
    name: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: str


class TaskCreate(BaseModel):
    phase_id: UUID
    parent_task_id: Optional[UUID] = None
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    priority: str = "medium"
    assignee_id: Optional[UUID] = None
    estimated_hours: Optional[float] = None
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[UUID] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    phase_id: UUID
    parent_task_id: Optional[UUID]
    title: str
    description: Optional[str]
    priority: str
    status: str
    assignee_id: Optional[UUID]
    estimated_hours: Optional[float]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime


# ── Hazard Reporting (随手拍) ─────────────────────────────────


class HazardReportCreate(BaseModel):
    project_id: Optional[UUID] = None
    hazard_type: str = Field(..., pattern="^(safety|quality|environment)$")
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1, max_length=300)
    photos: list[str] = Field(default_factory=list)
    urgency: str = "normal"


class HazardAssignRequest(BaseModel):
    assigned_to_id: UUID
    comment: Optional[str] = None


class HazardConfirmRequest(BaseModel):
    level: str = Field(..., pattern="^(general|major)$")
    factor: str = Field(..., pattern="^(human|equipment|environment|management)$")
    hazard_type: str


class HazardPushRequest(BaseModel):
    handler_id: UUID
    dept_admin_id: UUID
    due_date: datetime
    requirement: Optional[str] = None


class HazardTransferRequest(BaseModel):
    to_user_id: UUID
    reason: str = Field(..., min_length=1)


class RectificationSubmitRequest(BaseModel):
    photos: list[str] = Field(default_factory=list)
    notes: Optional[str] = None


class HazardReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    project_id: Optional[UUID]
    hazard_type: str
    urgency: str
    level: Optional[str]
    factor: Optional[str]
    title: str
    description: str
    location: str
    photos: list
    status: str
    assigned_to_id: Optional[UUID]
    reporter_id: UUID
    created_at: datetime


class RectificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    handler_id: UUID
    due_date: datetime
    status: str
    acceptance_status: Optional[str]
    created_at: datetime


# ── Inspection ───────────────────────────────────────────────


class InspectionPointCreate(BaseModel):
    project_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=300)
    frequency: str = "daily"


class InspectionSubmitRequest(BaseModel):
    point_id: UUID
    result: str = Field(..., pattern="^(ok|issue_found|skipped)$")
    notes: Optional[str] = None
    photos: list[str] = Field(default_factory=list)


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    point_id: UUID
    result: str
    notes: Optional[str]
    photos: list
    inspected_at: datetime


# ── Reports ──────────────────────────────────────────────────


class ReportCreate(BaseModel):
    project_id: UUID
    type: str = Field(..., pattern="^(daily|weekly|monthly)$")
    period_start: datetime
    period_end: datetime
    content: dict = Field(default_factory=dict)
    attachments: list[str] = Field(default_factory=list)


# ── Notifications ─────────────────────────────────────────────


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    type: str
    title: str
    content: str
    entity_type: Optional[str]
    entity_id: Optional[UUID]
    is_read: bool
    created_at: datetime


# ── Paginated Response ───────────────────────────────────────


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
    pages: int


UserResponse.model_rebuild()
ProjectResponse.model_rebuild()
HazardReportResponse.model_rebuild()


# ===== 质量管理 =====
class QualityStandardCreate(BaseModel):
    code: str
    name: str
    category: Optional[str] = None
    pass_score: int = 80
    check_items: Optional[list] = None
    description: Optional[str] = None


class QualityStandardUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    pass_score: Optional[int] = None
    check_items: Optional[list] = None
    description: Optional[str] = None


class QualityInspectionCreate(BaseModel):
    project_id: str
    standard_id: str
    inspector_id: str
    score: Optional[int] = None
    result: Optional[str] = None
    findings: Optional[list] = None
    photo_urls: Optional[list] = None


# ===== 合同管理 =====
class ContractCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    party_a: Optional[str] = None
    party_b: Optional[str] = None
    amount: Optional[float] = None
    sign_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "draft"
    file_url: Optional[str] = None


class ContractUpdate(BaseModel):
    name: Optional[str] = None
    party_a: Optional[str] = None
    party_b: Optional[str] = None
    amount: Optional[float] = None
    sign_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    file_url: Optional[str] = None


# ===== 风险管理 =====
class RiskCreate(BaseModel):
    project_id: Optional[str] = None
    title: str
    category: Optional[str] = None
    probability: Optional[str] = None
    impact: Optional[str] = None
    level: Optional[str] = None
    mitigation: Optional[str] = None
    contingency: Optional[str] = None
    owner_id: Optional[str] = None


class RiskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    probability: Optional[str] = None
    impact: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = None
    mitigation: Optional[str] = None
    contingency: Optional[str] = None
    owner_id: Optional[str] = None


class ResourceItemCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    type: Optional[str] = None
    quantity: int = 1
    unit: Optional[str] = None
    location: Optional[str] = None


class ResourceItemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None


# ===== 通知设置 =====
class NotificationSettingCreate(BaseModel):
    hazard_report: bool = True
    approval_update: bool = True
    task_assignment: bool = True
    task_comment: bool = True
    weekly_report: bool = True
    mentioned_me: bool = True


class NotificationSettingUpdate(BaseModel):
    hazard_report: Optional[bool] = None
    approval_update: Optional[bool] = None
    task_assignment: Optional[bool] = None
    task_comment: Optional[bool] = None
    weekly_report: Optional[bool] = None
    mentioned_me: Optional[bool] = None
