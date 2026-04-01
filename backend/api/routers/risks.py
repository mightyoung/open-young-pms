"""风险管理 + 资源调度路由"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import Risk, ResourceItem
from api.services.fastapi_code_generator.schemas import RiskCreate, RiskUpdate, ResourceItemCreate, ResourceItemUpdate
from api.response import ApiResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/risks", tags=["风险管理"])


def _risk_dict(r):
    return dict(
        id=str(r.id),
        project_id=r.project_id,
        title=r.title,
        category=r.category,
        level=r.level,
        probability=r.probability,
        impact=r.impact,
        status=r.status,
        description=r.description,
        mitigation=r.mitigation,
        contingency=r.contingency,
        identified_by=r.identified_by,
        identified_at=r.identified_at.isoformat() if r.identified_at else None,
        created_at=r.created_at.isoformat() if r.created_at else None,
    )


@router.get("")
async def list_risks(
    project_id: str = None,
    level: str = None,
    status: str = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """风险列表"""
    query = select(Risk)
    if project_id:
        query = query.where(Risk.project_id == project_id)
    if level:
        query = query.where(Risk.level == level)
    if status:
        query = query.where(Risk.status == status)
    query = query.order_by(desc(Risk.created_at))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [_risk_dict(r) for r in result.scalars().all()]

    stats = {}
    for lv in ["high", "medium", "low"]:
        stats[lv] = (await db.execute(select(func.count()).where(Risk.level == lv))).scalar()
    stats["total"] = total

    return ApiResponse.ok({"items": items, "total": total, "page": page, "stats": stats})


@router.post("")
async def create_risk(data: RiskCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    r = Risk(**data.model_dump(), identified_by=str(current_user.id))
    db.add(r)
    await db.commit()
    await db.refresh(r)
    return ApiResponse.ok({"id": str(r.id), "title": r.title})


@router.patch("/{risk_id}")
async def update_risk(
    risk_id: str, data: RiskUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    result = await db.execute(select(Risk).where(Risk.id == risk_id))
    r = result.scalar_one_or_none()
    if not r:
        return ApiResponse.error("R0001", "风险不存在")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(r, key, val)
    if data.status == "resolved":
        r.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    return ApiResponse.ok({"id": str(r.id)})


# ── 资源调度 ──────────────────────────────────────────────────
RESOURCE_ROUTER = APIRouter(prefix="/resources", tags=["资源调度"])


def _res_dict(r):
    return dict(
        id=str(r.id),
        project_id=r.project_id,
        name=r.name,
        category=r.category,
        spec=r.spec,
        quantity=r.quantity,
        unit=r.unit,
        status=r.status,
        supplier=r.supplier,
        order_date=r.order_date.isoformat() if r.order_date else None,
        delivery_date=r.delivery_date.isoformat() if r.delivery_date else None,
        test_result=r.test_result,
        remarks=r.remarks,
        created_at=r.created_at.isoformat() if r.created_at else None,
    )


@RESOURCE_ROUTER.get("")
async def list_resources(
    project_id: str = None,
    category: str = None,
    status: str = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(ResourceItem)
    if project_id:
        query = query.where(ResourceItem.project_id == project_id)
    if category:
        query = query.where(ResourceItem.category == category)
    if status:
        query = query.where(ResourceItem.status == status)
    query = query.order_by(desc(ResourceItem.created_at))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [_res_dict(r) for r in result.scalars().all()]

    return ApiResponse.ok({"items": items, "total": total, "page": page})


@RESOURCE_ROUTER.post("")
async def create_resource(
    data: ResourceItemCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    r = ResourceItem(**data.model_dump(), created_by=str(current_user.id))
    db.add(r)
    await db.commit()
    await db.refresh(r)
    return ApiResponse.ok({"id": str(r.id), "name": r.name})


@RESOURCE_ROUTER.patch("/{res_id}")
async def update_resource(
    res_id: str, data: ResourceItemUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    result = await db.execute(select(ResourceItem).where(ResourceItem.id == res_id))
    r = result.scalar_one_or_none()
    if not r:
        return ApiResponse.error("RS0001", "资源不存在")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(r, key, val)
    await db.commit()
    return ApiResponse.ok({"id": str(r.id)})
