"""项目管理路由 — generated from PRD 第七/十一章."""

from typing import Optional
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import Project, Phase, User
from api.services.fastapi_code_generator.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    PhaseCreate, PhaseResponse,
)
from schemas import ApiResponse, ErrorCode, PaginationParams, PageResult
from middleware.exception import ApiException

router = APIRouter()


@router.post("", response_model=ApiResponse[ProjectResponse], status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建项目。POST /api/v1/projects"""
    project = Project(**data.model_dump(), manager_id=current_user.id)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ApiResponse.ok(ProjectResponse.model_validate(project), message="创建成功")


@router.get("", response_model=PageResult[ProjectResponse])
async def list_projects(
    pagination: PaginationParams = Depends(),
    status: Optional[str] = None,
    department_id: Optional[UUID] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查询项目列表。GET /api/v1/projects"""
    query = select(Project).options(selectinload(Project.phases))
    if status:
        query = query.where(Project.status == status)
    if department_id:
        query = query.where(Project.department_id == department_id)
    if search:
        query = query.where(Project.name.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(Project)
    if status:
        count_q = count_q.where(Project.status == status)
    if department_id:
        count_q = count_q.where(Project.department_id == department_id)
    if search:
        count_q = count_q.where(Project.name.ilike(f"%{search}%"))
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Project.created_at.desc()).offset(pagination.offset).limit(pagination.page_size)
    items = (await db.execute(query)).scalars().all()

    return PageResult(
        items=[ProjectResponse.model_validate(p) for p in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        has_more=(pagination.page * pagination.page_size) < total
    )


@router.get("/{project_id}", response_model=ApiResponse[ProjectResponse])
async def get_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.phases).selectinload(Phase.tasks))
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise ApiException.from_error_code(ErrorCode.PROJECT_NOT_FOUND)
    return ApiResponse.ok(ProjectResponse.model_validate(project))


@router.patch("/{project_id}", response_model=ApiResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise ApiException.from_error_code(ErrorCode.PROJECT_NOT_FOUND)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    project.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return ApiResponse.ok(message="更新成功")


# ── Phase ────────────────────────────────────────────────────

@router.post("/{project_id}/phases", response_model=ApiResponse[PhaseResponse], status_code=status.HTTP_201_CREATED)
async def create_phase(
    project_id: UUID,
    data: PhaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    if not result.scalar_one_or_none():
        raise ApiException.from_error_code(ErrorCode.PROJECT_NOT_FOUND)
    phase = Phase(project_id=project_id, **data.model_dump())
    db.add(phase)
    await db.commit()
    await db.refresh(phase)
    return ApiResponse.ok(PhaseResponse.model_validate(phase), message="创建成功")


@router.get("/{project_id}/gantt", response_model=ApiResponse)
async def get_project_gantt(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """甘特图数据。GET /api/v1/projects/{id}/gantt"""
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.phases).selectinload(Phase.tasks),
            selectinload(Project.milestones),
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise ApiException.from_error_code(ErrorCode.PROJECT_NOT_FOUND)

    gantt_items = []
    for phase in project.phases:
        for task in phase.tasks:
            gantt_items.append({
                "id": str(task.id),
                "title": task.title,
                "phase": phase.name,
                "start": task.start_date.isoformat() if task.start_date else None,
                "end": task.due_date.isoformat() if task.due_date else None,
                "status": task.status,
                "priority": task.priority,
                "assignee_id": str(task.assignee_id) if task.assignee_id else None,
            })
    return ApiResponse.ok({"project": {"id": str(project.id), "name": project.name}, "items": gantt_items})
