"""审批流服务."""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.approval import ApprovalFlow, ApprovalInstance, ApprovalRecord


class ApprovalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_flow(
        self, name: str, code: str, entity_type: str, nodes: list, description: str = None
    ) -> ApprovalFlow:
        flow = ApprovalFlow(
            id=str(uuid.uuid4()),
            name=name,
            code=code,
            description=description,
            entity_type=entity_type,
            nodes=nodes,
            is_active=True,
            version=1,
        )
        self.db.add(flow)
        await self.db.commit()
        await self.db.refresh(flow)
        return flow

    async def update_flow(self, flow_id: str, nodes: list) -> ApprovalFlow:
        result = await self.db.execute(
            select(ApprovalFlow).where(ApprovalFlow.id == flow_id)
        )
        flow = result.scalar_one_or_none()
        if not flow:
            raise ValueError("审批流程不存在")
        flow.nodes = nodes
        flow.version += 1
        await self.db.commit()
        await self.db.refresh(flow)
        return flow

    async def get_flow(self, flow_id: str) -> ApprovalFlow:
        result = await self.db.execute(
            select(ApprovalFlow).where(ApprovalFlow.id == flow_id)
        )
        flow = result.scalar_one_or_none()
        if not flow:
            raise ValueError("审批流程不存在")
        return flow

    async def list_flows(self, entity_type: str = None) -> list[ApprovalFlow]:
        query = select(ApprovalFlow).where(ApprovalFlow.is_active == True)
        if entity_type:
            query = query.where(ApprovalFlow.entity_type == entity_type)
        query = query.order_by(ApprovalFlow.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def start_instance(
        self,
        flow_id: str,
        entity_type: str,
        entity_id: str,
        initiator_id: str,
        init_data: dict = None,
    ) -> ApprovalInstance:
        flow = await self.get_flow(flow_id)
        nodes = flow.nodes or []
        first_approval_node = next(
            (n for n in nodes if n.get("type") == "approval"), None
        )
        if not first_approval_node:
            raise ValueError("流程未定义审批节点")

        instance = ApprovalInstance(
            id=str(uuid.uuid4()),
            flow_id=flow_id,
            entity_type=entity_type,
            entity_id=entity_id,
            current_node_id=first_approval_node.get("id"),
            status="pending",
            initiator_id=initiator_id,
        )
        self.db.add(instance)
        await self.db.flush()

        approver_ids = self._get_node_approvers(first_approval_node)
        if not approver_ids:
            approver_ids = [initiator_id]

        for uid in approver_ids:
            record = ApprovalRecord(
                id=str(uuid.uuid4()),
                instance_id=instance.id,
                node_id=first_approval_node.get("id"),
                node_name=first_approval_node.get("name", "审批"),
                approver_id=uid,
                action="pending",
            )
            self.db.add(record)

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def approve(
        self, instance_id: str, approver_id: str, comment: str = None
    ) -> ApprovalInstance:
        instance = await self._get_instance(instance_id)
        if instance.status != "pending":
            raise ValueError("当前流程状态不允许审批")

        record = await self._find_pending_record(instance_id, approver_id)
        if not record:
            raise ValueError("无待审批记录或无权审批")

        record.action = "approve"
        record.comment = comment
        record.created_at = datetime.utcnow()

        current_node = self._get_node_by_id(instance)
        is_last = self._is_last_node(current_node)

        if is_last:
            instance.status = "approved"
            instance.finished_at = datetime.utcnow()
        else:
            next_node = self._get_next_node(instance, current_node)
            if next_node:
                instance.current_node_id = next_node.get("id")
                for uid in self._get_node_approvers(next_node):
                    r = ApprovalRecord(
                        id=str(uuid.uuid4()),
                        instance_id=instance.id,
                        node_id=next_node.get("id"),
                        node_name=next_node.get("name", "审批"),
                        approver_id=uid,
                        action="pending",
                    )
                    self.db.add(r)

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def reject(
        self, instance_id: str, approver_id: str, comment: str
    ) -> ApprovalInstance:
        instance = await self._get_instance(instance_id)
        if instance.status != "pending":
            raise ValueError("当前流程状态不允许驳回")

        record = await self._find_pending_record(instance_id, approver_id)
        if not record:
            raise ValueError("无待审批记录或无权审批")

        record.action = "reject"
        record.comment = comment
        record.created_at = datetime.utcnow()

        instance.status = "rejected"
        instance.finished_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def cancel(self, instance_id: str, user_id: str) -> ApprovalInstance:
        instance = await self._get_instance(instance_id)
        if instance.initiator_id != user_id:
            raise ValueError("只有发起人可以取消")
        if instance.status not in ("pending",):
            raise ValueError("当前状态不允许取消")

        instance.status = "cancelled"
        instance.finished_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def assign(
        self,
        instance_id: str,
        current_approver_id: str,
        assignee_id: str,
        comment: str = None,
    ) -> ApprovalInstance:
        instance = await self._get_instance(instance_id)
        if instance.status != "pending":
            raise ValueError("当前状态不允许转交")

        record = await self._find_pending_record(instance_id, current_approver_id)
        if not record:
            raise ValueError("无待审批记录或无权转交")

        record.action = "assign"
        record.comment = f"转交给 {assignee_id}" + (f": {comment}" if comment else "")

        new_record = ApprovalRecord(
            id=str(uuid.uuid4()),
            instance_id=instance_id,
            node_id=instance.current_node_id,
            node_name=record.node_name,
            approver_id=assignee_id,
            action="pending",
        )
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def add_sign(
        self,
        instance_id: str,
        current_approver_id: str,
        add_user_id: str,
        comment: str = None,
    ) -> ApprovalInstance:
        instance = await self._get_instance(instance_id)
        if instance.status != "pending":
            raise ValueError("当前状态不允许加签")

        record = await self._find_pending_record(instance_id, current_approver_id)
        if not record:
            raise ValueError("无待审批记录或无权加签")

        new_record = ApprovalRecord(
            id=str(uuid.uuid4()),
            instance_id=instance_id,
            node_id=instance.current_node_id,
            node_name=record.node_name,
            approver_id=add_user_id,
            action="pending",
        )
        self.db.add(new_record)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def get_instance_detail(self, instance_id: str) -> dict:
        result = await self.db.execute(
            select(ApprovalInstance)
            .options(selectinload(ApprovalInstance.flow))
            .where(ApprovalInstance.id == instance_id)
        )
        instance = result.scalar_one_or_none()
        if not instance:
            raise ValueError("审批实例不存在")

        records_result = await self.db.execute(
            select(ApprovalRecord)
            .options(selectinload(ApprovalRecord.approver))
            .where(ApprovalRecord.instance_id == instance_id)
            .order_by(ApprovalRecord.created_at)
        )
        records = list(records_result.scalars().all())

        current_node = self._get_node_by_id(instance)
        current_node_name = current_node.get("name") if current_node else None

        return {
            "id": instance.id,
            "flow": instance.flow,
            "entity_type": instance.entity_type,
            "entity_id": instance.entity_id,
            "status": instance.status,
            "initiator_id": instance.initiator_id,
            "current_node_name": current_node_name,
            "records": records,
            "created_at": instance.created_at,
        }

    async def get_pending_tasks(self, user_id: str) -> list[dict]:
        result = await self.db.execute(
            select(ApprovalRecord)
            .options(
                selectinload(ApprovalRecord.instance).selectinload(ApprovalInstance.flow)
            )
            .where(
                ApprovalRecord.approver_id == user_id,
                ApprovalRecord.action == "pending",
            )
        )
        records = list(result.scalars().all())

        tasks = []
        for record in records:
            inst = record.instance
            tasks.append({
                "id": record.id,
                "instance_id": inst.id,
                "node_name": record.node_name,
                "status": inst.status,
                "flow_name": inst.flow.name if inst.flow else "",
                "entity_type": inst.entity_type,
                "entity_id": inst.entity_id,
                "initiator_id": inst.initiator_id,
                "created_at": inst.created_at,
            })
        return tasks

    async def get_my_initiated(self, user_id: str) -> list[ApprovalInstance]:
        result = await self.db.execute(
            select(ApprovalInstance)
            .options(selectinload(ApprovalInstance.flow))
            .where(ApprovalInstance.initiator_id == user_id)
            .order_by(ApprovalInstance.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_instance_history(self, instance_id: str) -> list[ApprovalRecord]:
        result = await self.db.execute(
            select(ApprovalRecord)
            .options(selectinload(ApprovalRecord.approver))
            .where(ApprovalRecord.instance_id == instance_id)
            .order_by(ApprovalRecord.created_at)
        )
        return list(result.scalars().all())

    def _get_node_approvers(self, node: dict) -> list[str]:
        approvers = []
        for a in node.get("approvers", []):
            if a.get("type") == "user" and a.get("user_id"):
                approvers.append(a["user_id"])
        return approvers

    def _get_next_node(self, instance: ApprovalInstance, current_node: dict) -> dict:
        next_id = current_node.get("next_node_id")
        if not next_id:
            return None
        flow = self.db.query(ApprovalFlow).filter(ApprovalFlow.id == instance.flow_id).first()
        if not flow:
            return None
        for n in (flow.nodes or []):
            if n.get("id") == next_id:
                return n
        return None

    def _is_last_node(self, node: dict) -> bool:
        return node.get("type") in ("end",) or not node.get("next_node_id")

    def _get_node_by_id(self, instance: ApprovalInstance) -> Optional[dict]:
        flow = self.db.query(ApprovalFlow).filter(ApprovalFlow.id == instance.flow_id).first()
        if not flow:
            return None
        for n in (flow.nodes or []):
            if n.get("id") == instance.current_node_id:
                return n
        return None

    async def _get_instance(self, instance_id: str) -> ApprovalInstance:
        result = await self.db.execute(
            select(ApprovalInstance).where(ApprovalInstance.id == instance_id)
        )
        inst = result.scalar_one_or_none()
        if not inst:
            raise ValueError("审批实例不存在")
        return inst

    async def _find_pending_record(
        self, instance_id: str, approver_id: str
    ) -> Optional[ApprovalRecord]:
        result = await self.db.execute(
            select(ApprovalRecord).where(
                ApprovalRecord.instance_id == instance_id,
                ApprovalRecord.approver_id == approver_id,
                ApprovalRecord.action == "pending",
            )
        )
        return result.scalar_one_or_none()
