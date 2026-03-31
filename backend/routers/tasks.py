"""WBS任务管理路由."""
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from models.task import Task as WBSTask, TaskComment as WBSTaskComment
from schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, GanttTask,
    KanbanBoard, CommentCreate, CommentResponse, UserBrief,
)

router = APIRouter()


def _task_to_response(task: WBSTask, children: list = None) -> TaskResponse:
    assignee = None
    if task.assignee:
        assignee = UserBrief(id=str(task.assignee.id), username=task.assignee.username, full_name=task.assignee.full_name)
    return TaskResponse(
        id=str(task.id),
        title=task.title,
        description=task.description,
        wbs_code=task.wbs_code,
        level=task.level,
        progress=task.progress,
        status=task.status,
        planned_start=task.planned_start,
        planned_end=task.planned_end,
        assignee=assignee,
        children=children or [],
        created_at=task.created_at,
    )


@router.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = str(current_user.id)
    
    if data.parent_id:
        parent_result = await db.execute(select(WBSTask).where(WBSTask.id == data.parent_id))
        parent = parent_result.scalar_one_or_none()
        if not parent:
            raise HTTPException(status_code=404, detail="父任务不存在")
        level = parent.level + 1
        
        siblings_result = await db.execute(
            select(func.count(WBSTask.id)).where(
                WBSTask.project_id == parent.project_id,
                WBSTask.parent_id == data.parent_id,
            )
        )
        sibling_count = siblings_result.scalar() or 0
        wbs_code = f"{parent.wbs_code}.{sibling_count + 1}" if parent.wbs_code else str(sibling_count + 1)
    else:
        level = 0
        if data.project_id:
            root_result = await db.execute(
                select(func.count(WBSTask.id)).where(
                    WBSTask.project_id == data.project_id,
                    WBSTask.parent_id.is_(None),
                )
            )
            root_count = root_result.scalar() or 0
            wbs_code = str(root_count + 1)
        else:
            wbs_code = None

    task = WBSTask(
        project_id=str(data.project_id),
        parent_id=str(data.parent_id) if data.parent_id else None,
        title=data.title,
        description=data.description,
        wbs_code=wbs_code,
        level=level,
        planned_start=data.planned_start,
        planned_end=data.planned_end,
        assignee_id=str(data.assignee_id) if data.assignee_id else None,
        created_by=user_id,
        status="pending",
        progress=0,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return _task_to_response(task)


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WBSTask)
        .options(selectinload(WBSTask.assignee), selectinload(WBSTask.children))
        .where(WBSTask.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return _task_to_response(task)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "assignee_id" and value is not None:
            setattr(task, key, str(value))
        elif value is not None:
            setattr(task, key, value)
    
    task.updated_at = datetime.utcnow()
    
    if data.status == "completed" and task.status != "completed":
        task.actual_end = datetime.utcnow()
    elif data.status == "in_progress" and task.status == "pending":
        task.actual_start = datetime.utcnow()
    
    await db.commit()
    await db.refresh(task)
    return _task_to_response(task)


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    children_result = await db.execute(select(WBSTask).where(WBSTask.parent_id == task_id))
    if children_result.scalars().first():
        raise HTTPException(status_code=400, detail="请先删除子任务")

    await db.delete(task)
    await db.commit()


@router.get("/projects/{project_id}/tasks/tree", response_model=list[TaskResponse])
async def get_task_tree(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WBSTask)
        .options(selectinload(WBSTask.assignee), selectinload(WBSTask.children))
        .where(WBSTask.project_id == project_id)
        .order_by(WBSTask.sort_order, WBSTask.created_at)
    )
    tasks = result.scalars().all()
    
    task_map = {str(t.id): t for t in tasks}
    root_tasks = []
    
    for t in tasks:
        if t.parent_id is None or str(t.parent_id) not in task_map:
            root_tasks.append(t)
    
    def build_tree(task: WBSTask) -> TaskResponse:
        children = [_build_child(c) for c in tasks if c.parent_id == task.id]
        return _task_to_response(task, children)
    
    def _build_child(t: WBSTask) -> TaskResponse:
        ch = [_build_child(c) for c in tasks if c.parent_id == t.id]
        return _task_to_response(t, ch)
    
    return [build_tree(t) for t in root_tasks]


