"""WBS任务服务."""
import uuid
from datetime import datetime, date, timezone
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.task import Task as WBSTask


class TaskService:
    """任务服务（支持WBS分解）"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_task(
        self, project_id: str, title: str, created_by: str,
        parent_id: Optional[str] = None, **kwargs
    ) -> WBSTask:
        if parent_id:
            parent_result = await self.db.execute(select(WBSTask).where(WBSTask.id == parent_id))
            parent = parent_result.scalar_one_or_none()
            if not parent:
                raise ValueError("父任务不存在")
            level = parent.level + 1
            siblings_result = await self.db.execute(
                select(func.count(WBSTask.id)).where(
                    WBSTask.project_id == parent.project_id,
                    WBSTask.parent_id == parent_id,
                )
            )
            sibling_count = siblings_result.scalar() or 0
            wbs_code = f"{parent.wbs_code}.{sibling_count + 1}" if parent.wbs_code else str(sibling_count + 1)
        else:
            level = 0
            root_result = await self.db.execute(
                select(func.count(WBSTask.id)).where(
                    WBSTask.project_id == project_id,
                    WBSTask.parent_id.is_(None),
                )
            )
            root_count = root_result.scalar() or 0
            wbs_code = str(root_count + 1)

        task = WBSTask(
            id=str(uuid.uuid4()),
            project_id=project_id,
            parent_id=parent_id,
            title=title,
            description=kwargs.get("description"),
            wbs_code=wbs_code,
            level=level,
            planned_start=kwargs.get("planned_start"),
            planned_end=kwargs.get("planned_end"),
            assignee_id=kwargs.get("assignee_id"),
            created_by=created_by,
            status="pending",
            progress=0,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def update_task(self, task_id: str, user_id: str, **kwargs) -> WBSTask:
        result = await self.db.execute(select(WBSTask).where(WBSTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("任务不存在")

        for key, value in kwargs.items():
            if value is not None and hasattr(task, key):
                setattr(task, key, value)

        task.updated_at = datetime.now(timezone.utc)

        if kwargs.get("status") == "completed" and task.status != "completed":
            task.actual_end = datetime.now(timezone.utc)
        elif kwargs.get("status") == "in_progress" and task.status == "pending":
            task.actual_start = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task(self, task_id: str) -> bool:
        result = await self.db.execute(select(WBSTask).where(WBSTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("任务不存在")

        children_result = await self.db.execute(select(WBSTask).where(WBSTask.parent_id == task_id))
        if children_result.scalars().first():
            raise ValueError("请先删除子任务")

        await self.db.delete(task)
        await self.db.commit()
        return True

    async def get_task_tree(self, project_id: str) -> list[dict]:
        result = await self.db.execute(
            select(WBSTask)
            .options(selectinload(WBSTask.assignee), selectinload(WBSTask.children))
            .where(WBSTask.project_id == project_id)
            .order_by(WBSTask.sort_order, WBSTask.created_at)
        )
        tasks = result.scalars().all()

        def to_dict(t: WBSTask) -> dict:
            return {
                "id": str(t.id),
                "title": t.title,
                "description": t.description,
                "wbs_code": t.wbs_code,
                "level": t.level,
                "progress": t.progress,
                "status": t.status,
                "planned_start": t.planned_start,
                "planned_end": t.planned_end,
                "assignee": {
                    "id": str(t.assignee.id),
                    "username": t.assignee.username,
                    "full_name": t.assignee.full_name,
                } if t.assignee else None,
                "children": [to_dict(c) for c in tasks if str(c.parent_id) == str(t.id)],
            }

        roots = [t for t in tasks if t.parent_id is None or not any(str(c.parent_id) == str(t.id) for c in tasks)]
        return [to_dict(r) for r in roots]

    async def get_gantt_data(self, project_id: str, start_date: date = None, end_date: date = None) -> list[dict]:
        query = select(WBSTask).options(selectinload(WBSTask.assignee)).where(WBSTask.project_id == project_id)
        if start_date:
            query = query.where(WBSTask.planned_end >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.where(WBSTask.planned_start <= datetime.combine(end_date, datetime.max.time()))

        result = await self.db.execute(query.order_by(WBSTask.wbs_code))
        tasks = result.scalars().all()

        return [
            {
                "id": str(t.id),
                "title": t.title,
                "wbs_code": t.wbs_code or "",
                "level": t.level,
                "planned_start": t.planned_start,
                "planned_end": t.planned_end,
                "actual_start": t.actual_start,
                "actual_end": t.actual_end,
                "progress": t.progress,
                "status": t.status,
                "assignee": {
                    "id": str(t.assignee.id),
                    "username": t.assignee.username,
                    "full_name": t.assignee.full_name,
                } if t.assignee else None,
                "dependencies": t.dependencies or [],
            }
            for t in tasks
        ]

    async def get_kanban_board(self, project_id: str) -> dict:
        result = await self.db.execute(
            select(WBSTask)
            .options(selectinload(WBSTask.assignee))
            .where(WBSTask.project_id == project_id)
            .order_by(WBSTask.sort_order)
        )
        tasks = result.scalars().all()

        columns = {"pending": [], "in_progress": [], "completed": [], "cancelled": []}
        for t in tasks:
            if t.status in columns:
                columns[t.status].append({
                    "id": str(t.id),
                    "title": t.title,
                    "wbs_code": t.wbs_code,
                    "level": t.level,
                    "progress": t.progress,
                    "status": t.status,
                    "planned_start": t.planned_start,
                    "planned_end": t.planned_end,
                    "assignee": {
                        "id": str(t.assignee.id),
                        "username": t.assignee.username,
                        "full_name": t.assignee.full_name,
                    } if t.assignee else None,
                    "children": [],
                })
        return {k: {"tasks": v, "count": len(v)} for k, v in columns.items()}

    async def assign_task(self, task_id: str, assignee_id: str) -> WBSTask:
        result = await self.db.execute(select(WBSTask).where(WBSTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("任务不存在")
        task.assignee_id = assignee_id
        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def update_progress(self, task_id: str, progress: int) -> WBSTask:
        if not 0 <= progress <= 100:
            raise ValueError("进度必须在0-100之间")
        result = await self.db.execute(select(WBSTask).where(WBSTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("任务不存在")
        task.progress = progress
        if progress == 100:
            task.status = "completed"
            task.actual_end = datetime.now(timezone.utc)
        elif progress > 0 and task.status == "pending":
            task.status = "in_progress"
            task.actual_start = datetime.now(timezone.utc)
        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def add_dependency(self, task_id: str, depends_on_id: str) -> WBSTask:
        if task_id == depends_on_id:
            raise ValueError("任务不能依赖自己")
        result = await self.db.execute(select(WBSTask).where(WBSTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            raise ValueError("任务不存在")
        dep_result = await self.db.execute(select(WBSTask).where(WBSTask.id == depends_on_id))
        if not dep_result.scalar_one_or_none():
            raise ValueError("依赖的任务不存在")
        deps = task.dependencies or []
        if depends_on_id not in deps:
            deps.append(depends_on_id)
            task.dependencies = deps
            task.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(task)
        return task

    async def calculate_critical_path(self, project_id: str) -> list[str]:
        result = await self.db.execute(
            select(WBSTask).where(WBSTask.project_id == project_id).order_by(WBSTask.planned_start)
        )
        tasks = result.scalars().all()
        if not tasks:
            return []

        task_map = {str(t.id): t for t in tasks}

        def calc_earliest(task: WBSTask) -> datetime:
            if not task.dependencies:
                return task.planned_start or datetime.now(timezone.utc)
            return max(
                (task_map[dep_id].planned_end or datetime.now(timezone.utc))
                for dep_id in task.dependencies
                if dep_id in task_map
            )

        project_end = max(
            (t.planned_end or datetime.now(timezone.utc) for t in tasks if t.planned_end),
            default=datetime.now(timezone.utc)
        )
        critical = []
        for t in tasks:
            if not t.dependencies and t.planned_end == project_end:
                critical.append(str(t.id))
                continue
            earliest = calc_earliest(t)
            if earliest >= (t.planned_end or datetime.now(timezone.utc)):
                critical.append(str(t.id))
        return critical

    async def get_task_statistics(self, project_id: str) -> dict:
        result = await self.db.execute(select(WBSTask).where(WBSTask.project_id == project_id))
        tasks = result.scalars().all()
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        pending = sum(1 for t in tasks if t.status == "pending")
        cancelled = sum(1 for t in tasks if t.status == "cancelled")
        total_progress = sum(t.progress for t in tasks)
        return {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "cancelled": cancelled,
            "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
            "average_progress": total_progress // total if total > 0 else 0,
        }
