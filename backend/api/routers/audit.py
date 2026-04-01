"""审计日志路由"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, desc, func
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import AuditLog
from api.response import ApiResponse
from datetime import datetime

router = APIRouter(prefix="/audit", tags=["审计日志"])

ACTION_NAMES = {
    "login": "登录",
    "logout": "登出",
    "create": "创建",
    "update": "更新",
    "delete": "删除",
    "approve": "审批通过",
    "reject": "审批驳回",
    "submit": "提交",
    "return": "退回",
}

ENTITY_NAMES = {
    "user": "用户",
    "project": "项目",
    "hazard": "随手拍",
    "report": "报告",
    "approval": "审批流",
    "task": "任务",
}


@router.get("/logs")
async def list_logs(
    action: str = None,
    entity_type: str = None,
    keyword: str = None,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    page_size: int = 20,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if keyword:
        query = query.where(AuditLog.entity_name.ilike(f"%{keyword}%"))
    if start_date:
        sd = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        query = query.where(AuditLog.created_at >= sd)
    if end_date:
        ed = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        query = query.where(AuditLog.created_at <= ed)

    total = (await db.execute(select(func.count(AuditLog.id)))).scalar() or 0
    query = query.order_by(desc(AuditLog.created_at)).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()

    items = [
        {
            "id": r.id,
            "action": r.action,
            "action_name": ACTION_NAMES.get(r.action, r.action),
            "entity_type": r.entity_type,
            "entity_name": r.entity_name,
            "username": r.username,
            "ip_address": r.ip_address,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.get("/logs/{log_id}")
async def get_log_detail(log_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    log = (await db.execute(select(AuditLog).where(AuditLog.id == log_id))).scalar_one_or_none()
    if not log:
        return ApiResponse.error("B0001", "日志不存在")
    return ApiResponse.ok(
        {
            "id": log.id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "entity_name": log.entity_name,
            "username": log.username,
            "before_value": log.before_value,
            "after_value": log.after_value,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "extra": log.extra,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
    )


def add_audit_log(
    db,
    user_id: str,
    username: str,
    action: str,
    entity_type: str,
    entity_id: str = None,
    entity_name: str = None,
    before_value: dict = None,
    after_value: dict = None,
    ip_address: str = None,
    user_agent: str = None,
):
    """审计日志写入工具函数（供其他路由调用）"""
    log = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        before_value=before_value,
        after_value=after_value,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
