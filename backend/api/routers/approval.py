"""审批流路由 — 模板管理 + 执行引擎"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy import select, desc, func
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import ApprovalFlow, ApprovalInstance, ApprovalTask, User
from api.response import ApiResponse
from datetime import datetime

router = APIRouter(prefix="/approval", tags=["审批流"])


def _default_flow_definition() -> dict:
    return {
        "nodes": [
            {"id": "start", "type": "start", "name": "发起"},
            {"id": "approver_1", "type": "approver", "name": "主管审批", "approver_id": "", "multi_mode": "any"},
            {"id": "end", "type": "end", "name": "结束"},
        ],
        "edges": [{"from": "start", "to": "approver_1"}, {"from": "approver_1", "to": "end"}],
    }


@router.get("/flows")
async def list_flows(flow_type: str = None, page: int = 1, page_size: int = 20, db=Depends(get_db), current_user=Depends(get_current_user)):
    query = select(ApprovalFlow).where(ApprovalFlow.is_active == True)
    if flow_type:
        query = query.where(ApprovalFlow.flow_type == flow_type)
    total = (await db.execute(select(func.count(ApprovalFlow.id)))).scalar() or 0
    query = query.order_by(desc(ApprovalFlow.created_at)).offset((page-1)*page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()
    items = [{"id": r.id, "name": r.name, "description": r.description, "flow_type": r.flow_type, "version": r.version,
              "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]
    return ApiResponse.ok({"items": items, "total": total, "page": page, "pages": (total+page_size-1)//page_size})


@router.post("/flows")
async def create_flow(name: str, flow_type: str, description: str = None, definition: dict = Body(default=dict),
                     db=Depends(get_db), current_user=Depends(get_current_user)):
    flow = ApprovalFlow(name=name, flow_type=flow_type, description=description,
                        definition=definition or _default_flow_definition(), created_by=str(current_user.id))
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    return ApiResponse.ok({"id": flow.id, "name": flow.name})


@router.get("/flows/{flow_id}")
async def get_flow(flow_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    flow = (await db.execute(select(ApprovalFlow).where(ApprovalFlow.id == flow_id))).scalar_one_or_none()
    if not flow:
        return ApiResponse.error("B0001", "审批流不存在")
    return ApiResponse.ok({"id": flow.id, "name": flow.name, "flow_type": flow.flow_type, "definition": flow.definition, "version": flow.version})


@router.post("/start")
async def start_approval(flow_id: str, entity_type: str, entity_id: str, variables: dict = Body(default=dict),
                         db=Depends(get_db), current_user=Depends(get_current_user)):
    flow = (await db.execute(select(ApprovalFlow).where(ApprovalFlow.id == flow_id))).scalar_one_or_none()
    if not flow:
        return ApiResponse.error("B0001", "审批流不存在")
    nodes = (flow.definition or {}).get("nodes", [])
    first_approver = next((n for n in nodes if n.get("type") == "approver"), None)
    if not first_approver:
        return ApiResponse.error("B0003", "未定义审批节点")
    approver_id = first_approver.get("approver_id") or str(current_user.id)
    instance = ApprovalInstance(flow_id=flow_id, entity_type=entity_type, entity_id=entity_id,
                                initiator_id=str(current_user.id), status="pending",
                                current_node_id=first_approver.get("id"), variables=variables)
    db.add(instance)
    await db.flush()
    task = ApprovalTask(instance_id=instance.id, node_id=first_approver.get("id"),
                        node_name=first_approver.get("name", "审批"), node_type="approver",
                        approver_id=approver_id, approver_ids=[approver_id], multi_mode=first_approver.get("multi_mode", "any"))
    db.add(task)
    await db.commit()
    await db.refresh(instance)
    return ApiResponse.ok({"instance_id": instance.id, "status": instance.status, "current_node": first_approver.get("name")})


@router.get("/my-tasks")
async def my_tasks(status: str = None, page: int = 1, page_size: int = 20,
                   db=Depends(get_db), current_user=Depends(get_current_user)):
    user_id = str(current_user.id)
    task_query = select(ApprovalTask).where(ApprovalTask.assignee_id == user_id)
    if status and status != "all":
        task_query = task_query.where(ApprovalTask.status == status)
    total = (await db.execute(select(func.count(ApprovalTask.id)).where(ApprovalTask.assignee_id == user_id))).scalar() or 0
    task_query = task_query.order_by(desc(ApprovalTask.created_at)).offset((page-1)*page_size).limit(page_size)
    rows = (await db.execute(task_query)).scalars().all()
    items = []
    for task in rows:
        inst = (await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))).scalar_one_or_none()
        flow = None
        if inst:
            flow = (await db.execute(select(ApprovalFlow).where(ApprovalFlow.id == inst.flow_id))).scalar_one_or_none()
        initiator = None
        if inst and inst.initiator_id:
            initiator = (await db.execute(select(User).where(User.id == inst.initiator_id))).scalar_one_or_none()
        items.append({
            "id": task.id,
            "instance_id": task.instance_id,
            "node_name": task.node_name,
            "status": task.status,
            "flow_type": inst.entity_type if inst else None,
            "title": inst.variables.get("title", inst.entity_type) if inst and inst.variables else (inst.entity_type if inst else None),
            "initiator_name": initiator.name if initiator else (inst.initiator_id if inst else None),
            "comment": task.comment or inst.variables.get("comment", "") if inst and inst.variables else "",
            "created_at": task.created_at.isoformat() if task.created_at else None,
        })
    return ApiResponse.ok({"items": items, "total": total})


@router.post("/tasks/{task_id}/approve")
async def approve_task(task_id: str, agree: bool = True, comment: str = None,
                       db=Depends(get_db), current_user=Depends(get_current_user)):
    task = (await db.execute(select(ApprovalTask).where(ApprovalTask.id == task_id))).scalar_one_or_none()
    if not task:
        return ApiResponse.error("B0001", "审批任务不存在")
    if task.status != "pending":
        return ApiResponse.error("B0004", "该任务已处理")
    user_id = str(current_user.id)
    if task.approver_id != user_id and user_id not in (task.approver_ids or []):
        return ApiResponse.error("B0005", "无权审批")
    task.status = "done"
    task.approve_type = "agree" if agree else "reject"
    task.comment = comment
    task.completed_at = datetime.utcnow()
    inst = (await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))).scalar_one_or_none()
    if inst:
        pending = (await db.execute(select(func.count(ApprovalTask.id)).where(
            ApprovalTask.instance_id == inst.id, ApprovalTask.node_id == task.node_id,
            ApprovalTask.status == "pending"))).scalar() or 0
        if pending == 0 and inst.status == "pending":
            inst.status = "approved"
            inst.finished_at = datetime.utcnow()
        elif not agree:
            inst.status = "rejected"
            inst.finished_at = datetime.utcnow()
    await db.commit()
    return ApiResponse.ok({"result": "通过" if agree else "驳回"})


@router.post("/tasks/{task_id}/return")
async def return_task(task_id: str, comment: str = None, db=Depends(get_db), current_user=Depends(get_current_user)):
    task = (await db.execute(select(ApprovalTask).where(ApprovalTask.id == task_id))).scalar_one_or_none()
    if not task:
        return ApiResponse.error("B0001", "审批任务不存在")
    task.status = "done"
    task.approve_type = "return"
    task.comment = comment
    task.completed_at = datetime.utcnow()
    inst = (await db.execute(select(ApprovalInstance).where(ApprovalInstance.id == task.instance_id))).scalar_one_or_none()
    if inst:
        inst.status = "returned"
        inst.finished_at = datetime.utcnow()
    await db.commit()
    return ApiResponse.ok({"result": "已退回"})
