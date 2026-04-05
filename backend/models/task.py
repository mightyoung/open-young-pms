import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from api.services.fastapi_code_generator.database import Base, GUID


class WBSTask(Base):
    __tablename__ = "wbs_tasks"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID, ForeignKey("projects.id"), nullable=False)
    parent_id = Column(GUID, ForeignKey("wbs_tasks.id"), nullable=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)

    wbs_code = Column(String(50), nullable=True)
    level = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)

    progress = Column(Integer, default=0)
    status = Column(String(20), default="pending")

    planned_start = Column(DateTime, nullable=True)
    planned_end = Column(DateTime, nullable=True)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)

    assignee_id = Column(GUID, ForeignKey("users.id"), nullable=True)
    dependencies = Column(JSON, default=list)

    created_by = Column(GUID, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignee = relationship("User")
    parent = relationship("WBSTask", remote_side=[id], back_populates="children")
    children = relationship("WBSTask", back_populates="parent", cascade="all, delete-orphan")
    comments = relationship("WBSTaskComment", back_populates="task", cascade="all, delete-orphan")


class WBSTaskComment(Base):
    __tablename__ = "wbs_task_comments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    task_id = Column(GUID, ForeignKey("wbs_tasks.id"), nullable=False)
    user_id = Column(GUID, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("WBSTask", back_populates="comments")
