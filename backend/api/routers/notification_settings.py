"""通知设置路由"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import NotificationSetting
from api.services.fastapi_code_generator.schemas import NotificationSettingCreate
from api.response import ApiResponse

router = APIRouter(prefix="/notification-settings", tags=["通知设置"])


@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    """获取当前用户的通知设置"""
    result = await db.execute(select(NotificationSetting).where(NotificationSetting.user_id == str(current_user.id)))
    setting = result.scalar_one_or_none()
    if not setting:
        return ApiResponse.ok(
            {
                "channel": "in_app",
                "hazard_enabled": True,
                "report_enabled": True,
                "approval_enabled": True,
                "task_enabled": True,
                "frequency": "realtime",
            }
        )
    return ApiResponse.ok(
        {
            "id": str(setting.id),
            "channel": setting.channel,
            "hazard_enabled": setting.hazard_enabled,
            "report_enabled": setting.report_enabled,
            "approval_enabled": setting.approval_enabled,
            "task_enabled": setting.task_enabled,
            "frequency": setting.frequency,
        }
    )


@router.put("")
async def update_settings(
    data: NotificationSettingCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """更新通知设置"""
    result = await db.execute(select(NotificationSetting).where(NotificationSetting.user_id == str(current_user.id)))
    setting = result.scalar_one_or_none()

    if not setting:
        setting = NotificationSetting(user_id=str(current_user.id), **data.model_dump())
        db.add(setting)
    else:
        for key, val in data.model_dump().items():
            setattr(setting, key, val)
    await db.commit()
    return ApiResponse.ok({"message": "设置已保存"})
