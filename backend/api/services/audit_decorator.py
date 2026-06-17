"""审计日志装饰器 — 自动记录关键操作"""

import logging
from functools import wraps

logger = logging.getLogger(__name__)


def audit_log(action: str, entity_type: str, entity_name_field: str = None):
    """装饰器：在操作成功后自动写入审计日志"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            # 从 kwargs 提取 current_user 和 db
            current_user = kwargs.get("current_user")
            db = kwargs.get("db")
            if not current_user or not db:
                return result
            try:
                from api.routers.audit import add_audit_log
                from starlette.requests import Request

                request: Request = next((a for a in args if isinstance(a, Request)), None)
                ip = request.client.host if request else None
                ua = request.headers.get("user-agent", "") if request else ""

                entity_id = kwargs.get("id") or kwargs.get(f"{entity_type}_id")
                entity_name = kwargs.get(entity_name_field or "name", "")

                add_audit_log(
                    db=db,
                    user_id=str(current_user.id),
                    username=current_user.username,
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    entity_name=str(entity_name) if entity_name else None,
                    ip_address=ip,
                    user_agent=ua,
                )
            except Exception as e:
                logger.warning("Failed to write audit log: %s", e)
            return result

        return wrapper

    return decorator
