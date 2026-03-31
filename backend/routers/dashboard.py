"""监测看板路由."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import User
from services.dashboard_service import DashboardService
from api.response import ApiResponse

router = APIRouter(prefix="/dashboard", tags=["监测看板"])


@router.get("/project/{project_id}/cockpit")
async def get_project_cockpit(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    try:
        data = await service.get_project_cockpit(project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return ApiResponse.ok(data)


@router.get("/project/{project_id}/traffic-light")
async def get_traffic_light(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    data = await service.get_traffic_light(project_id)
    return ApiResponse.ok(data)


@router.get("/project/{project_id}/statistics")
async def get_project_statistics(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    data = await service.get_project_statistics(project_id)
    return ApiResponse.ok(data)


@router.get("/department/{department_id}/overview")
async def get_department_overview(
    department_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    try:
        data = await service.get_department_overview(department_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return ApiResponse.ok(data)


@router.get("/company/overview")
async def get_company_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    data = await service.get_company_overview()
    return ApiResponse.ok(data)


@router.get("/early-warnings")
async def get_early_warnings(
    project_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DashboardService(db)
    data = await service.get_early_warnings(project_id)
    return ApiResponse.ok(data)


@router.get("/real-time")
async def get_real_time_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models import Project
    from sqlalchemy import select

    result = await db.execute(select(Project))
    projects = result.scalars().all()

    summary = {
        "total_projects": len(projects),
        "active_projects": sum(1 for p in projects if p.status == "active"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    return ApiResponse.ok(summary)
