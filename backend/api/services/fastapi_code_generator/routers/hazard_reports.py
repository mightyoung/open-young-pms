"""随手拍隐患上报路由 — generated from PRD v1.2 第十二章."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import (
    HazardReport,
    HazardRectification,
    HazardTransfer,
    RectificationPhoto,
    Notification,
    User,
)
from api.response import ApiResponse, PaginatedResponse, BusinessException
from api.exceptions import ERR_NOT_FOUND
from api.services.fastapi_code_generator.schemas import (
    HazardReportCreate,
    HazardReportResponse,
    HazardAssignRequest,
    HazardConfirmRequest,
    HazardPushRequest,
    HazardTransferRequest,
    RectificationSubmitRequest,
)

router = APIRouter()


# ── 上报 ────────────────────────────────────────────────────


@router.post("", response_model=HazardReportResponse, status_code=status.HTTP_201_CREATED)
async def create_hazard_report(
    data: HazardReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """员工上报隐患。POST /api/v1/hazards"""
    report = HazardReport(
        project_id=data.project_id,
        reporter_id=str(current_user.id),
        hazard_type=data.hazard_type,
        urgency=data.urgency,
        title=data.title,
        description=data.description,
        location=data.location,
        photos=data.photos,
        status="pending",
    )
    db.add(report)
    await db.flush()

    # 通知安全保障部
    notif = Notification(
        user_id=str(current_user.id),  # TODO: 改为安全保障部负责人
        type="hazard_reported",
        title=f"新隐患上报：{data.title[:30]}",
        content=f"位置：{data.location}，请尽快分配",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("", response_model=PaginatedResponse)
async def list_hazard_reports(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    hazard_type: Optional[str] = None,
    project_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查询隐患列表（支持分页和过滤）。GET /api/v1/hazards"""
    query = (
        select(HazardReport).options(selectinload(HazardReport.rectifications)).where(HazardReport.is_draft == False)
    )
    if status:
        query = query.where(HazardReport.status == status)
    if hazard_type:
        query = query.where(HazardReport.hazard_type == hazard_type)
    if project_id:
        query = query.where(HazardReport.project_id == project_id)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(HazardReport.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()
    items = [HazardReportResponse.model_validate(r) for r in rows]

    return PaginatedResponse.ok(items, total, page, page_size)


@router.get("/drafts", response_model=PaginatedResponse)
async def list_hazard_drafts(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """查询草稿箱（仅返回当前用户的草稿）。GET /api/v1/hazards/drafts"""
    query = (
        select(HazardReport).options(selectinload(HazardReport.rectifications))
        .where(HazardReport.is_draft == True)
        .where(HazardReport.reporter_id == str(current_user.id))
    )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(HazardReport.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(query)).scalars().all()
    items = [HazardReportResponse.model_validate(r) for r in rows]

    return PaginatedResponse.ok(items, total, page, page_size)


@router.get("/{report_id}", response_model=HazardReportResponse)
async def get_hazard_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取隐患详情。GET /api/v1/hazards/{id}"""
    result = await db.execute(
        select(HazardReport)
        .options(selectinload(HazardReport.rectifications), selectinload(HazardReport.transfer_logs))
        .where(HazardReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")
    return report


# ── 分配 ────────────────────────────────────────────────────


@router.post("/{report_id}/assign")
async def assign_hazard_report(
    report_id: UUID,
    data: HazardAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """安全保障部将隐患分配给专职安全员。POST /api/v1/hazards/{id}/assign"""
    result = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")
    if report.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="只能分配待分配的隐患")

    report.status = "assigned"
    report.assigned_to_id = data.assigned_to_id
    report.assigned_by_id = current_user.id
    report.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=data.assigned_to_id,
        type="hazard_assigned",
        title="新隐患待确认",
        content=f"隐患「{report.title[:30]}」已分配给您，请及时处理",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "分配成功", "status": report.status}


# ── 转派 ────────────────────────────────────────────────────


@router.post("/{report_id}/transfer")
async def transfer_hazard_report(
    report_id: UUID,
    data: HazardTransferRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员之间转派隐患。POST /api/v1/hazards/{id}/transfer"""
    result = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")
    if report.status not in ("assigned", "confirmed"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前状态不允许转派")

    # 记录转派日志
    transfer = HazardTransfer(
        hazard_report_id=report.id,
        from_user_id=str(current_user.id),
        to_user_id=data.to_user_id,
        reason=data.reason,
    )
    db.add(transfer)

    report.assigned_to_id = data.to_user_id
    report.status = "assigned"
    report.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=data.to_user_id,
        type="hazard_transferred",
        title="隐患已转派给您",
        content=f"隐患「{report.title[:30]}」已从他人转派给您，请处理",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "转派成功", "transfer_id": transfer.id}


# ── 确认/驳回 ──────────────────────────────────────────────


@router.post("/{report_id}/confirm")
async def confirm_hazard_report(
    report_id: UUID,
    data: HazardConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员确认隐患（填写等级/因素/类型）。POST /api/v1/hazards/{id}/confirm"""
    result = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")
    if str(report.assigned_to_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="此隐患不在您的处理范围内")

    report.level = data.level
    report.factor = data.factor
    report.hazard_type = data.hazard_type
    report.status = "confirmed"
    report.confirmed_by_id = current_user.id
    report.confirmed_at = datetime.now(timezone.utc)
    report.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "确认成功", "status": report.status}


@router.post("/{report_id}/reject")
async def reject_hazard_report(
    report_id: UUID,
    reason: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员驳回隐患。POST /api/v1/hazards/{id}/reject"""
    result = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")

    report.status = "rejected"
    report.reject_reason = reason
    report.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=report.reporter_id,
        type="hazard_rejected",
        title="隐患被驳回",
        content=f"您上报的隐患「{report.title[:30]}」已被驳回，原因：{reason}",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "驳回成功", "status": report.status}


# ── 下推 ────────────────────────────────────────────────────


@router.post("/{report_id}/push")
async def push_hazard_report(
    report_id: UUID,
    data: HazardPushRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员将隐患下推给责任部门。POST /api/v1/hazards/{id}/push"""
    result = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="隐患不存在")
    if report.status != "confirmed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="只能下推已确认的隐患")

    rectification = HazardRectification(
        hazard_report_id=report.id,
        handler_id=data.handler_id,
        dept_admin_id=data.dept_admin_id,
        due_date=data.due_date,
        requirement=data.requirement,
        status="pending",
    )
    db.add(rectification)

    report.status = "pushed"
    report.pushed_at = datetime.now(timezone.utc)
    report.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=data.handler_id,
        type="hazard_pushed",
        title="新的整改任务",
        content=f"隐患「{report.title[:30]}」需要您整改，截止日期：{data.due_date.strftime('%Y-%m-%d')}",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "下推成功", "rectification_id": rectification.id}


# ── 整改提交 ───────────────────────────────────────────────


@router.post("/{report_id}/rectify")
async def submit_rectification(
    report_id: UUID,
    data: RectificationSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """整改责任人提交整改。POST /api/v1/hazards/{id}/rectify"""
    result = await db.execute(
        select(HazardRectification)
        .options(selectinload(HazardRectification.photos))
        .where(HazardRectification.hazard_report_id == report_id)
        .where(HazardRectification.status.in_(["pending", "rectifying"]))
    )
    rectification = result.scalar_one_or_none()
    if not rectification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="无待整改任务")
    if str(rectification.handler_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="您不是此隐患的整改责任人")

    rectification.status = "submitted"
    rectification.submitted_at = datetime.now(timezone.utc)

    # 保存整改照片
    for photo_url in data.photos:
        photo = RectificationPhoto(
            rectification_id=rectification.id,
            photo_url=photo_url,
            caption=data.notes,
        )
        db.add(photo)

    # 更新隐患状态
    result2 = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result2.scalar_one()
    report.status = "pending_acceptance"
    report.updated_at = datetime.now(timezone.utc)

    # 通知安全员验收
    notif = Notification(
        user_id=report.assigned_to_id or report.confirmed_by_id,
        type="rectification_submitted",
        title="整改已提交，待验收",
        content=f"隐患「{report.title[:30]}」整改已提交，请进行验收",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "整改提交成功，请等待验收"}


# ── 验收 ────────────────────────────────────────────────────


@router.post("/{report_id}/accept")
async def accept_rectification(
    report_id: UUID,
    comment: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员验收通过。POST /api/v1/hazards/{id}/accept"""
    result = await db.execute(select(HazardRectification).where(HazardRectification.hazard_report_id == report_id))
    rectification = result.scalar_one_or_none()
    if not rectification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="整改记录不存在")

    rectification.acceptance_status = "accepted"
    rectification.acceptance_comment = comment
    rectification.accepted_by_id = current_user.id
    rectification.accepted_at = datetime.now(timezone.utc)
    rectification.status = "accepted"

    result2 = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result2.scalar_one()
    report.status = "closed"
    report.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return {"message": "验收通过，隐患处置完毕"}


@router.post("/{report_id}/reject-rectification")
async def reject_rectification(
    report_id: UUID,
    comment: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """专职安全员验收不通过，退回整改。POST /api/v1/hazards/{id}/reject-rectification"""
    result = await db.execute(select(HazardRectification).where(HazardRectification.hazard_report_id == report_id))
    rectification = result.scalar_one_or_none()
    if not rectification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="整改记录不存在")

    rectification.acceptance_status = "rejected"
    rectification.acceptance_comment = comment
    rectification.accepted_by_id = current_user.id
    rectification.accepted_at = datetime.now(timezone.utc)
    rectification.status = "rectifying"  # 退回重新整改

    result2 = await db.execute(select(HazardReport).where(HazardReport.id == report_id))
    report = result2.scalar_one()
    report.status = "rectifying"
    report.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=rectification.handler_id,
        type="rectification_rejected",
        title="整改未通过，需重新整改",
        content=f"隐患「{report.title[:30]}」整改验收未通过，原因：{comment}",
        entity_type="hazard_report",
        entity_id=report.id,
    )
    db.add(notif)
    await db.commit()
    return {"message": "已退回，请重新整改"}


# ── 统计 ────────────────────────────────────────────────────


@router.get("/stats/summary")
async def hazard_stats_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """隐患统计摘要。GET /api/v1/hazards/stats/summary"""
    status_counts = {}
    type_counts = {}
    for status_val in [
        "pending",
        "assigned",
        "confirmed",
        "pushed",
        "rectifying",
        "pending_acceptance",
        "closed",
        "rejected",
    ]:
        q = select(func.count(HazardReport.id)).where(HazardReport.status == status_val)
        count = (await db.execute(q)).scalar() or 0
        status_counts[status_val] = count
    for type_val in ["safety", "quality", "environment"]:
        q = select(func.count(HazardReport.id)).where(HazardReport.hazard_type == type_val)
        count = (await db.execute(q)).scalar() or 0
        type_counts[type_val] = count
    total = sum(status_counts.values())
    return {"total": total, "by_status": status_counts, "by_type": type_counts}


# ── 草稿 ────────────────────────────────────────────────────


@router.get("/drafts", response_model=PaginatedResponse)
async def list_drafts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取当前用户的草稿列表。GET /api/v1/hazards/drafts"""
    query = (
        select(HazardReport)
        .where(HazardReport.reporter_id == str(current_user.id))
        .where(HazardReport.is_draft == True)
        .order_by(HazardReport.auto_saved_at.desc())
    )
    rows = (await db.execute(query)).scalars().all()
    items = [HazardReportResponse.model_validate(r) for r in rows]
    return PaginatedResponse.ok(items, len(items))


@router.post("/drafts", response_model=HazardReportResponse, status_code=status.HTTP_201_CREATED)
async def save_draft(
    data: HazardReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """保存随手拍草稿。POST /api/v1/hazards/drafts"""
    draft = HazardReport(
        reporter_id=str(current_user.id),
        is_draft=True,
        auto_saved_at=datetime.now(timezone.utc),
        title=data.title[:300] if data.title else "草稿",
        description=data.description or "",
        hazard_type=data.hazard_type,
        urgency=data.urgency or "normal",
        location=data.location or "",
        photos=data.photos or [],
        status="pending",
    )
    db.add(draft)
    await db.commit()
    await db.refresh(draft)
    return draft


@router.delete("/drafts/{draft_id}")
async def delete_draft(
    draft_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除草稿。DELETE /api/v1/hazards/drafts/{id}"""
    result = await db.execute(
        select(HazardReport).where(
            HazardReport.id == str(draft_id),
            HazardReport.reporter_id == str(current_user.id),
            HazardReport.is_draft == True,
        )
    )
    draft = result.scalar_one_or_none()
    if not draft:
        raise BusinessException(ERR_NOT_FOUND, "草稿不存在")
    await db.delete(draft)
    await db.commit()
    return ApiResponse.ok()
