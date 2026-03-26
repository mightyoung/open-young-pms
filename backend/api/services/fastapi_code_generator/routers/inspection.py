"""扫码巡检路由（独立版 v2）"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy import select, desc, func, and_
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import InspectionPointV2, InspectionPlan, InspectionRecordV2
from api.response import ApiResponse
from datetime import datetime

router = APIRouter(prefix="/inspection", tags=["扫码巡检"])


@router.get("/points")
async def list_points(
    keyword: str = None,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """巡检点列表"""
    query = select(InspectionPointV2).where(InspectionPointV2.status == "active")
    if keyword:
        query = query.where(InspectionPointV2.name.ilike(f"%{keyword}%"))
    query = query.order_by(InspectionPointV2.code)
    result = await db.execute(query)
    rows = result.scalars().all()
    items = [{
        "id": r.id, "name": r.name, "code": r.code,
        "location": r.location,
        "latitude": r.latitude, "longitude": r.longitude,
        "check_items": r.check_items or [],
    } for r in rows]
    return ApiResponse.ok({"items": items, "total": len(items)})


@router.get("/points/{code}")
async def get_point_by_code(code: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    """通过二维码编号查询巡检点"""
    result = await db.execute(select(InspectionPointV2).where(InspectionPointV2.code == code))
    point = result.scalar_one_or_none()
    if not point:
        return ApiResponse.error("B0001", "巡检点不存在")
    return ApiResponse.ok({
        "id": point.id, "name": point.name, "code": point.code,
        "location": point.location, "check_items": point.check_items or [],
    })


@router.post("/points")
async def create_point(
    name: str, code: str, location: str = None,
    latitude: float = None, longitude: float = None,
    check_items: list = Body(default=[]),
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """创建巡检点"""
    point = InspectionPointV2(
        name=name, code=code, location=location,
        latitude=latitude, longitude=longitude,
        check_items=check_items
    )
    db.add(point)
    await db.commit()
    await db.refresh(point)
    return ApiResponse.ok({"id": point.id, "name": point.name})


@router.post("/records")
async def create_record(
    point_id: str, status: str = "normal",
    check_results: list = Body(default=[]),
    photos: list = Body(default=[]),
    note: str = None, latitude: float = None, longitude: float = None,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """创建巡检记录"""
    record = InspectionRecordV2(
        point_id=point_id, inspector_id=str(current_user.id),
        status=status, check_results=check_results,
        photos=photos, note=note,
        latitude=latitude, longitude=longitude
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return ApiResponse.ok({"id": record.id, "status": record.status})


@router.get("/records")
async def list_records(
    point_id: str = None,
    page: int = 1, page_size: int = 20,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """巡检记录列表"""
    query = select(InspectionRecordV2).order_by(desc(InspectionRecordV2.checked_at))
    if point_id:
        query = query.where(InspectionRecordV2.point_id == point_id)

    total_q = select(func.count(InspectionRecordV2.id))
    if point_id:
        total_q = total_q.where(InspectionRecordV2.point_id == point_id)
    total = (await db.execute(total_q)).scalar() or 0

    query = query.offset((page-1)*page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.scalars().all()

    items = [{
        "id": r.id, "point_id": r.point_id, "status": r.status,
        "check_results": r.check_results or [],
        "photos": r.photos or [],
        "note": r.note,
        "latitude": r.latitude, "longitude": r.longitude,
        "checked_at": r.checked_at.isoformat() if r.checked_at else None,
    } for r in rows]
    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.get("/stats")
async def inspection_stats(
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """巡检统计"""
    total_points = (await db.execute(select(func.count(InspectionPointV2.id)))).scalar() or 0
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    today_q = select(func.count(InspectionRecordV2.id)).where(
        InspectionRecordV2.checked_at >= today
    )
    today_count = (await db.execute(today_q)).scalar() or 0

    abnormal_q = select(func.count(InspectionRecordV2.id)).where(
        InspectionRecordV2.status == "abnormal"
    )
    abnormal_count = (await db.execute(abnormal_q)).scalar() or 0

    return ApiResponse.ok({
        "total_points": total_points,
        "today_checked": today_count,
        "total_abnormal": abnormal_count,
        "abnormal_rate": round(abnormal_count / (today_count or 1) * 100, 1),
    })
