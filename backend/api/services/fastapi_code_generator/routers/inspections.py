"""扫码巡检路由 — generated from PRD 第八章."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import InspectionPoint, Inspection, User
from api.services.fastapi_code_generator.schemas import (
    InspectionPointCreate,
    InspectionSubmitRequest,
)

router = APIRouter()


@router.post("/points", status_code=status.HTTP_201_CREATED)
async def create_point(
    data: InspectionPointCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import uuid

    qr = f"QR-{uuid.uuid4().hex[:8].upper()}"
    point = InspectionPoint(qr_code=qr, **data.model_dump())
    db.add(point)
    await db.commit()
    await db.refresh(point)
    return point


@router.get("/points/{qr_code}")
async def get_point_by_qr(
    qr_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(InspectionPoint).where(InspectionPoint.qr_code == qr_code))
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="巡检点不存在")
    return point


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_inspection(
    data: InspectionSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    point_result = await db.execute(select(InspectionPoint).where(InspectionPoint.id == data.point_id))
    point = point_result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="巡检点不存在")

    record = Inspection(
        point_id=data.point_id,
        project_id=point.project_id,
        inspector_id=str(current_user.id),
        result=data.result,
        notes=data.notes,
        photos=data.photos,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record
