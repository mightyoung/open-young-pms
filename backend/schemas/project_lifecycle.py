"""Schemas for project lifecycle templates and first-slice work items."""

from typing import Any, Literal

from pydantic import BaseModel, Field

ProjectTypeCode = Literal["software_product", "integration_engineering", "software_project"]


class ProjectTypeInfo(BaseModel):
    code: ProjectTypeCode
    name: str
    description: str


class LifecycleStage(BaseModel):
    code: str
    name: str
    order: int
    description: str = ""
    default_owner_role: str = ""


class StageGate(BaseModel):
    code: str
    name: str
    stage_code: str
    required_artifacts: list[str] = Field(default_factory=list)
    approver_roles: list[str] = Field(default_factory=list)
    pass_criteria: list[str] = Field(default_factory=list)


class WorkItemTypeInfo(BaseModel):
    code: str
    name: str
    statuses: list[str]
    default_status: str
    description: str = ""


class ProcessTemplate(BaseModel):
    id: str
    project_type: ProjectTypeCode
    name: str
    description: str
    stages: list[LifecycleStage]
    stage_gates: list[StageGate]
    work_item_types: list[WorkItemTypeInfo]
    metrics: list[str] = Field(default_factory=list)


class ProjectFromTemplateRequest(BaseModel):
    project_type: ProjectTypeCode
    template_id: str | None = None
    name: str
    code: str | None = None
    description: str | None = None


class ProjectPreview(BaseModel):
    id: str
    name: str
    code: str
    project_type: ProjectTypeCode
    description: str | None = None


class ProjectLifecyclePreview(BaseModel):
    project_id: str
    project_type: ProjectTypeCode
    template: ProcessTemplate
    stages: list[LifecycleStage]
    stage_gates: list[StageGate]
    metrics: list[str]


class ProjectFromTemplatePreview(BaseModel):
    project: ProjectPreview
    template: ProcessTemplate
    lifecycle: ProjectLifecyclePreview
    stage_gates: list[StageGate]
    work_item_types: list[WorkItemTypeInfo]


class WorkItemCreate(BaseModel):
    title: str
    status: str | None = None
    priority: str = "medium"
    assignee_id: str | None = None
    parent_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkItem(BaseModel):
    id: str
    project_id: str
    project_type: ProjectTypeCode
    type: str
    title: str
    status: str
    priority: str
    assignee_id: str | None = None
    parent_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkItemTransitionRequest(BaseModel):
    target_status: str
