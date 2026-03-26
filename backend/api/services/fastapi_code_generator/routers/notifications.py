"""消息通知路由 — generated from PRD 第十四章."""

from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import Notification, User
from api.services.fastapi_code_generator.schemas import NotificationResponse

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Notification).where(Notification.user_id == str(str(current_user.id)))
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(query)
    rows = result.scalars().all()
    return [NotificationResponse.model_validate(r) for r in rows]


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == str(str(current_user.id)))
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "已标记为已读"}


@router.post("/read-all")
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == str(str(current_user.id)), Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "全部已标记为已读"}
