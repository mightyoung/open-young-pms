"""监测看板路由"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, timezone
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import HazardReport, Task, Report
from api.response import ApiResponse

router = APIRouter(prefix="/dashboard", tags=["监测看板"])


@router.get("/summary")
async def dashboard_summary(period: str = "month", db=Depends(get_db), current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=7 if period == "week" else (30 if period == "month" else 365))
    hazard_total = (await db.execute(select(func.count(HazardReport.id)))).scalar() or 0
    hazard_recent = (await db.execute(select(func.count(HazardReport.id)).where(HazardReport.created_at >= start))).scalar() or 0
    hazard_closed = (await db.execute(select(func.count(HazardReport.id)).where(
        HazardReport.status == "closed", HazardReport.updated_at >= start))).scalar() or 0
    task_total = (await db.execute(select(func.count(Task.id)))).scalar() or 0
    task_done = (await db.execute(select(func.count(Task.id)).where(Task.status == "done"))).scalar() or 0
    report_total = (await db.execute(select(func.count(Report.id)))).scalar() or 0
    return ApiResponse.ok({
        "hazard": {"total": hazard_total, "recent": hazard_recent, "closed": hazard_closed,
                   "closure_rate": round(hazard_closed/hazard_recent*100, 1) if hazard_recent > 0 else 0},
        "task": {"total": task_total, "done": task_done,
                 "completion_rate": round(task_done/task_total*100, 1) if task_total > 0 else 0},
        "report": {"total": report_total}, "period": period, "generated_at": now.isoformat(),
    })


@router.get("/hazard-trend")
async def hazard_trend(period: str = "month", db=Depends(get_db), current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    days = 7 if period == "week" else 30
    result = []
    for i in range(days-1, -1, -1):
        d0 = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        d1 = d0 + timedelta(days=1)
        cnt = (await db.execute(select(func.count(HazardReport.id)).where(
            and_(HazardReport.created_at >= d0, HazardReport.created_at < d1)))).scalar() or 0
        result.append({"date": d0.strftime("%m-%d"), "count": cnt})
    return ApiResponse.ok(result)


@router.get("/hazard-by-type")
async def hazard_by_type(db=Depends(get_db), current_user=Depends(get_current_user)):
    rows = (await db.execute(select(HazardReport.hazard_type, func.count(HazardReport.id)).group_by(HazardReport.hazard_type))).all()
    total = sum(r[1] for r in rows)
    items = [{"name": r[0] or "其他", "value": r[1], "rate": round(r[1]/total*100, 1) if total > 0 else 0} for r in rows]
    return ApiResponse.ok({"items": items, "total": total})


@router.get("/hazard-by-status")
async def hazard_by_status(db=Depends(get_db), current_user=Depends(get_current_user)):
    NAMES = {"pending": "待处理", "assigned": "已分配", "confirmed": "已确认", "pushed": "已下推",
             "rectifying": "整改中", "accepted": "已验收", "closed": "已关闭"}
    rows = (await db.execute(select(HazardReport.status, func.count(HazardReport.id)).group_by(HazardReport.status))).all()
    total = sum(r[1] for r in rows)
    items = [{"name": NAMES.get(r[0], r[0]), "value": r[1], "rate": round(r[1]/total*100, 1) if total > 0 else 0} for r in rows]
    return ApiResponse.ok({"items": items, "total": total})


@router.get("/task-trend")
async def task_trend(period: str = "month", db=Depends(get_db), current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    days = 7 if period == "week" else 30
    result = []
    for i in range(days-1, -1, -1):
        d0 = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        d1 = d0 + timedelta(days=1)
        cnt = (await db.execute(select(func.count(Task.id)).where(
            and_(Task.status == "done", Task.updated_at >= d0, Task.updated_at < d1)))).scalar() or 0
        result.append({"date": d0.strftime("%m-%d"), "done": cnt})
    return ApiResponse.ok(result)
