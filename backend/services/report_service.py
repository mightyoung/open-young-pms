"""Report service."""

import json
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.report import LegacyReport as ReportModel, ReportSubmit
from schemas.report import ReportStats


class ReportService:
    async def create_report(
        self,
        db: AsyncSession,
        author_id: str,
        title: str,
        content: dict,
        report_type: str,
        project_id: str,
    ) -> ReportModel:
        report = ReportModel(
            id=str(uuid.uuid4()),
            title=title,
            content=json.dumps(content, ensure_ascii=False),
            type=report_type,
            project_id=project_id,
            author_id=author_id,
            status="draft",
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        return report

    async def update_report(
        self,
        db: AsyncSession,
        report_id: str,
        author_id: str,
        **kwargs,
    ) -> ReportModel:
        result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return None
        if report.author_id != author_id:
            raise PermissionError("Only the author can update the report")
        for key, value in kwargs.items():
            if value is not None:
                if key == "content":
                    setattr(report, key, json.dumps(value, ensure_ascii=False))
                else:
                    setattr(report, key, value)
        report.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(report)
        return report

    async def submit_report(
        self,
        db: AsyncSession,
        report_id: str,
        author_id: str,
    ) -> ReportModel:
        result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return None
        if report.author_id != author_id:
            raise PermissionError("Only the author can submit the report")
        if report.status not in ("draft", "rejected"):
            raise ValueError(f"Cannot submit report with status: {report.status}")
        report.status = "submitted"
        report.submitted_at = datetime.now(timezone.utc)

        submit_record = ReportSubmit(
            id=str(uuid.uuid4()),
            report_id=report_id,
            submitted_by=author_id,
            submitted_at=datetime.now(timezone.utc),
        )
        db.add(submit_record)
        await db.commit()
        await db.refresh(report)
        return report

    async def approve_report(
        self,
        db: AsyncSession,
        report_id: str,
        approver_id: str,
        comment: str = None,
    ) -> ReportModel:
        result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return None
        if report.status != "submitted":
            raise ValueError(f"Cannot approve report with status: {report.status}")
        report.status = "approved"
        report.approved_at = datetime.now(timezone.utc)
        report.approved_by = approver_id
        report.approval_comment = comment
        await db.commit()
        await db.refresh(report)
        return report

    async def reject_report(
        self,
        db: AsyncSession,
        report_id: str,
        approver_id: str,
        comment: str,
    ) -> ReportModel:
        result = await db.execute(select(ReportModel).where(ReportModel.id == report_id))
        report = result.scalar_one_or_none()
        if not report:
            return None
        if report.status != "submitted":
            raise ValueError(f"Cannot reject report with status: {report.status}")
        report.status = "rejected"
        report.approved_by = approver_id
        report.approval_comment = comment
        await db.commit()
        await db.refresh(report)
        return report

    async def list_reports(
        self,
        db: AsyncSession,
        project_id: str = None,
        report_type: str = None,
        status: str = None,
        page: int = 1,
        page_size: int = 20,
    ):
        query = select(Report)
        if project_id:
            query = query.where(ReportModel.project_id == project_id)
        if report_type:
            query = query.where(ReportModel.type == report_type)
        if status:
            query = query.where(ReportModel.status == status)

        count_q = select(func.count()).select_from(Report)
        if project_id:
            count_q = count_q.where(ReportModel.project_id == project_id)
        if report_type:
            count_q = count_q.where(ReportModel.type == report_type)
        if status:
            count_q = count_q.where(ReportModel.status == status)
        total = (await db.execute(count_q)).scalar() or 0

        query = query.order_by(Report.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        items = (await db.execute(query)).scalars().all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "has_more": (page * page_size) < total,
        }

    async def get_report_stats(
        self,
        db: AsyncSession,
        project_id: str,
        start_date: date,
        end_date: date,
    ) -> ReportStats:
        start_dt = datetime.combine(start_date, datetime.min.time())
        end_dt = datetime.combine(end_date, datetime.max.time())

        query = select(ReportModel).where(
            ReportModel.project_id == project_id,
            Report.created_at >= start_dt,
            Report.created_at <= end_dt,
        )
        result = await db.execute(query)
        reports = result.scalars().all()

        total = len(reports)
        draft_count = sum(1 for r in reports if r.status == "draft")
        submitted_count = sum(1 for r in reports if r.status == "submitted")
        approved_count = sum(1 for r in reports if r.status == "approved")
        rejected_count = sum(1 for r in reports if r.status == "rejected")

        by_type = {}
        for r in reports:
            t = r.type
            by_type[t] = by_type.get(t, 0) + 1

        return ReportStats(
            total_count=total,
            draft_count=draft_count,
            submitted_count=submitted_count,
            approved_count=approved_count,
            rejected_count=rejected_count,
            by_type=by_type,
        )

    async def generate_daily_report(
        self,
        db: AsyncSession,
        project_id: str,
        author_id: str,
        target_date: date,
    ) -> ReportModel:
        date_str = target_date.strftime("%Y-%m-%d")
        title = f"日报 - {date_str}"
        content = {
            "date": date_str,
            "sections": {
                "today_tasks": [],
                "completed_tasks": [],
                "issues": [],
                "tomorrow_plan": [],
            },
            "summary": "",
        }
        return await self.create_report(
            db=db,
            author_id=author_id,
            title=title,
            content=content,
            report_type="daily",
            project_id=project_id,
        )

    async def generate_weekly_report(
        self,
        db: AsyncSession,
        project_id: str,
        author_id: str,
        week_start: date,
    ) -> ReportModel:
        week_end = week_start + timedelta(days=6)
        title = f"周报 - {week_start.strftime('%Y-%m-%d')} ~ {week_end.strftime('%Y-%m-%d')}"
        content = {
            "week_start": week_start.strftime("%Y-%m-%d"),
            "week_end": week_end.strftime("%Y-%m-%d"),
            "sections": {
                "weekly_summary": "",
                "completed_tasks": [],
                "ongoing_tasks": [],
                "next_week_plan": [],
                "metrics": {},
            },
        }
        return await self.create_report(
            db=db,
            author_id=author_id,
            title=title,
            content=content,
            report_type="weekly",
            project_id=project_id,
        )


report_service = ReportService()
