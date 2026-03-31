"""报告管理路由 — generated from PRD 第十五章."""

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.response import ApiResponse
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


@router.get("/summary")
async def get_report_summary(
    project_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """报告统计汇总"""
    query = select(Report)
    if project_id:
        query = query.where(Report.project_id == project_id)
    result = await db.execute(query)
    reports = result.scalars().all()
    
    total = len(reports)
    submitted = sum(1 for r in reports if r.status in ('submitted', 'approved'))
    approved = sum(1 for r in reports if r.status == 'approved')
    rejected = sum(1 for r in reports if r.status == 'rejected')
    pending = sum(1 for r in reports if r.status == 'pending')
    
    by_type = {}
    for r in reports:
        t = getattr(r, 'report_type', 'other') or 'other'
        by_type[t] = by_type.get(t, 0) + 1
    
    return ApiResponse.ok({
        "total": total,
        "submitted": submitted,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "pass_rate": round(approved / submitted * 100, 1) if submitted > 0 else 0,
        "by_type": by_type,
    })