@router.get("/projects/{project_id}/tasks/gantt", response_model=list[GanttTask])
async def get_gantt_data(
    project_id: str,
    start_date: date = None,
    end_date: date = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(WBSTask).options(selectinload(WBSTask.assignee)).where(WBSTask.project_id == project_id)
    
    if start_date:
        query = query.where(WBSTask.planned_end >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.where(WBSTask.planned_start <= datetime.combine(end_date, datetime.max.time()))
    
    result = await db.execute(query.order_by(WBSTask.wbs_code))
    tasks = result.scalars().all()
    
    return [
        GanttTask(
            id=str(t.id),
            title=t.title,
            wbs_code=t.wbs_code or "",
            level=t.level,
            planned_start=t.planned_start,
            planned_end=t.planned_end,
            actual_start=t.actual_start,
            actual_end=t.actual_end,
            progress=t.progress,
            status=t.status,
            assignee=UserBrief(id=str(t.assignee.id), username=t.assignee.username, full_name=t.assignee.full_name) if t.assignee else None,
            dependencies=t.dependencies or [],
        )
        for t in tasks
    ]


@router.get("/projects/{project_id}/tasks/kanban", response_model=KanbanBoard)
async def get_kanban_board(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WBSTask)
        .options(selectinload(WBSTask.assignee))
        .where(WBSTask.project_id == project_id)
        .order_by(WBSTask.sort_order)
    )
    tasks = result.scalars().all()
    
    columns = {"pending": [], "in_progress": [], "completed": [], "cancelled": []}
    for t in tasks:
        if t.status in columns:
            columns[t.status].append(_task_to_response(t))
    
    return KanbanBoard(
        columns={
            status: {"tasks": tasks_list, "count": len(tasks_list)}
            for status, tasks_list in columns.items()
        }
    )


@router.post("/tasks/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: str,
    assignee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task.assignee_id = assignee_id
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return _task_to_response(task)


@router.put("/tasks/{task_id}/progress", response_model=TaskResponse)
async def update_progress(
    task_id: str,
    progress: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not 0 <= progress <= 100:
        raise HTTPException(status_code=400, detail="进度必须在0-100之间")
    
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    task.progress = progress
    if progress == 100 and task.status != "completed":
        task.status = "completed"
        task.actual_end = datetime.utcnow()
    elif progress > 0 and task.status == "pending":
        task.status = "in_progress"
        task.actual_start = datetime.utcnow()
    
    task.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(task)
    return _task_to_response(task)


@router.post("/tasks/{task_id}/dependencies", response_model=TaskResponse)
async def add_dependency(
    task_id: str,
    depends_on_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if task_id == depends_on_id:
        raise HTTPException(status_code=400, detail="任务不能依赖自己")
    
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    dep_result = await db.execute(select(WBSTask).where(WBSTask.id == depends_on_id))
    if not dep_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="依赖的任务不存在")
    
    deps = task.dependencies or []
    if str(depends_on_id) not in deps:
        deps.append(str(depends_on_id))
        task.dependencies = deps
        task.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(task)
    
    return _task_to_response(task)


@router.get("/projects/{project_id}/tasks/critical-path", response_model=list[str])
async def get_critical_path(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WBSTask)
        .where(WBSTask.project_id == project_id)
        .order_by(WBSTask.planned_start)
    )
    tasks = result.scalars().all()
    
    if not tasks:
        return []
    
    task_map = {str(t.id): t for t in tasks}
    
    def calc_earliest(task: WBSTask) -> datetime:
        if not task.dependencies:
            return task.planned_start or datetime.utcnow()
        max_end = max(
            (task_map[dep_id].planned_end or datetime.utcnow())
            for dep_id in task.dependencies
            if dep_id in task_map
        )
        return max_end
    
    def calc_latest(task: WBSTask, project_end: datetime) -> datetime:
        children = [t for t in tasks if str(t.parent_id) == str(task.id)]
        if not children:
            return task.planned_end or project_end
        return min((c.planned_start or project_end) for c in children)
    
    project_end = max((t.planned_end or datetime.utcnow() for t in tasks if t.planned_end), default=datetime.utcnow())
    
    critical = []
    for t in tasks:
        if not t.dependencies and t.planned_end == project_end:
            critical.append(str(t.id))
            continue
        earliest = calc_earliest(t)
        latest = calc_latest(t, project_end)
        if earliest == latest or (t.planned_end and earliest >= t.planned_end):
            critical.append(str(t.id))
    
    return critical


@router.get("/projects/{project_id}/tasks/stats")
async def get_task_statistics(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WBSTask).where(WBSTask.project_id == project_id))
    tasks = result.scalars().all()
    
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    in_progress = sum(1 for t in tasks if t.status == "in_progress")
    pending = sum(1 for t in tasks if t.status == "pending")
    cancelled = sum(1 for t in tasks if t.status == "cancelled")
    
    total_progress = sum(t.progress for t in tasks)
    avg_progress = total_progress // total if total > 0 else 0
    
    return {
        "total": total,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "cancelled": cancelled,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0,
        "average_progress": avg_progress,
    }


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=201)
async def add_comment(
    task_id: str,
    comment: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(WBSTask).where(WBSTask.id == task_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="任务不存在")
    
    db_comment = WBSTaskComment(
        task_id=task_id,
        user_id=str(current_user.id),
        content=comment.content,
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    
    return CommentResponse(
        id=str(db_comment.id),
        content=db_comment.content,
        author=UserBrief(
            id=str(current_user.id),
            username=current_user.username,
            full_name=current_user.full_name,
        ),
        created_at=db_comment.created_at,
    )


@router.get("/tasks/{task_id}/comments")
async def get_comments(
    task_id: str,
    db: AsyncSession = Depends(get_db),
):
    from api.services.fastapi_code_generator.models import User
    
    result = await db.execute(
        select(WBSTaskComment)
        .where(WBSTaskComment.task_id == task_id)
        .order_by(WBSTaskComment.created_at)
    )
    comments = result.scalars().all()
    
    responses = []
    for c in comments:
        user_result = await db.execute(select(User).where(User.id == c.user_id))
        user = user_result.scalar_one_or_none()
        author = UserBrief(
            id=c.user_id,
            username=user.username if user else "",
            full_name=user.full_name if user else "",
        )
        responses.append(CommentResponse(
            id=str(c.id),
            content=c.content,
            author=author,
            created_at=c.created_at,
        ))
    
    return responses
