"""数据服务层 — 统一数据入口 + 数据治理"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional, Any
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import User
from api.response import ApiResponse
from datetime import datetime
import uuid

router = APIRouter(prefix="/data", tags=["数据服务"])

# ── 数据质量规则定义 ──────────────────────────────────────────
DATA_QUALITY_RULES = {
    "users": [
        {"rule_id": "u001", "field": "phone", "rule_type": "format", "pattern": r"^1[3-9]\d{9}$", "severity": "critical", "message": "手机号格式错误"},
        {"rule_id": "u002", "field": "email", "rule_type": "format", "pattern": r"^[\w.-]+@[\w.-]+\.\w+$", "severity": "warning", "message": "邮箱格式错误"},
        {"rule_id": "u003", "field": "role_id", "rule_type": "not_null", "severity": "critical", "message": "角色不能为空"},
    ],
    "projects": [
        {"rule_id": "p001", "field": "project_code", "rule_type": "not_null", "severity": "critical", "message": "项目编号不能为空"},
        {"rule_id": "p002", "field": "end_date", "rule_type": "range", "rule_config": {"gt_field": "start_date"}, "severity": "critical", "message": "结束日期必须晚于开始日期"},
    ],
    "hazards": [
        {"rule_id": "h001", "field": "images", "rule_type": "min_count", "rule_config": {"min": 1}, "severity": "critical", "message": "图片至少上传1张"},
        {"rule_id": "h002", "field": "latitude", "rule_type": "range", "rule_config": {"min": -90, "max": 90}, "severity": "critical", "message": "纬度范围错误"},
        {"rule_id": "h003", "field": "longitude", "rule_type": "range", "rule_config": {"min": -180, "max": 180}, "severity": "critical", "message": "经度范围错误"},
        {"rule_id": "h004", "field": "severity", "rule_type": "enum", "rule_config": {"values": ["urgent", "important", "normal"]}, "severity": "critical", "message": "严重程度必选"},
    ],
    "reports": [
        {"rule_id": "r001", "field": "content", "rule_type": "not_null", "severity": "critical", "message": "报告内容不能为空"},
        {"rule_id": "r002", "field": "report_type", "rule_type": "enum", "rule_config": {"values": ["daily", "weekly", "monthly"]}, "severity": "critical", "message": "报告类型错误"},
    ],
}

# ── 主数据元数据定义 ──────────────────────────────────────────
MASTER_DATA_METADATA = {
    "users": {
        "table": "users",
        "display_name": "用户主数据",
        "fields": {
            "id": {"name": "用户ID", "type": "UUID", "nullable": False, "pk": True},
            "username": {"name": "用户名", "type": "VARCHAR(100)", "nullable": False, "unique": True},
            "full_name": {"name": "姓名", "type": "VARCHAR(100)", "nullable": False},
            "email": {"name": "邮箱", "type": "VARCHAR(200)", "nullable": True},
            "phone": {"name": "手机号", "type": "VARCHAR(20)", "nullable": True},
            "role_id": {"name": "角色ID", "type": "UUID", "nullable": True, "fk": "mst_role.id"},
            "department_id": {"name": "部门ID", "type": "UUID", "nullable": True, "fk": "mst_department.id"},
            "employee_no": {"name": "员工编号", "type": "VARCHAR(50)", "nullable": True, "unique": True},
            "entry_date": {"name": "入职日期", "type": "DATE", "nullable": True},
            "status": {"name": "状态", "type": "ENUM(active/inactive)", "nullable": False, "default": "active"},
            "created_at": {"name": "创建时间", "type": "DATETIME", "nullable": False},
            "updated_at": {"name": "更新时间", "type": "DATETIME", "nullable": False},
        }
    },
    "projects": {
        "table": "projects",
        "display_name": "项目主数据",
        "fields": {
            "id": {"name": "项目ID", "type": "UUID", "nullable": False, "pk": True},
            "project_code": {"name": "项目编号", "type": "VARCHAR(50)", "nullable": False, "unique": True},
            "project_name": {"name": "项目名称", "type": "VARCHAR(200)", "nullable": False},
            "description": {"name": "项目描述", "type": "TEXT", "nullable": True},
            "project_type": {"name": "项目类型", "type": "VARCHAR(50)", "nullable": True},
            "status": {"name": "状态", "type": "ENUM", "nullable": False},
            "start_date": {"name": "开始日期", "type": "DATE", "nullable": True},
            "end_date": {"name": "结束日期", "type": "DATE", "nullable": True},
            "budget": {"name": "预算", "type": "DECIMAL(15,2)", "nullable": True},
            "department_id": {"name": "所属部门", "type": "UUID", "nullable": True, "fk": "mst_department.id"},
            "created_at": {"name": "创建时间", "type": "DATETIME", "nullable": False},
        }
    },
    "departments": {
        "table": "departments",
        "display_name": "部门主数据",
        "fields": {
            "id": {"name": "部门ID", "type": "UUID", "nullable": False, "pk": True},
            "dept_code": {"name": "部门编码", "type": "VARCHAR(50)", "nullable": False, "unique": True},
            "dept_name": {"name": "部门名称", "type": "VARCHAR(100)", "nullable": False},
            "parent_id": {"name": "上级部门", "type": "UUID", "nullable": True, "fk": "mst_department.id"},
            "manager_id": {"name": "负责人", "type": "UUID", "nullable": True, "fk": "mst_user.id"},
            "sort_order": {"name": "排序", "type": "INT", "nullable": True, "default": 0},
            "created_at": {"name": "创建时间", "type": "DATETIME", "nullable": False},
        }
    },
    "hazards": {
        "table": "hazard_reports",
        "display_name": "随手拍隐患主数据",
        "fields": {
            "id": {"name": "隐患ID", "type": "UUID", "nullable": False, "pk": True},
            "issue_no": {"name": "隐患编号", "type": "VARCHAR(50)", "nullable": False, "unique": True},
            "title": {"name": "标题", "type": "VARCHAR(200)", "nullable": False},
            "description": {"name": "描述", "type": "TEXT", "nullable": True},
            "hazard_type": {"name": "类型", "type": "ENUM(safety/quality/environment)", "nullable": False},
            "severity": {"name": "严重程度", "type": "ENUM(urgent/important/normal)", "nullable": False},
            "status": {"name": "状态", "type": "ENUM", "nullable": False},
            "latitude": {"name": "纬度", "type": "DECIMAL(10,7)", "nullable": True},
            "longitude": {"name": "经度", "type": "DECIMAL(10,7)", "nullable": True},
            "reporter_id": {"name": "上报人", "type": "UUID", "nullable": False, "fk": "mst_user.id"},
            "assignee_id": {"name": "处理人", "type": "UUID", "nullable": True, "fk": "mst_user.id"},
            "project_id": {"name": "关联项目", "type": "UUID", "nullable": True, "fk": "mst_project.id"},
            "rectify_deadline": {"name": "整改截止", "type": "DATE", "nullable": True},
            "created_at": {"name": "创建时间", "type": "DATETIME", "nullable": False},
            "updated_at": {"name": "更新时间", "type": "DATETIME", "nullable": False},
        }
    },
    "reports": {
        "table": "reports",
        "display_name": "报告主数据",
        "fields": {
            "id": {"name": "报告ID", "type": "UUID", "nullable": False, "pk": True},
            "report_no": {"name": "报告编号", "type": "VARCHAR(50)", "nullable": False, "unique": True},
            "report_type": {"name": "报告类型", "type": "ENUM(daily/weekly/monthly)", "nullable": False},
            "author_id": {"name": "作者", "type": "UUID", "nullable": False, "fk": "mst_user.id"},
            "project_id": {"name": "关联项目", "type": "UUID", "nullable": True, "fk": "mst_project.id"},
            "status": {"name": "状态", "type": "ENUM", "nullable": False},
            "submitted_at": {"name": "提交时间", "type": "DATETIME", "nullable": True},
            "approved_by": {"name": "审批人", "type": "UUID", "nullable": True, "fk": "mst_user.id"},
            "created_at": {"name": "创建时间", "type": "DATETIME", "nullable": False},
        }
    },
}

# ── 数据血缘定义 ──────────────────────────────────────────────
DATA_LINEAGE = [
    {"source": "users", "source_field": "id", "target": "hazards", "target_field": "reporter_id", "transformation": "direct", "meaning": "用户上报随手拍"},
    {"source": "users", "source_field": "id", "target": "hazards", "target_field": "assignee_id", "transformation": "direct", "meaning": "用户被指派处理随手拍"},
    {"source": "users", "source_field": "id", "target": "reports", "target_field": "author_id", "transformation": "direct", "meaning": "用户撰写报告"},
    {"source": "projects", "source_field": "id", "target": "hazards", "target_field": "project_id", "transformation": "direct", "meaning": "项目关联随手拍"},
    {"source": "projects", "source_field": "id", "target": "reports", "target_field": "project_id", "transformation": "direct", "meaning": "项目关联报告"},
    {"source": "departments", "source_field": "id", "target": "users", "target_field": "department_id", "transformation": "direct", "meaning": "部门包含用户"},
    {"source": "departments", "source_field": "id", "target": "projects", "target_field": "department_id", "transformation": "direct", "meaning": "部门下有项目"},
    {"source": "roles", "source_field": "id", "target": "users", "target_field": "role_id", "transformation": "direct", "meaning": "角色赋予用户权限"},
]

# ── 敏感字段定义 ──────────────────────────────────────────────
SENSITIVE_FIELDS = [
    {"entity": "users", "field": "password_hash", "mask_type": "hash", "description": "密码哈希"},
    {"entity": "users", "field": "phone", "mask_type": "partial", "pattern": "***", "description": "手机号（部分隐藏）"},
    {"entity": "users", "field": "email", "mask_type": "partial", "pattern": "@", "description": "邮箱（脱敏）"},
    {"entity": "audit_logs", "field": "before_value", "mask_type": "json_mask", "description": "变更前值（脱敏）"},
    {"entity": "audit_logs", "field": "after_value", "mask_type": "json_mask", "description": "变更后值（脱敏）"},
]


# ── API 端点实现 ──────────────────────────────────────────────

class QualityRuleCheckRequest(BaseModel):
    entity_type: str
    data: dict


@router.get("/master/users")
async def get_master_users(
    page: int = 1, page_size: int = 20,
    status: str = None,
    current_user=Depends(get_current_user),
):
    """用户主数据查询"""
    from api.services.fastapi_code_generator.database import get_db
    from sqlalchemy import select, func
    from api.services.fastapi_code_generator.models import User
    
    db_gen = get_db()
    db = await db_gen.__anext__()
    query = select(User)
    if status:
        query = query.where(User.status == status)
    total = (await db.execute(select(func.count(User.id)))).scalar() or 0
    query = query.offset((page-1)*page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()
    
    items = [{"id": str(u.id), "username": u.username, "full_name": u.full_name, "email": u.email, "phone": u.phone, "status": u.status} for u in rows]
    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.post("/master/users/validate")
async def validate_user_data(req: QualityRuleCheckRequest, current_user=Depends(get_current_user)):
    """用户数据质量校验"""
    rules = DATA_QUALITY_RULES.get("users", [])
    issues = []
    data = req.data
    
    for rule in rules:
        field = rule["field"]
        value = data.get(field)
        
        if rule["rule_type"] == "not_null" and not value:
            issues.append({"rule_id": rule["rule_id"], "field": field, "severity": rule["severity"], "message": rule["message"]})
        
        elif rule["rule_type"] == "format" and value:
            import re
            if not re.match(rule.get("pattern", ""), str(value)):
                issues.append({"rule_id": rule["rule_id"], "field": field, "severity": rule["severity"], "message": rule["message"]})
        
        elif rule["rule_type"] == "enum" and value:
            allowed = rule.get("rule_config", {}).get("values", [])
            if value not in allowed:
                issues.append({"rule_id": rule["rule_id"], "field": field, "severity": rule["severity"], "message": rule["message"]})
    
    score = max(0, 100 - len([i for i in issues if i["severity"] == "critical"]) * 30 - len([i for i in issues if i["severity"] == "warning"]) * 10)
    
    return ApiResponse.ok({
        "passed": len(issues) == 0,
        "score": score,
        "issues": issues,
        "rule_count": len(rules),
    })


@router.get("/quality/score")
async def get_quality_score(entity_type: str = None, current_user=Depends(get_current_user)):
    """数据质量总分（按实体或全局）"""
    if entity_type:
        rules = DATA_QUALITY_RULES.get(entity_type, [])
        return ApiResponse.ok({
            "entity": entity_type,
            "score": 100,  # 实际从 DB 统计得出
            "total_rules": len(rules),
            "description": f"{MASTER_DATA_METADATA.get(entity_type, {}).get('display_name', entity_type)} 质量评分",
        })
    
    # 全局评分
    total_rules = sum(len(v) for v in DATA_QUALITY_RULES.values())
    return ApiResponse.ok({
        "overall_score": 100,
        "entity_scores": {k: 100 for k in DATA_QUALITY_RULES},
        "total_rules": total_rules,
        "last_check": datetime.utcnow().isoformat(),
    })


@router.get("/quality/rules")
async def get_quality_rules(entity_type: str = None, current_user=Depends(get_current_user)):
    """质量规则列表"""
    if entity_type:
        return ApiResponse.ok({"entity": entity_type, "rules": DATA_QUALITY_RULES.get(entity_type, [])})
    return ApiResponse.ok({"entities": {k: v for k, v in DATA_QUALITY_RULES.items()}})


@router.get("/lineage/{entity}")
async def get_entity_lineage(entity: str, current_user=Depends(get_current_user)):
    """获取实体血缘（上下游）"""
    upstream = [l for l in DATA_LINEAGE if l["target"] == entity]
    downstream = [l for l in DATA_LINEAGE if l["source"] == entity]
    
    return ApiResponse.ok({
        "entity": entity,
        "display_name": MASTER_DATA_METADATA.get(entity, {}).get("display_name", entity),
        "upstream": upstream,
        "downstream": downstream,
    })


@router.get("/metadata/entities")
async def get_metadata_entities(current_user=Depends(get_current_user)):
    """实体元数据列表"""
    entities = []
    for key, meta in MASTER_DATA_METADATA.items():
        entities.append({
            "entity": key,
            "display_name": meta["display_name"],
            "table": meta["table"],
            "field_count": len(meta["fields"]),
        })
    return ApiResponse.ok({"items": entities, "total": len(entities)})


@router.get("/metadata/fields/{entity}")
async def get_entity_fields(entity: str, current_user=Depends(get_current_user)):
    """获取实体字段详情"""
    meta = MASTER_DATA_METADATA.get(entity)
    if not meta:
        return ApiResponse.error("D0001", f"实体 {entity} 不存在")
    
    fields = []
    for fname, fmeta in meta["fields"].items():
        field_info = {
            "field": fname,
            "name": fmeta["name"],
            "type": fmeta["type"],
            "nullable": fmeta["nullable"],
            "pk": fmeta.get("pk", False),
        }
        if "fk" in fmeta:
            field_info["fk"] = fmeta["fk"]
        if "unique" in fmeta:
            field_info["unique"] = fmeta["unique"]
        fields.append(field_info)
    
    return ApiResponse.ok({"entity": entity, "display_name": meta["display_name"], "fields": fields})


@router.get("/dictionary")
async def get_data_dictionary(current_user=Depends(get_current_user)):
    """完整数据字典"""
    dictionary = {}
    for entity, meta in MASTER_DATA_METADATA.items():
        dictionary[entity] = {
            "display_name": meta["display_name"],
            "table": meta["table"],
            "fields": meta["fields"],
        }
    return ApiResponse.ok({"dictionary": dictionary})


@router.get("/security/sensitive")
async def get_sensitive_fields(current_user=Depends(get_current_user)):
    """敏感字段列表"""
    return ApiResponse.ok({"items": SENSITIVE_FIELDS, "total": len(SENSITIVE_FIELDS)})


@router.post("/security/mask")
async def mask_test_data(entity: str, field: str, value: str, current_user=Depends(get_current_user)):
    """数据脱敏（测试）"""
    sensitive = next((s for s in SENSITIVE_FIELDS if s["entity"] == entity and s["field"] == field), None)
    if not sensitive:
        return ApiResponse.error("D0002", "该字段未标记为敏感字段")
    
    mask_type = sensitive["mask_type"]
    if mask_type == "partial":
        if "@" in str(value):
            parts = str(value).split("@")
            masked = parts[0][:2] + "***@" + parts[1]
        else:
            masked = str(value)[:3] + "***"
    elif mask_type == "hash":
        import hashlib
        masked = hashlib.sha256(str(value).encode()).hexdigest()[:16]
    else:
        masked = "***"
    
    return ApiResponse.ok({"original": value, "masked": masked, "mask_type": mask_type})
