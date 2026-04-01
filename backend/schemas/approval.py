"""审批流 Pydantic Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserBrief(BaseModel):
    id: str
    username: str
    full_name: str


class ApproverConfig(BaseModel):
    type: str
    user_id: Optional[str] = None
    role_id: Optional[str] = None
    dept_id: Optional[str] = None


class ApprovalNodeCreate(BaseModel):
    id: str
    name: str
    type: str
    approvers: list[ApproverConfig] = []
    condition: Optional[dict] = None
    next_node_id: Optional[str] = None


class FlowCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    entity_type: str
    nodes: list[ApprovalNodeCreate]


class FlowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: list[ApprovalNodeCreate]


class FlowBrief(BaseModel):
    id: str
    name: str
    code: str
    version: int


class FlowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    code: str
    description: Optional[str]
    entity_type: Optional[str]
    nodes: list
    is_active: bool
    version: int
    created_at: Optional[datetime]


class InstanceStart(BaseModel):
    flow_id: str
    entity_type: str
    entity_id: str
    init_data: Optional[dict] = None


class ApprovalRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    node_name: Optional[str]
    approver: UserBrief
    action: str
    comment: Optional[str]
    created_at: datetime


class InstanceDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    flow: FlowBrief
    entity_type: str
    entity_id: str
    status: str
    initiator: UserBrief
    current_node_name: Optional[str]
    records: list[ApprovalRecordResponse]
    created_at: datetime


class InstanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    flow_id: str
    entity_type: str
    entity_id: str
    status: str
    current_node_id: Optional[str]
    initiator_id: str
    initiated_at: datetime
    finished_at: Optional[datetime]


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    instance_id: str
    node_name: str
    status: str
    flow_name: str
    entity_type: str
    entity_id: str
    initiator: UserBrief
    created_at: datetime
