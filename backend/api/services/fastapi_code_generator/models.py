import uuid
from uuid import uuid4
from api.services.fastapi_code_generator.database import GUID
from api.services.fastapi_code_generator.database import Base

"""SQLAlchemy database models — generated from PRD."""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer,
    JSON, Numeric, String, Text, UniqueConstraint, Index,
)

from sqlalchemy.orm import Mapped, mapped_column, relationship



class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    departments: Mapped[list["Department"]] = relationship(back_populates="company")
    users: Mapped[list["User"]] = relationship(back_populates="company")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    company_id: Mapped[str] = mapped_column(GUID, ForeignKey("companies.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("departments.id"), nullable=True)
    leader_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    company: Mapped["Company"] = relationship(back_populates="departments")
    users: Mapped[list["User"]] = relationship(back_populates="department")
    projects: Mapped[list["Project"]] = relationship(back_populates="department")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # super_admin / company_admin / dept_leader / project_manager / site_staff
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users: Mapped[list["User"]] = relationship(back_populates="role")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    company_id: Mapped[str] = mapped_column(GUID, ForeignKey("companies.id"), nullable=False)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("departments.id"), nullable=True)
    role_id: Mapped[str] = mapped_column(GUID, ForeignKey("roles.id"), nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company: Mapped["Company"] = relationship(back_populates="users")
    department: Mapped[Optional["Department"]] = relationship(back_populates="users")
    role: Mapped["Role"] = relationship(back_populates="users")
    


# ── Project Management ─────────────────────────────────────────

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    company_id: Mapped[str] = mapped_column(GUID, ForeignKey("companies.id"), nullable=False)
    department_id: Mapped[str] = mapped_column(GUID, ForeignKey("departments.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="planning")  # planning / active / suspended / completed
    budget: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department: Mapped["Department"] = relationship(back_populates="projects")
    phases: Mapped[list["Phase"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    milestones: Mapped[list["Milestone"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    hazard_reports: Mapped[list["HazardReport"]] = relationship(back_populates="project")
    inspections: Mapped[list["Inspection"]] = relationship(back_populates="project")


class Phase(Base):
    __tablename__ = "phases"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[str] = mapped_column(GUID, ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending / in_progress / completed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="phases")
    tasks: Mapped[list["Task"]] = relationship(back_populates="phase", cascade="all, delete-orphan")
    milestones: Mapped[list["Milestone"]] = relationship(back_populates="phase", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[str] = mapped_column(GUID, ForeignKey("projects.id"), nullable=False)
    phase_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("phases.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending / achieved / delayed
    quality_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # pending_review / approved / rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="milestones")
    phase: Mapped[Optional["Phase"]] = relationship(back_populates="milestones")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    phase_id: Mapped[str] = mapped_column(GUID, ForeignKey("phases.id"), nullable=False)
    parent_task_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("tasks.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low / medium / high / urgent
    status: Mapped[str] = mapped_column(String(20), default="backlog")  # backlog / in_progress / review / done
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("users.id"), nullable=True)
    estimated_hours: Mapped[Optional[float]] = mapped_column(Numeric(8, 2), nullable=True)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    phase: Mapped["Phase"] = relationship(back_populates="tasks")
    assignee: Mapped[Optional["User"]] = relationship()
    parent: Mapped[Optional["Task"]] = relationship(remote_side="Task.id", back_populates="subtasks")
    subtasks: Mapped[list["Task"]] = relationship(back_populates="parent", cascade="all, delete-orphan")
    comments: Mapped[list["TaskComment"]] = relationship(back_populates="task", cascade="all, delete-orphan")


class TaskComment(Base):
    __tablename__ = "task_comments"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[str] = mapped_column(GUID, ForeignKey("tasks.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(GUID, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task: Mapped["Task"] = relationship(back_populates="comments")


# ── Hazard Reporting (随手拍) ─────────────────────────────────

class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("projects.id"), nullable=True)
    reporter_id: Mapped[str] = mapped_column(GUID, ForeignKey("users.id"), nullable=False)
    hazard_type: Mapped[str] = mapped_column(String(30), nullable=False)  # safety / quality / environment
    urgency: Mapped[str] = mapped_column(String(20), default="normal")  # urgent / important / normal
    level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # general / major (after confirmed)
    factor: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # human / equipment / environment / management
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(300), nullable=False)
    photos: Mapped[list] = mapped_column(JSON, default=list)  # list of photo URLs
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending / assigned / confirmed / pushed / rectifying / pending_acceptance / closed / rejected
    assigned_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("users.id"), nullable=True)
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("users.id"), nullable=True)
    confirmed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, ForeignKey("users.id"), nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    pushed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reject_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_draft: Mapped[bool] = mapped_column(default=False)  # 草稿标记
    auto_saved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # 自动保存时间

    __table_args__ = (
        Index("ix_hazard_status", "status"),
        Index("ix_hazard_project", "project_id"),
    )

    reporter: Mapped["User"] = relationship(foreign_keys=[reporter_id])
    project: Mapped[Optional["Project"]] = relationship(back_populates="hazard_reports")
    rectifications: Mapped[list["HazardRectification"]] = relationship(back_populates="hazard_report", cascade="all, delete-orphan")
    transfer_logs: Mapped[list["HazardTransfer"]] = relationship(back_populates="hazard_report", cascade="all, delete-orphan")


class HazardTransfer(Base):
    """记录隐患在专职安全员之间的转派日志"""
    __tablename__ = "hazard_transfers"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    hazard_report_id: Mapped[str] = mapped_column(GUID, ForeignKey("hazard_reports.id"), nullable=False)
    from_user_id: Mapped[str] = mapped_column(GUID, nullable=False)
    to_user_id: Mapped[str] = mapped_column(GUID, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    hazard_report: Mapped["HazardReport"] = relationship(back_populates="transfer_logs")


class HazardRectification(Base):
    __tablename__ = "hazard_rectifications"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    hazard_report_id: Mapped[str] = mapped_column(GUID, ForeignKey("hazard_reports.id"), nullable=False)
    handler_id: Mapped[str] = mapped_column(GUID, nullable=False)  # 整改责任人
    dept_admin_id: Mapped[str] = mapped_column(GUID, nullable=False)  # 兼职安全环保管理员（接收下推的人）
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    requirement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending / rectifying / submitted / accepted / rejected
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    acceptance_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # accepted / rejected
    acceptance_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    accepted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True)
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hazard_report: Mapped["HazardReport"] = relationship(back_populates="rectifications")
    photos: Mapped[list["RectificationPhoto"]] = relationship(back_populates="rectification", cascade="all, delete-orphan")


class RectificationPhoto(Base):
    __tablename__ = "rectification_photos"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    rectification_id: Mapped[str] = mapped_column(GUID, ForeignKey("hazard_rectifications.id"), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    rectification: Mapped["HazardRectification"] = relationship(back_populates="photos")


# ── Inspection (扫码巡检) ────────────────────────────────────

class InspectionPoint(Base):
    __tablename__ = "inspection_points"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[str] = mapped_column(GUID, ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(300), nullable=False)
    qr_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    frequency: Mapped[str] = mapped_column(String(20), default="daily")  # daily / weekly / monthly
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship()
    records: Mapped[list["Inspection"]] = relationship(back_populates="point", cascade="all, delete-orphan")


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    point_id: Mapped[str] = mapped_column(GUID, ForeignKey("inspection_points.id"), nullable=False)
    project_id: Mapped[str] = mapped_column(GUID, ForeignKey("projects.id"), nullable=False)
    inspector_id: Mapped[str] = mapped_column(GUID, ForeignKey("users.id"), nullable=False)
    result: Mapped[str] = mapped_column(String(20), nullable=False)  # ok / issue_found / skipped
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photos: Mapped[list] = mapped_column(JSON, default=list)  # list of photo URLs
    inspected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    point: Mapped["InspectionPoint"] = relationship(back_populates="records")
    project: Mapped["Project"] = relationship(back_populates="inspections")
    inspector: Mapped["User"] = relationship()


# ── Reports (报告管理) ────────────────────────────────────────

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[str] = mapped_column(GUID, ForeignKey("projects.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # daily / weekly / monthly
    period_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    submitter_id: Mapped[str] = mapped_column(GUID, nullable=False)
    content: Mapped[dict] = mapped_column(JSON, default=dict)
    attachments: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft / submitted / approved / rejected
    approval_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_report_project_period", "project_id", "type", "period_start"),
    )


# ── Approvals (通用审批流) ────────────────────────────────────

class ApprovalNode(Base):
    __tablename__ = "approval_nodes"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # project / report / hazard
    entity_id: Mapped[str] = mapped_column(GUID, nullable=False)
    node_type: Mapped[str] = mapped_column(String(20), default="single")  # single / countersign
    approver_id: Mapped[str] = mapped_column(GUID, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending / approved / rejected
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer, default=1)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ── Notifications ─────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(GUID, nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(GUID, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_notification_user_unread", "user_id", "is_read"),
    )
