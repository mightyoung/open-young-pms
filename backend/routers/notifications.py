"""通知路由."""

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from models.notification import Notification, NotificationSetting
from schemas.notification import (
    NotificationResponse,
    NotificationSettingUpdate,
    NotificationSettingResponse,
    UnreadCountResponse,
)
from api.response import ApiResponse
from schemas.response import PageResult
from schemas.pagination import PaginationParams
from middleware.exception import ApiException

router = APIRouter()


@router.get("", response_model=ApiResponse)
async def list_notifications(
    pagination: PaginationParams = Depends(),
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Notification).where(Notification.user_id == str(current_user.id))
    if unread_only:
        query = query.where(Notification.is_read == False)

    count_q = select(func.count()).select_from(Notification).where(Notification.user_id == str(current_user.id))
    if unread_only:
        count_q = count_q.where(Notification.is_read == False)
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Notification.created_at.desc()).offset(pagination.offset).limit(pagination.page_size)
    rows = (await db.execute(query)).scalars().all()

    items = [NotificationResponse.model_validate(r) for r in rows]
    return ApiResponse.ok(
        PageResult(
            items=items,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            has_more=(pagination.page * pagination.page_size) < total,
        )
    )


@router.get("/unread-count", response_model=ApiResponse[UnreadCountResponse])
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count_q = (
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.user_id == str(current_user.id),
            Notification.is_read == False,
        )
    )
    total = (await db.execute(count_q)).scalar() or 0
    return ApiResponse.ok(UnreadCountResponse(unread_count=total))


@router.put("/{notification_id}/read", response_model=ApiResponse)
async def mark_as_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == str(current_user.id),
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise ApiException(code="B0001", message="通知不存在")

    notification.is_read = True
    notification.read_at = Notification.__table__.c.read_at.type.python_type()
    from datetime import datetime, timezone

    notification.read_at = datetime.now(timezone.utc)
    await db.commit()
    return ApiResponse.ok(message="已标记为已读")


@router.put("/read-all", response_model=ApiResponse)
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone

    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == str(current_user.id),
            Notification.is_read == False,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return ApiResponse.ok(message="全部已标记为已读")


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == str(current_user.id),
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise ApiException(code="B0001", message="通知不存在")
    await db.delete(notification)
    await db.commit()


@router.get("/settings", response_model=ApiResponse[NotificationSettingResponse])
async def get_notification_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(NotificationSetting).where(NotificationSetting.user_id == str(current_user.id)))
    setting = result.scalar_one_or_none()
    if not setting:
        return ApiResponse.ok(
            NotificationSettingResponse(
                id="",
                user_id=str(current_user.id),
                issue_assign=True,
                issue_verify=True,
                reply_like=True,
                mention=True,
                approval=True,
                system=True,
                in_app=True,
                email=False,
                push=False,
            )
        )
    return ApiResponse.ok(NotificationSettingResponse.model_validate(setting))


@router.put("/settings", response_model=ApiResponse[NotificationSettingResponse])
async def update_notification_settings(
    settings: NotificationSettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(NotificationSetting).where(NotificationSetting.user_id == str(current_user.id)))
    setting = result.scalar_one_or_none()

    import uuid
    from datetime import datetime, timezone

    if not setting:
        setting = NotificationSetting(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            created_at=datetime.now(timezone.utc),
        )
        db.add(setting)

    update_data = settings.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(setting, key, value)

    await db.commit()
    await db.refresh(setting)
    return ApiResponse.ok(NotificationSettingResponse.model_validate(setting))
