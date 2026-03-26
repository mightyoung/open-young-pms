"""监测看板路由 — 驾驶舱 + 统计图表"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_, desc
from datetime import datetime, timedelta
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import HazardReport, Task, Report, User
from api.response import ApiResponse
import calendar

router = APIRouter(prefix="/dashboard", tags=["监测看板"])


@router.get("/summary")
async def dashboard_summary(
    period: str = "month",
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """驾驶舱汇总数据"""
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=365)

    # 随手拍统计
    hazard_total = await db.execute(select(func.count(HazardReport.id)))
    hazard_count = hazard_total.scalar() or 0

    hazard_recent_q = select(func.count(HazardReport.id)).where(
        HazardReport.created_at >= start_date
    )
    hazard_recent = (await db.execute(hazard_recent_q)).scalar() or 0

    hazard_closed_q = select(func.count(HazardReport.id)).where(
        HazardReport.status == "closed",
        HazardReport.updated_at >= start_date
    )
    hazard_closed = (await db.execute(hazard_closed_q)).scalar() or 0

    # 任务统计
    task_total = await db.execute(select(func.count(Task.id)))
    task_count = task_total.scalar() or 0

    task_done_q = select(func.count(Task.id)).where(Task.status == "done")
    task_done = (await db.execute(task_done_q)).scalar() or 0

    # 报告统计
    report_total = await db.execute(select(func.count(Report.id)))
    report_count = report_total.scalar() or 0

    # 随手拍整改率
    closure_rate = round(hazard_closed / hazard_recent * 100, 1) if hazard_recent > 0 else 0

    return ApiResponse.ok({
        "hazard": {
            "total": hazard_count, "recent": hazard_recent,
            "closed": hazard_closed, "closure_rate": closure_rate,
        },
        "task": {
            "total": task_count, "done": task_done,
            "completion_rate": round(task_done / task_count * 100, 1) if task_count > 0 else 0,
        },
        "report": {
            "total": report_count,
        },
        "period": period,
        "generated_at": now.isoformat(),
    })


@router.get("/hazard-trend")
async def hazard_trend(
    period: str = "month",
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """随手拍趋势（按日统计）"""
    now = datetime.utcnow()
    days = 30 if period == "month" else 7

    result = []
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        cnt_q = select(func.count(HazardReport.id)).where(
            and_(
                HazardReport.created_at >= day_start,
                HazardReport.created_at < day_end
            )
        )
        cnt = (await db.execute(cnt_q)).scalar() or 0
        result.append({
            "date": day_start.strftime("%m-%d"),
            "count": cnt,
        })

    return ApiResponse.ok(result)


@router.get("/hazard-by-type")
async def hazard_by_type(
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """随手拍类型分布"""
    types_q = select(
        HazardReport.hazard_type, func.count(HazardReport.id)
    ).group_by(HazardReport.hazard_type)
    result = await db.execute(types_q)
    rows = result.all()

    total = sum(r[1] for r in rows)
    items = [{"name": r[0] or "其他", "value": r[1], "rate": round(r[1]/total*100, 1) if total > 0 else 0} for r in rows]
    return ApiResponse.ok({"items": items, "total": total})


@router.get("/hazard-by-status")
async def hazard_by_status(
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """随手拍状态分布"""
    status_q = select(
        HazardReport.status, func.count(HazardReport.id)
    ).group_by(HazardReport.status)
    result = await db.execute(status_q)
    rows = result.all()

    STATUS_NAMES = {
        "pending": "待处理", "assigned": "已分配",
        "confirmed": "已确认", "pushed": "已下推",
        "rectifying": "整改中", "accepted": "已验收",
        "closed": "已关闭",
    }
    total = sum(r[1] for r in rows)
    items = [{"name": STATUS_NAMES.get(r[0], r[0]), "value": r[1], "rate": round(r[1]/total*100, 1) if total > 0 else 0} for r in rows]
    return ApiResponse.ok({"items": items, "total": total})


@router.get("/task-trend")
async def task_trend(
    period: str = "month",
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """任务完成趋势"""
    now = datetime.utcnow()
    days = 30 if period == "month" else 7

    result = []
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        done_q = select(func.count(Task.id)).where(
            and_(Task.status == "done",
                 Task.updated_at >= day_start,
                 Task.updated_at < day_end)
        )
        cnt = (await db.execute(done_q)).scalar() or 0
        result.append({
            "date": day_start.strftime("%m-%d"),
            "done": cnt,
        })

    return ApiResponse.ok(result)
