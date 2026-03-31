"""审批流路由 — 模板管理 + 执行引擎"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy import select, desc, func
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import ApprovalFlow, ApprovalInstance, ApprovalTask
from api.response import ApiResponse
from datetime import datetime, timezone

router = APIRouter(prefix="/approval", tags=["审批流"])

# ── 审批流模板 ─────────────────────────────────────────

@router.get("/flows")
async def list_flows(
    flow_type: str = None,
    page: int = 1, page_size: int = 20,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """审批流模板列表"""
    query = select(ApprovalFlow).where(ApprovalFlow.is_active == True)
    if flow_type:
        query = query.where(ApprovalFlow.flow_type == flow_type)

    total_q = select(func.count(ApprovalFlow.id)).where(ApprovalFlow.is_active == True)
    total = (await db.execute(total_q)).scalar() or 0
    query = query.order_by(desc(ApprovalFlow.created_at)).offset((page-1)*page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.scalars().all()
    items = [{
        "id": r.id, "name": r.name, "description": r.description,
        "flow_type": r.flow_type, "version": r.version,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]
    return ApiResponse.ok({"items": items, "total": total, "page": page, "pages": (total+page_size-1)//page_size})


@router.post("/flows")
async def create_flow(
    name: str, flow_type: str, description: str = None,
    definition: dict = Body(default=dict),
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """创建审批流模板"""
    flow = ApprovalFlow(
        name=name, flow_type=flow_type, description=description,
        definition=definition or _default_flow_definition(),
        created_by=str(current_user.id)
    )
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    return ApiResponse.ok({"id": flow.id, "name": flow.name})


@router.get("/flows/{flow_id}")
async def get_flow(flow_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(ApprovalFlow).where(ApprovalFlow.id == flow_id))
    flow = result.scalar_one_or_none()
    if not flow:
        return ApiResponse.error("B0001", "审批流不存在")
    return ApiResponse.ok({
        "id": flow.id, "name": flow.name, "description": flow.description,
        "flow_type": flow.flow_type, "definition": flow.definition,
        "version": flow.version, "is_active": flow.is_active,
    })


@router.post("/start")
async def start_approval(
    flow_id: str, entity_type: str, entity_id: str,
    variables: dict = Body(default=dict),
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """发起审批流程"""
    # 获取流程定义
    flow_result = await db.execute(select(ApprovalFlow).where(ApprovalFlow.id == flow_id))
    flow = flow_result.scalar_one_or_none()
    if not flow:
        return ApiResponse.error("B0001", "审批流不存在")

    definition = flow.definition or {}
    nodes = definition.get("nodes", [])

    # 查找起始节点
    start_node = next((n for n in nodes if n.get("type") == "start"), None)
    if not start_node:
        return ApiResponse.error("B0002", "审批流未定义起始节点")

    # 查找第一个审批节点
    first_approver = next((n for n in nodes if n.get("type") == "approver"), None)
    if not first_approver:
        return ApiResponse.error("B0003", "审批流未定义审批节点")

    # 创建审批实例
    instance = ApprovalInstance(
        flow_id=flow_id, entity_type=entity_type, entity_id=entity_id,
        initiator_id=str(current_user.id), status="pending",
        current_node_id=first_approver.get("id"),
        variables=variables
    )
    db.add(instance)
    await db.flush()

    # 创建第一个审批任务
    approver_id = first_approver.get("approver_id") or str(current_user.id)
    task = ApprovalTask(
        instance_id=instance.id, node_id=first_approver.get("id"),
        node_name=first_approver.get("name", "审批"),
        node_type="approver",
        approver_id=approver_id,
        approver_ids=first_approver.get("approver_ids", [approver_id]),
        multi_mode=first_approver.get("multi_mode", "any"),
    )
    db.add(task)
    await db.commit()
    await db.refresh(instance)

    return ApiResponse.ok({
        "instance_id": instance.id, "status": instance.status,
        "current_node": first_approver.get("name"),
    })


@router.get("/my-tasks")
async def my_tasks(
    status: str = None,
    page: int = 1, page_size: int = 20,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """我的待审批任务"""
    user_id = str(current_user.id)
    query = select(ApprovalTask).where(
        ApprovalTask.approver_id == user_id,
        ApprovalTask.status == "pending"
    )

    total_q = select(func.count(ApprovalTask.id)).where(
        ApprovalTask.approver_id == user_id, ApprovalTask.status == "pending"
    )
    total = (await db.execute(total_q)).scalar() or 0
    query = query.order_by(desc(ApprovalTask.created_at)).offset((page-1)*page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.scalars().all()

    items = []
    for task in rows:
        inst_result = await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))
        inst = inst_result.scalar_one_or_none()
        items.append({
            "id": task.id, "instance_id": task.instance_id,
            "node_name": task.node_name, "node_type": task.node_type,
            "status": task.status,
            "entity_type": inst.entity_type if inst else None,
            "entity_id": inst.entity_id if inst else None,
            "created_at": task.created_at.isoformat() if task.created_at else None,
        })

    return ApiResponse.ok({"items": items, "total": total})


@router.post("/tasks/{task_id}/approve")
async def approve_task(
    task_id: str,
    agree: bool = True, comment: str = None,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """审批任务（通过/驳回）"""
    task_result = await db.execute(select(ApprovalTask).where(ApprovalTask.id == task_id))
    task = task_result.scalar_one_or_none()
    if not task:
        return ApiResponse.error("B0001", "审批任务不存在")
    if task.status != "pending":
        return ApiResponse.error("B0004", "该任务已处理")

    user_id = str(current_user.id)
    if task.approver_id != user_id and user_id not in (task.approver_ids or []):
        return ApiResponse.error("B0005", "无权审批此任务")

    task.status = "done"
    task.approve_type = "agree" if agree else "reject"
    task.comment = comment
    task.completed_at = datetime.now(timezone.utc)

    # 更新实例状态
    inst_result = await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))
    inst = inst_result.scalar_one_or_none()
    if inst:
        if agree:
            # 检查是否会签
            pending_q = select(func.count(ApprovalTask.id)).where(
                ApprovalTask.instance_id == inst.id,
                ApprovalTask.node_id == task.node_id,
                ApprovalTask.status == "pending"
            )
            pending = (await db.execute(pending_q)).scalar() or 0

            if pending == 0:
                if inst.status == "pending":
                    inst.status = "approved"
                    inst.finished_at = datetime.now(timezone.utc)
        else:
            inst.status = "rejected"
            inst.finished_at = datetime.now(timezone.utc)

    await db.commit()
    return ApiResponse.ok({
        "result": "通过" if agree else "驳回",
        "instance_status": inst.status if inst else "unknown"
    })


@router.post("/tasks/{task_id}/return")
async def return_task(
    task_id: str, comment: str,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """驳回重填（退回发起人）"""
    task_result = await db.execute(select(ApprovalTask).where(ApprovalTask.id == task_id))
    task = task_result.scalar_one_or_none()
    if not task:
        return ApiResponse.error("B0001", "审批任务不存在")

    task.status = "done"
    task.approve_type = "return"
    task.comment = comment
    task.completed_at = datetime.now(timezone.utc)

    inst_result = await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))
    inst = inst_result.scalar_one_or_none()
    if inst:
        inst.status = "returned"
        inst.finished_at = datetime.now(timezone.utc)

    await db.commit()
    return ApiResponse.ok({"result": "已退回"})


def _default_flow_definition() -> dict:
    """默认审批流定义（单级审批）"""
    return {
        "nodes": [
            {"id": "start", "type": "start", "name": "发起"},
            {"id": "approver_1", "type": "approver", "name": "主管审批", "approver_id": "", "multi_mode": "any"},
            {"id": "end", "type": "end", "name": "结束"},
        ],
        "edges": [
            {"from": "start", "to": "approver_1"},
            {"from": "approver_1", "to": "end"},
        ]
    }
