"""项目管理路由 — generated from PRD 第七/十一章."""

from typing import Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import Project, Phase, Milestone, User
from api.services.fastapi_code_generator.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    PhaseCreate, PhaseResponse,
    PaginatedResponse,
)

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
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
    return project


@router.get("", response_model=PaginatedResponse)
async def list_projects(
    page: int = 1,
    page_size: int = 20,
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
    
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    query = query.order_by(Project.created_at.desc()).offset((page-1)*page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()
    return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=(total+page_size-1)//page_size)


@router.get("/{project_id}", response_model=ProjectResponse)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    return project


@router.patch("/{project_id}")
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    project.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "更新成功"}


# ── Phase ────────────────────────────────────────────────────

@router.post("/{project_id}/phases", status_code=status.HTTP_201_CREATED)
async def create_phase(
    project_id: UUID,
    data: PhaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    phase = Phase(project_id=project_id, **data.model_dump())
    db.add(phase)
    await db.commit()
    await db.refresh(phase)
    return phase


@router.get("/{project_id}/gantt")
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    
    gantt_data = []
    for phase in project.phases:
        for task in phase.tasks:
            gantt_data.append({
                "id": str(task.id),
                "title": task.title,
                "phase": phase.name,
                "start": task.start_date.isoformat() if task.start_date else None,
                "end": task.due_date.isoformat() if task.due_date else None,
                "status": task.status,
                "priority": task.priority,
                "assignee_id": str(task.assignee_id) if task.assignee_id else None,
            })
    return {"project": {"id": str(project.id), "name": project.name}, "items": gantt_data}
