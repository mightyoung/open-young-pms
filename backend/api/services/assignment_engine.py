"""隐患指派规则引擎 — 按类型/紧急程度自动指派"""

from typing import Optional

# 默认指派人配置（实际从数据库读取）
DEFAULT_ASSIGNEES = {
    "safety_urgent": "00000000-0000-0000-0000-000000000001",
    "safety_important": "00000000-0000-0000-0000-000000000001",
    "safety_normal": "00000000-0000-0000-0000-000000000001",
    "quality": "00000000-0000-0000-0000-000000000001",
    "environment": "00000000-0000-0000-0000-000000000001",
}


def get_default_assignee(hazard_type: str, urgency: str) -> Optional[str]:
    """根据隐患类型和紧急程度返回默认指派人"""
    if hazard_type == "safety" and urgency == "urgent":
        key = "safety_urgent"
    elif hazard_type == "safety" and urgency == "important":
        key = "safety_important"
    elif hazard_type == "safety":
        key = "safety_normal"
    elif hazard_type == "quality":
        key = "quality"
    elif hazard_type == "environment":
        key = "environment"
    else:
        key = "safety_normal"
    return DEFAULT_ASSIGNEES.get(key)


def suggest_assignee(hazard_type: str, urgency: str, location: str = "") -> dict:
    """推荐指派人（给前端用）"""
    assignee_id = get_default_assignee(hazard_type, urgency)
    return {
        "suggested_assignee_id": assignee_id,
        "reason": f"按隐患类型「{hazard_type}」+ 紧急程度「{urgency}」自动推荐",
        "rules_matched": [f"type={hazard_type}", f"urgency={urgency}"],
    }
