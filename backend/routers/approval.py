"""审批流路由."""

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from services.approval_service import ApprovalService
from schemas.approval import (
    FlowCreate,
    FlowUpdate,
    FlowResponse,
    InstanceStart,
    InstanceResponse,
    InstanceDetailResponse,
    TaskResponse,
    ApprovalRecordResponse,
    UserBrief,
    FlowBrief,
)
from api.response import ApiResponse


router = APIRouter(prefix="/approval", tags=["审批流"])


def _user_brief(user: User) -> Optional[UserBrief]:
    if not user:
        return None
    return UserBrief(id=str(user.id), username=user.username, full_name=user.full_name)


@router.post("/flows", response_model=ApiResponse)
async def create_flow(
    flow: FlowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    f = await svc.create_flow(
        name=flow.name,
        code=flow.code,
        entity_type=flow.entity_type,
        nodes=[n.model_dump() for n in flow.nodes],
        description=flow.description,
    )
    return ApiResponse.ok(FlowResponse.model_validate(f))


@router.get("/flows", response_model=ApiResponse)
async def list_flows(
    entity_type: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    flows = await svc.list_flows(entity_type=entity_type)
    items = [FlowResponse.model_validate(f) for f in flows]
    return ApiResponse.ok(items)


@router.get("/flows/{flow_id}", response_model=ApiResponse)
async def get_flow(
    flow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        f = await svc.get_flow(flow_id)
        return ApiResponse.ok(FlowResponse.model_validate(f))
    except ValueError as e:
        return ApiResponse.error("A0001", str(e))


@router.put("/flows/{flow_id}", response_model=ApiResponse)
async def update_flow(
    flow_id: str,
    flow: FlowUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        f = await svc.update_flow(flow_id, [n.model_dump() for n in flow.nodes])
        return ApiResponse.ok(FlowResponse.model_validate(f))
    except ValueError as e:
        return ApiResponse.error("A0001", str(e))


@router.post("/instances", response_model=ApiResponse)
async def start_instance(
    instance: InstanceStart,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.start_instance(
            flow_id=instance.flow_id,
            entity_type=instance.entity_type,
            entity_id=instance.entity_id,
            initiator_id=str(current_user.id),
            init_data=instance.init_data,
        )
        return ApiResponse.ok(InstanceResponse.model_validate(inst))
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))


@router.get("/instances/{instance_id}", response_model=ApiResponse)
async def get_instance(
    instance_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        detail = await svc.get_instance_detail(instance_id)
        inst = detail["instance"]
        flow = detail["flow"]
        initiator_result = await db.execute(select(User).where(User.id == inst.initiator_id))
        initiator = initiator_result.scalar_one_or_none()
        records = []
        for r in detail["records"]:
            approver_result = await db.execute(select(User).where(User.id == r.approver_id))
            approver = approver_result.scalar_one_or_none()
            records.append(
                ApprovalRecordResponse(
                    id=r.id,
                    node_name=r.node_name,
                    approver=_user_brief(approver),
                    action=r.action,
                    comment=r.comment,
                    created_at=r.created_at,
                )
            )
        return ApiResponse.ok(
            InstanceDetailResponse(
                id=inst.id,
                flow=FlowBrief(id=flow.id, name=flow.name, code=flow.code, version=flow.version),
                entity_type=inst.entity_type,
                entity_id=inst.entity_id,
                status=inst.status,
                initiator=_user_brief(initiator),
                current_node_name=detail["current_node_name"],
                records=records,
                created_at=inst.created_at,
            )
        )
    except ValueError as e:
        return ApiResponse.error("A0001", str(e))


@router.get("/instances/{instance_id}/history", response_model=ApiResponse)
async def get_instance_history(
    instance_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    records = await svc.get_instance_history(instance_id)
    items = []
    for r in records:
        approver_result = await db.execute(select(User).where(User.id == r.approver_id))
        approver = approver_result.scalar_one_or_none()
        items.append(
            ApprovalRecordResponse(
                id=r.id,
                node_name=r.node_name,
                approver=_user_brief(approver),
                action=r.action,
                comment=r.comment,
                created_at=r.created_at,
            )
        )
    return ApiResponse.ok(items)


@router.get("/my-pending", response_model=ApiResponse)
async def get_my_pending_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    tasks = await svc.get_pending_tasks(str(current_user.id))
    items = []
    for t in tasks:
        initiator_result = await db.execute(select(User).where(User.id == t["initiator_id"]))
        initiator = initiator_result.scalar_one_or_none()
        items.append(
            TaskResponse(
                id=t["id"],
                instance_id=t["instance_id"],
                node_name=t["node_name"],
                status=t["status"],
                flow_name=t["flow_name"],
                entity_type=t["entity_type"],
                entity_id=t["entity_id"],
                initiator=_user_brief(initiator),
                created_at=t["created_at"],
            )
        )
    return ApiResponse.ok(items)


@router.get("/my-initiated", response_model=ApiResponse)
async def get_my_initiated(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    instances = await svc.get_my_initiated(str(current_user.id))
    items = [InstanceResponse.model_validate(i) for i in instances]
    return ApiResponse.ok(items)


@router.post("/instances/{instance_id}/approve", response_model=ApiResponse)
async def approve(
    instance_id: str,
    comment: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.approve(instance_id, str(current_user.id), comment)
        return ApiResponse.ok({"instance_id": inst.id, "status": inst.status})
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))


@router.post("/instances/{instance_id}/reject", response_model=ApiResponse)
async def reject(
    instance_id: str,
    comment: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.reject(instance_id, str(current_user.id), comment)
        return ApiResponse.ok({"instance_id": inst.id, "status": inst.status})
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))


@router.post("/instances/{instance_id}/cancel", response_model=ApiResponse)
async def cancel(
    instance_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.cancel(instance_id, str(current_user.id))
        return ApiResponse.ok({"instance_id": inst.id, "status": inst.status})
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))


@router.post("/instances/{instance_id}/assign", response_model=ApiResponse)
async def assign(
    instance_id: str,
    assignee_id: str,
    comment: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.assign(instance_id, str(current_user.id), assignee_id, comment)
        return ApiResponse.ok({"instance_id": inst.id, "status": inst.status})
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))


@router.post("/instances/{instance_id}/add-sign", response_model=ApiResponse)
async def add_sign(
    instance_id: str,
    add_user_id: str,
    comment: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = ApprovalService(db)
    try:
        inst = await svc.add_sign(instance_id, str(current_user.id), add_user_id, comment)
        return ApiResponse.ok({"instance_id": inst.id, "status": inst.status})
    except ValueError as e:
        return ApiResponse.error("A0002", str(e))
