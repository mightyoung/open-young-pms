"""Report models."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Index
from sqlalchemy.orm import relationship

from api.services.fastapi_code_generator.database import Base, GUID


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_report_project_author", "project_id", "author_id"),
        Index("ix_report_status", "status"),
        {"extend_existing": True},
    )

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=True)
    type = Column(String(20), nullable=False)
    project_id = Column(GUID(), ForeignKey("projects.id"), nullable=False)
    author_id = Column(GUID(), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="draft")
    submitted_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(GUID(), ForeignKey("users.id"), nullable=True)
    approval_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReportSubmit(Base):
    __tablename__ = "report_submits"
    __table_args__ = {"extend_existing": True}

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(GUID(), ForeignKey("reports.id"), nullable=False)
    submitted_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    comment = Column(Text, nullable=True)
