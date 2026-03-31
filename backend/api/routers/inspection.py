"""扫码巡检路由 — 使用现有 InspectionPoint / Inspection 模型"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy import select, desc, func
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import InspectionPoint, Inspection
from api.response import ApiResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/inspection", tags=["扫码巡检"])


@router.get("/points")
async def list_points(keyword: str = None, db=Depends(get_db), current_user=Depends(get_current_user)):
    query = select(InspectionPoint)
    if keyword:
        query = query.where(InspectionPoint.name.ilike(f"%{keyword}%"))
    rows = (await db.execute(query.order_by(InspectionPoint.qr_code))).scalars().all()
    items = [{"id": r.id, "name": r.name, "code": r.qr_code, "location": r.location,
              "frequency": r.frequency} for r in rows]
    return ApiResponse.ok({"items": items, "total": len(items)})


@router.get("/points/{code}")
async def get_point_by_code(code: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    point = (await db.execute(select(InspectionPoint).where(InspectionPoint.qr_code == code))).scalar_one_or_none()
    if not point:
        return ApiResponse.error("B0001", "巡检点不存在")
    return ApiResponse.ok({"id": point.id, "name": point.name, "code": point.qr_code, "location": point.location})


@router.get("/records")
async def list_records(point_id: str = None, page: int = 1, page_size: int = 20,
                        db=Depends(get_db), current_user=Depends(get_current_user)):
    query = select(Inspection).order_by(desc(Inspection.inspected_at))
    if point_id:
        query = query.where(Inspection.point_id == point_id)
    total = (await db.execute(select(func.count(Inspection.id)))).scalar() or 0
    query = query.offset((page-1)*page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()
    RESULT_NAMES = {"ok": "正常", "issue_found": "发现问题", "skipped": "已跳过"}
    items = [{"id": r.id, "point_id": r.point_id, "result": r.result, "result_name": RESULT_NAMES.get(r.result, r.result),
              "notes": r.notes, "photos": r.photos or [],
              "inspected_at": r.inspected_at.isoformat() if r.inspected_at else None} for r in rows]
    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.post("/records")
async def create_record(point_id: str, result: str = "ok", notes: str = None,
                         photos: list = Body(default=[]), db=Depends(get_db), current_user=Depends(get_current_user)):
    record = Inspection(point_id=point_id, inspector_id=str(current_user.id),
                          result=result, notes=notes, photos=photos)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return ApiResponse.ok({"id": record.id, "result": record.result})


@router.get("/stats")
async def inspection_stats(db=Depends(get_db), current_user=Depends(get_current_user)):
    total = (await db.execute(select(func.count(InspectionPoint.id)))).scalar() or 0
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_cnt = (await db.execute(select(func.count(Inspection.id)).where(Inspection.inspected_at >= today))).scalar() or 0
    abnormal = (await db.execute(select(func.count(Inspection.id)).where(Inspection.result == "issue_found"))).scalar() or 0
    return ApiResponse.ok({"total_points": total, "today_checked": today_cnt,
                           "total_abnormal": abnormal, "abnormal_rate": round(abnormal/(today_cnt or 1)*100, 1)})
