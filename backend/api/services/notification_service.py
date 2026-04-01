"""通知服务 — 统一通知入口"""


class NotificationService:
    """任何业务操作通过此服务发送通知"""

    @staticmethod
    async def create(
        db,
        user_id: str,
        notif_type: str,
        title: str,
        content: str,
        entity_type: str = None,
        entity_id: str = None,
    ):
        """创建通知并写入数据库"""
        from api.services.fastapi_code_generator.models import Notification

        notif = Notification(
            user_id=user_id, type=notif_type, title=title, content=content, entity_type=entity_type, entity_id=entity_id
        )
        db.add(notif)
        await db.commit()

        # 如果有 WebSocket 连接，推送实时通知
        try:
            from api.services.ws_manager import manager

            await manager.send_to_user(
                user_id,
                {
                    "type": "notification",
                    "data": {
                        "id": notif.id,
                        "type": notif_type,
                        "title": title,
                        "content": content,
                        "entity_type": entity_type,
                        "entity_id": entity_id,
                    },
                },
            )
        except Exception:
            pass  # WebSocket 未连接不影响通知写入

        return notif

    @staticmethod
    async def create_bulk(db, notifications: list):
        """批量创建通知"""
        from api.services.fastapi_code_generator.models import Notification

        for n in notifications:
            db.add(Notification(**n))
        await db.commit()
