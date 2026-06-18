"""监测看板路由."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import HazardReport, Report, Task, User
from services.dashboard_service import DashboardService
from api.response import ApiResponse

router = APIRouter(prefix="/dashboard", tags=["监测看板"])


async def _count(db: AsyncSession, model, *criteria) -> int:
    query = select(func.count()).select_from(model)
    for criterion in criteria:
        query = query.where(criterion)
    return (await db.execute(query)).scalar() or 0


async def _group_count(db: AsyncSession, column) -> list[dict]:
    rows = (await db.execute(select(column, func.count()).group_by(column))).all()
    return [{"name": key or "未分类", "value": count, "count": count} for key, count in rows]


@router.get("/summary")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compatibility endpoint consumed by the web dashboard."""
    hazard_total = await _count(db, HazardReport)
    hazard_closed = await _count(db, HazardReport, HazardReport.status.in_(["closed", "resolved"]))
    task_total = await _count(db, Task)
    task_done = await _count(db, Task, Task.status.in_(["done", "completed"]))
    report_total = await _count(db, Report)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "hazard": {
            "total": hazard_total,
            "closed": hazard_closed,
            "closure_rate": round(hazard_closed * 100 / hazard_total, 1) if hazard_total else 0,
        },
        "task": {
            "total": task_total,
            "done": task_done,
            "completion_rate": round(task_done * 100 / task_total, 1) if task_total else 0,
        },
        "report": {"total": report_total},
    }


@router.get("/hazard-trend")
async def get_hazard_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=29)
    rows = (
        await db.execute(
            select(HazardReport.created_at).where(HazardReport.created_at >= since)
        )
    ).scalars().all()
    counts: dict[str, int] = {}
    for created_at in rows:
        key = created_at.date().isoformat() if created_at else "未知"
        counts[key] = counts.get(key, 0) + 1
    return [{"date": key, "count": counts.get(key, 0)} for key in sorted(counts)]


@router.get("/hazard-by-type")
async def get_hazard_by_type(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await _group_count(db, HazardReport.hazard_type)


@router.get("/hazard-by-status")
async def get_hazard_by_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await _group_count(db, HazardReport.status)


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
        "timestamp": datetime.now(timezone.utc).isoformat() + "Z",
    }
    return ApiResponse.ok(summary)
