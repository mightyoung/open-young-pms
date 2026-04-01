"""审计日志服务."""

import csv
import io
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.audit import AuditLog
from schemas.audit import AuditLogResponse, UserActivityItem, ResourceHistoryItem
from schemas.response import PageResult


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(
        self,
        action: str,
        resource_type: str,
        resource_id: str,
        operator_id: str,
        detail: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ):
        entry = AuditLog(
            id=str(uuid.uuid4()),
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            operator_id=operator_id,
            detail=detail or {},
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(entry)
        await self.db.commit()

    async def log_login(self, user_id: str, ip_address: Optional[str] = None, success: bool = True):
        await self.log(
            action="login",
            resource_type="user",
            resource_id=user_id,
            operator_id=user_id,
            detail={"success": success},
            ip_address=ip_address,
        )

    async def log_logout(self, user_id: str):
        await self.log(
            action="logout",
            resource_type="user",
            resource_id=user_id,
            operator_id=user_id,
        )

    async def log_create(self, user_id: str, resource_type: str, resource_id: str, data: dict):
        await self.log(
            action="create",
            resource_type=resource_type,
            resource_id=resource_id,
            operator_id=user_id,
            detail={"data": data},
        )

    async def log_update(
        self,
        user_id: str,
        resource_type: str,
        resource_id: str,
        old_data: dict,
        new_data: dict,
    ):
        await self.log(
            action="update",
            resource_type=resource_type,
            resource_id=resource_id,
            operator_id=user_id,
            detail={"old": old_data, "new": new_data},
        )

    async def log_delete(self, user_id: str, resource_type: str, resource_id: str):
        await self.log(
            action="delete",
            resource_type=resource_type,
            resource_id=resource_id,
            operator_id=user_id,
        )

    async def log_permission_change(
        self,
        admin_id: str,
        target_user_id: str,
        action: str,
        detail: dict,
    ):
        await self.log(
            action=action,
            resource_type="permission",
            resource_id=target_user_id,
            operator_id=admin_id,
            detail=detail,
        )

    async def search_logs(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        operator_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        action: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PageResult:
        conditions = []
        if start_date:
            conditions.append(AuditLog.created_at >= start_date)
        if end_date:
            conditions.append(AuditLog.created_at <= end_date)
        if operator_id:
            conditions.append(AuditLog.operator_id == operator_id)
        if resource_type:
            conditions.append(AuditLog.resource_type == resource_type)
        if resource_id:
            conditions.append(AuditLog.resource_id == resource_id)
        if action:
            conditions.append(AuditLog.action == action)

        where = and_(*conditions) if conditions else True
        count_q = select(AuditLog).where(where)
        total = (await self.db.execute(count_q)).scalars().count()

        query = (
            select(AuditLog)
            .where(where)
            .order_by(desc(AuditLog.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self.db.execute(query)).scalars().all()

        items = []
        for row in rows:
            items.append(
                AuditLogResponse(
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
        return PageResult(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total,
        )

    async def get_user_activities(self, user_id: str, days: int = 7) -> list:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(AuditLog)
            .where(AuditLog.operator_id == user_id)
            .where(AuditLog.created_at >= since)
            .order_by(desc(AuditLog.created_at))
            .limit(100)
        )
        rows = (await self.db.execute(query)).scalars().all()
        return [
            UserActivityItem(
                id=row.id,
                action=row.action,
                resource_type=row.resource_type,
                resource_id=row.resource_id,
                detail=row.detail or {},
                created_at=row.created_at,
            )
            for row in rows
        ]

    async def get_resource_history(self, resource_type: str, resource_id: str) -> list:
        query = (
            select(AuditLog)
            .where(AuditLog.resource_type == resource_type)
            .where(AuditLog.resource_id == resource_id)
            .order_by(desc(AuditLog.created_at))
            .limit(100)
        )
        rows = (await self.db.execute(query)).scalars().all()
        return [
            ResourceHistoryItem(
                id=row.id,
                action=row.action,
                operator={
                    "id": row.operator.id,
                    "username": row.operator.username,
                    "full_name": row.operator.full_name,
                },
                detail=row.detail or {},
                created_at=row.created_at,
            )
            for row in rows
        ]

    async def export_logs(
        self,
        start_date: datetime,
        end_date: datetime,
        format: str = "csv",
    ) -> bytes:
        query = (
            select(AuditLog)
            .where(AuditLog.created_at >= start_date)
            .where(AuditLog.created_at <= end_date)
            .order_by(AuditLog.created_at)
        )
        rows = (await self.db.execute(query)).scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "ID",
                "Action",
                "Resource Type",
                "Resource ID",
                "Operator ID",
                "Detail",
                "IP Address",
                "User Agent",
                "Created At",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row.id,
                    row.action,
                    row.resource_type,
                    row.resource_id,
                    row.operator_id,
                    str(row.detail or {}),
                    row.ip_address or "",
                    row.user_agent or "",
                    row.created_at.isoformat() if row.created_at else "",
                ]
            )
        return output.getvalue().encode("utf-8")
