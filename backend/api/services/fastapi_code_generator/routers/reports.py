"""报告管理路由 — generated from PRD 第十五章."""

from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import Report, User
from api.services.fastapi_code_generator.schemas import ReportCreate

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = Report(submitter_id=str(current_user.id), **data.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
