"""审计日志 API 路由."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from schemas.audit import (
    AuditLogDetail,
    UserActivityItem,
    ResourceHistoryItem,
)
from api.response import ApiResponse
from schemas.response import PageResult
from services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["审计日志"])


def _audit_service(db: AsyncSession) -> AuditService:
    return AuditService(db)


@router.get("/logs", response_model=ApiResponse[PageResult])
async def search_logs(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    operator_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    resource_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuditService(db)
    result = await service.search_logs(
        start_date=start_date,
        end_date=end_date,
        operator_id=operator_id,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        page=page,
        page_size=page_size,
    )
    return ApiResponse.ok(result)


@router.get("/logs/{log_id}", response_model=ApiResponse[AuditLogDetail])
async def get_log_detail(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from models.audit import LegacyAuditLog

    row = (await db.execute(select(AuditLog).where(AuditLog.id == log_id))).scalar_one_or_none()
    if not row:
        return ApiResponse.error("B0001", "日志不存在")

    return ApiResponse.ok(
        AuditLogDetail(
            id=row.id,
            action=row.action,
            resource_type=row.resource_type,
            resource_id=row.resource_id,
            operator={
                "id": row.operator.id,
                "username": row.operator.username,
                "full_name": row.operator.full_name,
            },
            detail=row.detail or {},
            ip_address=row.ip_address,
            user_agent=row.user_agent,
            created_at=row.created_at,
        )
    )


@router.get("/users/{user_id}/activities", response_model=ApiResponse[list[UserActivityItem]])
async def get_user_activities(
    user_id: str,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuditService(db)
    activities = await service.get_user_activities(user_id, days=days)
    return ApiResponse.ok(activities)


@router.get(
    "/resources/{resource_type}/{resource_id}/history",
    response_model=ApiResponse[list[ResourceHistoryItem]],
)
async def get_resource_history(
    resource_type: str,
    resource_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuditService(db)
    history = await service.get_resource_history(resource_type, resource_id)
    return ApiResponse.ok(history)


@router.get("/export")
async def export_logs(
    start_date: datetime,
    end_date: datetime,
    format: str = Query("csv", regex="^(csv)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = AuditService(db)
    data = await service.export_logs(start_date, end_date, format=format)
    return Response(
        content=data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_logs.csv"},
    )
