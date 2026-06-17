"""Project lifecycle router for the template-driven project management slice."""

from fastapi import APIRouter, Depends

from api.response import ApiResponse
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.project_lifecycle import (
    build_lifecycle_preview,
    create_project_from_template_preview,
    create_work_item,
    get_project_types,
    get_work_item_summaries,
    list_templates,
    transition_work_item,
)
from schemas.project_lifecycle import (
    ProjectFromTemplateRequest,
    ProjectTypeCode,
    WorkItemCreate,
    WorkItemTransitionRequest,
)

router = APIRouter(prefix="/project-lifecycle", tags=["项目生命周期"])


@router.get("/project-types")
async def list_project_types(current_user=Depends(get_current_user)):
    return ApiResponse.ok([item.model_dump() for item in get_project_types()])


@router.get("/process-templates")
async def list_process_templates(
    project_type: ProjectTypeCode | None = None,
    current_user=Depends(get_current_user),
):
    return ApiResponse.ok([item.model_dump() for item in list_templates(project_type)])


@router.post("/projects/from-template")
async def create_project_from_template(
    request: ProjectFromTemplateRequest,
    current_user=Depends(get_current_user),
):
    return ApiResponse.ok(create_project_from_template_preview(request).model_dump())


@router.get("/projects/{project_id}/lifecycle")
async def get_project_lifecycle(
    project_id: str,
    project_type: ProjectTypeCode = "integration_engineering",
    template_id: str | None = None,
    current_user=Depends(get_current_user),
):
    return ApiResponse.ok(build_lifecycle_preview(project_id, project_type, template_id).model_dump())


@router.get("/projects/{project_id}/stage-gates")
async def list_stage_gates(
    project_id: str,
    project_type: ProjectTypeCode = "integration_engineering",
    current_user=Depends(get_current_user),
):
    lifecycle = build_lifecycle_preview(project_id, project_type)
    return ApiResponse.ok([item.model_dump() for item in lifecycle.stage_gates])


@router.get("/projects/{project_id}/work-items")
async def list_project_work_items(
    project_id: str,
    project_type: ProjectTypeCode = "integration_engineering",
    current_user=Depends(get_current_user),
):
    return ApiResponse.ok([item.model_dump() for item in get_work_item_summaries(project_type)])


@router.post("/projects/{project_id}/work-items")
async def create_project_work_item(
    project_id: str,
    request: WorkItemCreate,
    project_type: ProjectTypeCode = "integration_engineering",
    work_item_type: str = "task",
    current_user=Depends(get_current_user),
):
    return ApiResponse.ok(
        create_work_item(
            project_id=project_id,
            project_type=project_type,
            work_item_type=work_item_type,
            request=request,
        ).model_dump()
    )


@router.post("/work-items/{work_item_id}/transition")
async def transition_project_work_item(
    work_item_id: str,
    request: WorkItemTransitionRequest,
    project_type: ProjectTypeCode = "integration_engineering",
    work_item_type: str = "task",
    current_user=Depends(get_current_user),
):
    item = transition_work_item(
        work_item_id=work_item_id,
        project_type=project_type,
        work_item_type=work_item_type,
        target_status=request.target_status,
    )
    return ApiResponse.ok(item.model_dump())
