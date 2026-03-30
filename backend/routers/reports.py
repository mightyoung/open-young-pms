"""Report management router."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from models.report import Report as ReportModel
from schemas.forum import UserBrief
from schemas.report import (
    ReportCreate,
    ReportResponse,
    ReportUpdate,
)
from schemas.response import ApiResponse, PageResult
from services.report_service import report_service
from middleware.exception import ApiException

router = APIRouter()


async def _get_user_brief(db: AsyncSession, user_id: str) -> UserBrief:
    if not user_id:
        return UserBrief(id="", username="", full_name="")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        return UserBrief(id=str(user.id), username=user.username, full_name=user.full_name)
    return UserBrief(id=user_id, username="", full_name="")


@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await report_service.create_report(
        db=db,
        author_id=str(current_user.id),
        title=data.title,
        content=data.content,
        report_type=data.type,
        project_id=data.project_id,
    )
    author = await _get_user_brief(db, report.author_id)
    response = ReportResponse.from_orm_with_author(report, author)
    return ApiResponse.ok(response, message="报告创建成功")


@router.get("", response_model=PageResult)
async def list_reports(
    project_id: Optional[str] = None,
    report_type: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await report_service.list_reports(
        db=db,
        project_id=project_id,
        report_type=report_type,
        status=status,
        page=page,
        page_size=page_size,
    )
    reports = result["items"]
    total = result["total"]

    responses = []
    for r in reports:
        author = await _get_user_brief(db, r.author_id)
        approver = await _get_user_brief(db, r.approved_by) if r.approved_by else None
        responses.append(ReportResponse.from_orm_with_author(r, author, approver))

    return PageResult(
        items=responses,
        total=total,
        page=page,
        page_size=page_size,
        has_more=result["has_more"],
    )


@router.get("/stats", response_model=ApiResponse)
async def get_report_stats(
    project_id: str,
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from schemas.report import ReportStats
    stats = await report_service.get_report_stats(
        db=db,
        project_id=project_id,
        start_date=start_date,
        end_date=end_date,
    )
    return ApiResponse.ok(stats)


@router.get("/{report_id}", response_model=ApiResponse)
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    author = await _get_user_brief(db, report.author_id)
    approver = await _get_user_brief(db, report.approved_by) if report.approved_by else None
    response = ReportResponse.from_orm_with_author(report, author, approver)
    return ApiResponse.ok(response)


@router.put("/{report_id}", response_model=ApiResponse)
async def update_report(
    report_id: str,
    data: ReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report = await report_service.update_report(
            db=db,
            report_id=report_id,
            author_id=str(current_user.id),
            title=data.title,
            content=data.content,
        )
    except PermissionError as e:
        raise ApiException(status_code=403, message=str(e))
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    author = await _get_user_brief(db, report.author_id)
    response = ReportResponse.from_orm_with_author(report, author)
    return ApiResponse.ok(response, message="报告更新成功")


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    if report.author_id != str(current_user.id):
        raise ApiException(status_code=403, message="Only the author can delete the report")
    await db.delete(report)
    await db.commit()


@router.post("/{report_id}/submit", response_model=ApiResponse)
async def submit_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report = await report_service.submit_report(
            db=db,
            report_id=report_id,
            author_id=str(current_user.id),
        )
    except PermissionError as e:
        raise ApiException(status_code=403, message=str(e))
    except ValueError as e:
        raise ApiException(status_code=400, message=str(e))
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    author = await _get_user_brief(db, report.author_id)
    response = ReportResponse.from_orm_with_author(report, author)
    return ApiResponse.ok(response, message="报告提交成功")


@router.post("/{report_id}/approve", response_model=ApiResponse)
async def approve_report(
    report_id: str,
    comment: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report = await report_service.approve_report(
            db=db,
            report_id=report_id,
            approver_id=str(current_user.id),
            comment=comment,
        )
    except ValueError as e:
        raise ApiException(status_code=400, message=str(e))
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    author = await _get_user_brief(db, report.author_id)
    approver = await _get_user_brief(db, report.approved_by)
    response = ReportResponse.from_orm_with_author(report, author, approver)
    return ApiResponse.ok(response, message="报告审批通过")


@router.post("/{report_id}/reject", response_model=ApiResponse)
async def reject_report(
    report_id: str,
    comment: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report = await report_service.reject_report(
            db=db,
            report_id=report_id,
            approver_id=str(current_user.id),
            comment=comment,
        )
    except ValueError as e:
        raise ApiException(status_code=400, message=str(e))
    if not report:
        raise ApiException.from_error_code("NOT_FOUND")
    author = await _get_user_brief(db, report.author_id)
    approver = await _get_user_brief(db, report.approved_by)
    response = ReportResponse.from_orm_with_author(report, author, approver)
    return ApiResponse.ok(response, message="报告已驳回")


@router.post("/generate/daily", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def generate_daily(
    project_id: str,
    date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await report_service.generate_daily_report(
        db=db,
        project_id=project_id,
        author_id=str(current_user.id),
        target_date=date,
    )
    author = await _get_user_brief(db, report.author_id)
    response = ReportResponse.from_orm_with_author(report, author)
    return ApiResponse.ok(response, message="日报生成成功")


@router.post("/generate/weekly", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def generate_weekly(
    project_id: str,
    week_start: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = await report_service.generate_weekly_report(
        db=db,
        project_id=project_id,
        author_id=str(current_user.id),
        week_start=week_start,
    )
    author = await _get_user_brief(db, report.author_id)
    response = ReportResponse.from_orm_with_author(report, author)
    return ApiResponse.ok(response, message="周报生成成功")
