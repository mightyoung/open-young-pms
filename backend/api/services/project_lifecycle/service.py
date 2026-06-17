"""Project lifecycle service functions for the first implementation slice."""

from uuid import uuid4

from fastapi import HTTPException, status

from schemas.project_lifecycle import (
    ProcessTemplate,
    ProjectFromTemplatePreview,
    ProjectFromTemplateRequest,
    ProjectLifecyclePreview,
    ProjectPreview,
    ProjectTypeCode,
    ProjectTypeInfo,
    WorkItem,
    WorkItemCreate,
    WorkItemTypeInfo,
)

from .templates import DEFAULT_TEMPLATES, PROJECT_TYPES


def get_project_types() -> list[ProjectTypeInfo]:
    return PROJECT_TYPES


def list_templates(project_type: ProjectTypeCode | None = None) -> list[ProcessTemplate]:
    if project_type is None:
        return DEFAULT_TEMPLATES
    return [template for template in DEFAULT_TEMPLATES if template.project_type == project_type]


def get_template(project_type: ProjectTypeCode, template_id: str | None = None) -> ProcessTemplate:
    candidates = list_templates(project_type)
    if not candidates:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目类型不存在")
    if template_id is None:
        return candidates[0]
    for template in candidates:
        if template.id == template_id:
            return template
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="流程模板不存在")


def build_lifecycle_preview(
    project_id: str,
    project_type: ProjectTypeCode,
    template_id: str | None = None,
) -> ProjectLifecyclePreview:
    template = get_template(project_type, template_id)
    return ProjectLifecyclePreview(
        project_id=project_id,
        project_type=project_type,
        template=template,
        stages=template.stages,
        stage_gates=template.stage_gates,
        metrics=template.metrics,
    )


def create_project_from_template_preview(request: ProjectFromTemplateRequest) -> ProjectFromTemplatePreview:
    template = get_template(request.project_type, request.template_id)
    project_id = f"preview_{uuid4().hex[:12]}"
    project = ProjectPreview(
        id=project_id,
        name=request.name,
        code=request.code or project_id,
        project_type=request.project_type,
        description=request.description,
    )
    lifecycle = build_lifecycle_preview(project_id, request.project_type, template.id)
    return ProjectFromTemplatePreview(
        project=project,
        template=template,
        lifecycle=lifecycle,
        stage_gates=template.stage_gates,
        work_item_types=template.work_item_types,
    )


def _get_work_item_type(project_type: ProjectTypeCode, work_item_type: str) -> WorkItemTypeInfo:
    template = get_template(project_type)
    for item_type in template.work_item_types:
        if item_type.code == work_item_type:
            return item_type
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="工作项类型不属于当前项目类型")


def get_work_item_summaries(project_type: ProjectTypeCode) -> list[WorkItemTypeInfo]:
    return get_template(project_type).work_item_types


def create_work_item(
    project_id: str,
    project_type: ProjectTypeCode,
    work_item_type: str,
    request: WorkItemCreate,
) -> WorkItem:
    item_type = _get_work_item_type(project_type, work_item_type)
    status_value = request.status or item_type.default_status
    if status_value not in item_type.statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="工作项状态不合法")
    return WorkItem(
        id=f"wi_{uuid4().hex[:12]}",
        project_id=project_id,
        project_type=project_type,
        type=work_item_type,
        title=request.title,
        status=status_value,
        priority=request.priority,
        assignee_id=request.assignee_id,
        parent_id=request.parent_id,
        metadata=request.metadata,
    )


def transition_work_item(
    work_item_id: str,
    project_type: ProjectTypeCode,
    work_item_type: str,
    target_status: str,
) -> WorkItem:
    item_type = _get_work_item_type(project_type, work_item_type)
    if target_status not in item_type.statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="目标状态不合法")
    return WorkItem(
        id=work_item_id,
        project_id="preview",
        project_type=project_type,
        type=work_item_type,
        title="状态流转预览",
        status=target_status,
        priority="medium",
    )
