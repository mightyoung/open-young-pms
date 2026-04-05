"""审批流数据模型."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON

from api.services.fastapi_code_generator.database import Base


class CustomApprovalFlow(Base):
    """审批流程模板"""

    __tablename__ = "approval_flows"
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    entity_type = Column(String(50), nullable=True)

    nodes = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CustomApprovalInstance(Base):
    """审批流程实例"""

    __tablename__ = "approval_instances"
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_id = Column(String(36), ForeignKey("approval_flows.id"), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(36), nullable=True)

    current_node_id = Column(String(36), nullable=True)
    status = Column(String(20), default="pending")

    initiator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    initiated_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CustomApprovalRecord(Base):
    """审批记录"""

    __tablename__ = "approval_records"
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    instance_id = Column(String(36), ForeignKey("approval_instances.id"), nullable=False)
    node_id = Column(String(36), nullable=True)
    node_name = Column(String(200), nullable=True)

    approver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(20), nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
