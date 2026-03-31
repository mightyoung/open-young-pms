"""质量管理模块 — 质量标准库 + 质量检查"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import QualityStandard, QualityInspection
from api.services.fastapi_code_generator.schemas import (
    QualityStandardCreate, QualityInspectionCreate,
)
from api.response import ApiResponse

router = APIRouter(prefix="/quality", tags=["质量管理"])


# ── 质量标准库 ────────────────────────────────────────────────
@router.get("/standards")
async def list_standards(
    category: str = None,
    keyword: str = None,
    page: int = 1, page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """质量标准库列表"""
    query = select(QualityStandard)
    if category:
        query = query.where(QualityStandard.category == category)
    if keyword:
        query = query.where(QualityStandard.name.ilike(f"%{keyword}%"))
    query = query.order_by(desc(QualityStandard.created_at))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [dict(
        id=str(r.id), name=r.name, code=r.code, category=r.category,
        description=r.description, pass_score=r.pass_score,
        check_items=r.check_items or [],
        created_at=r.created_at.isoformat() if r.created_at else None,
    ) for r in result.scalars().all()]

    return ApiResponse.ok({"items": items, "total": total, "page": page, "pages": (total + page_size - 1) // page_size})


@router.post("/standards")
async def create_standard(
    data: QualityStandardCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """新增质量标准"""
    std = QualityStandard(
        **data.model_dump(),
        created_by=str(current_user.id),
    )
    db.add(std)
    await db.commit()
    await db.refresh(std)
    return ApiResponse.ok({"id": str(std.id), "name": std.name})


@router.get("/standards/{std_id}")
async def get_standard(std_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    """质量标准详情"""
    result = await db.execute(select(QualityStandard).where(QualityStandard.id == std_id))
    std = result.scalar_one_or_none()
    if not std:
        return ApiResponse.error("Q0001", "标准不存在")
    return ApiResponse.ok({
        "id": str(std.id), "name": std.name, "code": std.code,
        "category": std.category, "description": std.description,
        "pass_score": std.pass_score, "check_items": std.check_items or [],
    })


# ── 质量检查记录 ───────────────────────────────────────────────
@router.get("/inspections")
async def list_inspections(
    project_id: str = None,
    result: str = None,
    page: int = 1, page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """质量检查记录列表"""
    query = select(QualityInspection).order_by(desc(QualityInspection.created_at))
    if project_id:
        query = query.where(QualityInspection.project_id == project_id)
    if result:
        query = query.where(QualityInspection.result == result)

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result_q = await db.execute(query)
    items = [dict(
        id=str(r.id), project_id=r.project_id, standard_id=r.standard_id,
        inspector_id=r.inspector_id, score=r.score, result=r.result,
        findings=r.findings, created_at=r.created_at.isoformat() if r.created_at else None,
    ) for r in result_q.scalars().all()]

    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.post("/inspections")
async def create_inspection(
    data: QualityInspectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """创建质量检查记录"""
    insp = QualityInspection(
        **data.model_dump(),
        inspector_id=str(current_user.id),
    )
    db.add(insp)
    await db.commit()
    await db.refresh(insp)
    return ApiResponse.ok({"id": str(insp.id), "result": insp.result})


@router.get("/inspections/{insp_id}")
async def get_inspection(insp_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    """质量检查详情"""
    result = await db.execute(select(QualityInspection).where(QualityInspection.id == insp_id))
    insp = result.scalar_one_or_none()
    if not insp:
        return ApiResponse.error("Q0002", "检查记录不存在")
    return ApiResponse.ok({
        "id": str(insp.id), "project_id": insp.project_id,
        "standard_id": insp.standard_id, "score": insp.score,
        "result": insp.result, "findings": insp.findings,
        "check_data": insp.check_data or {},
        "created_at": insp.created_at.isoformat() if insp.created_at else None,
    })
