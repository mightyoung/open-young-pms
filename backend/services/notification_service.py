"""通知服务."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.models import Notification
from models.notification import NotificationSetting
from services.websocket_manager import manager


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        content: Optional[str] = None,
        data: Optional[dict] = None,
    ):
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=notification_type,
            title=title,
            content=content or "",
            data=data or {},
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)

        await manager.send_to_user(
            user_id,
            {
                "type": "notification",
                "data": {
                    "id": notification.id,
                    "notification_type": notification_type,
                    "title": title,
                    "content": content,
                    "data": data or {},
                    "is_read": False,
                    "created_at": notification.created_at.isoformat(),
                },
            },
        )

        setting = await self._get_setting(user_id)
        if setting:
            if setting.email:
                await self._send_email(user_id, title, content)
            if setting.push:
                await self._send_push(user_id, title, content)

    async def send_batch(
        self,
        user_ids: list,
        notification_type: str,
        title: str,
        content: Optional[str] = None,
    ):
        for user_id in user_ids:
            await self.send(user_id, notification_type, title, content)

    async def notify_issue_assign(self, issue_id: str, assignee_id: str, assigner_name: str):
        await self.send(
            user_id=assignee_id,
            notification_type="issue_assign",
            title="你有一个新问题待处理",
            content=f"{assigner_name} 给你分配了问题 #{issue_id}",
            data={"issue_id": issue_id},
        )

    async def notify_issue_verify(self, user_id: str, issue_id: str, verifier_name: str, status: str):
        await self.send(
            user_id=user_id,
            notification_type="issue_verify",
            title=f"问题 #{issue_id} 已{status}",
            content=f"{verifier_name} 审批了你的问题",
            data={"issue_id": issue_id, "status": status},
        )

    async def notify_reply(self, post_author_id: str, reply_author_name: str, post_title: str, post_id: str):
        await self.send(
            user_id=post_author_id,
            notification_type="reply",
            title=f"{reply_author_name} 回复了你的帖子",
            content=post_title,
            data={"post_id": post_id, "post_title": post_title},
        )

    async def notify_like(self, post_author_id: str, liker_name: str, post_title: str, post_id: str):
        await self.send(
            user_id=post_author_id,
            notification_type="like",
            title=f"{liker_name} 赞了你的帖子",
            content=post_title,
            data={"post_id": post_id},
        )

    async def notify_mention(self, mentioned_user_id: str, mentioner_name: str, content: str):
        await self.send(
            user_id=mentioned_user_id,
            notification_type="mention",
            title=f"{mentioner_name} 在帖子中提及了你",
            content=content[:100] if content else None,
            data={},
        )

    async def notify_approval(self, user_id: str, approval_type: str, status: str, approver_name: str):
        await self.send(
            user_id=user_id,
            notification_type="approval",
            title=f"你的{approval_type}已{status}",
            content=f"{approver_name} 审批了你的{approval_type}",
            data={"approval_type": approval_type, "status": status},
        )

    async def notify_system(self, user_id: str, title: str, content: Optional[str] = None):
        await self.send(
            user_id=user_id,
            notification_type="system",
            title=title,
            content=content,
            data={},
        )

    async def _get_setting(self, user_id: str) -> Optional[NotificationSetting]:
        result = await self.db.execute(select(NotificationSetting).where(NotificationSetting.user_id == user_id))
        return result.scalar_one_or_none()

    async def _send_email(self, user_id: str, title: str, content: Optional[str]):
        pass

    async def _send_push(self, user_id: str, title: str, content: Optional[str]):
        pass
