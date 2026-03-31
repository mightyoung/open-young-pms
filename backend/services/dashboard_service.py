"""监测看板服务."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.task import Task as WBSTask
from models.report import Report as ReportModel
from api.services.fastapi_code_generator.models import HazardReport
from schemas.dashboard import TrafficLight, EarlyWarning, ProjectCockpit


TRAFFIC_LIGHT_RULES = {
    "progress": {
        "green": {"min": 0, "max": 10},
        "yellow": {"min": 10, "max": 20},
        "red": {"min": 20, "max": 100},
    },
    "quality": {
        "green": {"max_issues": 5},
        "yellow": {"max_issues": 10},
        "red": {"min_issues": 11},
    },
    "safety": {
        "green": {"pending": 0},
        "yellow": {"pending": 1},
        "red": {"pending": 2},
    },
    "budget": {
        "green": {"utilization": "<= 80"},
        "yellow": {"utilization": "80-95"},
        "red": {"utilization": "> 95"},
    },
}


class DashboardService:
    """监测看板服务"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_traffic_light(self, project_id: str) -> TrafficLight:
        now = datetime.now(timezone.utc)

        progress_light = await self._calc_progress_light(project_id)
        quality_light = await self._calc_quality_light(project_id)
        safety_light = await self._calc_safety_light(project_id)
        budget_light = await self._calc_budget_light(project_id)

        return TrafficLight(
            progress=progress_light,
            quality=quality_light,
            safety=safety_light,
            budget=budget_light,
            updated_at=now,
        )

    async def _calc_progress_light(self, project_id: str) -> str:
        result = await self.db.execute(
            select(func.count(WBSTask.id)).where(WBSTask.project_id == project_id)
        )
        total = result.scalar() or 0
        if total == 0:
            return "green"

        result = await self.db.execute(
            select(WBSTask).where(
                WBSTask.project_id == project_id,
                WBSTask.planned_end < datetime.now(timezone.utc),
                WBSTask.status != "completed",
            )
        )
        overdue_tasks = result.scalars().all()
        overdue_pct = len(overdue_tasks) / total * 100

        rules = TRAFFIC_LIGHT_RULES["progress"]
        if overdue_pct <= rules["green"]["max"]:
            return "green"
        elif overdue_pct <= rules["yellow"]["max"]:
            return "yellow"
        return "red"

    async def _calc_quality_light(self, project_id: str) -> str:
        result = await self.db.execute(
            select(func.count(HazardReport.id)).where(
                HazardReport.project_id == project_id,
                HazardReport.status.in_(["pending", "assigned", "confirmed", "pushed", "rectifying"]),
            )
        )
        pending_issues = result.scalar() or 0

        rules = TRAFFIC_LIGHT_RULES["quality"]
        if pending_issues <= rules["green"]["max_issues"]:
            return "green"
        elif pending_issues <= rules["yellow"]["max_issues"]:
            return "yellow"
        return "red"

    async def _calc_safety_light(self, project_id: str) -> str:
        result = await self.db.execute(
            select(func.count(HazardReport.id)).where(
                HazardReport.project_id == project_id,
                HazardReport.hazard_type == "safety",
                HazardReport.status == "pending",
            )
        )
        pending = result.scalar() or 0

        rules = TRAFFIC_LIGHT_RULES["safety"]
        if pending == rules["green"]["pending"]:
            return "green"
        elif pending <= rules["yellow"]["pending"]:
            return "yellow"
        return "red"

    async def _calc_budget_light(self, project_id: str) -> str:
        from models import Project

        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project or not project.budget or project.budget <= 0:
            return "green"

        result = await self.db.execute(
            select(func.coalesce(func.sum(WBSTask.estimated_hours), 0)).where(
                WBSTask.project_id == project_id
            )
        )
        used_hours = float(result.scalar() or 0)
        utilization = used_hours / project.budget * 100

        _rules = TRAFFIC_LIGHT_RULES["budget"]
        if utilization <= 80:
            return "green"
        elif utilization <= 95:
            return "yellow"
        return "red"

    async def get_project_statistics(self, project_id: str) -> dict:
        task_result = await self.db.execute(
            select(WBSTask).where(WBSTask.project_id == project_id)
        )
        tasks = task_result.scalars().all()

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        in_progress = sum(1 for t in tasks if t.status == "in_progress")
        overdue = sum(
            1
            for t in tasks
            if t.planned_end
            and t.planned_end < datetime.now(timezone.utc)
            and t.status != "completed"
        )

        total_progress = sum(t.progress for t in tasks)
        avg_progress = total_progress // total if total > 0 else 0

        issue_result = await self.db.execute(
            select(func.count(HazardReport.id)).where(HazardReport.project_id == project_id)
        )
        total_issues = issue_result.scalar() or 0

        issue_status_result = await self.db.execute(
            select(
                HazardReport.status,
                func.count(HazardReport.id),
            )
            .where(HazardReport.project_id == project_id)
            .group_by(HazardReport.status)
        )
        issue_by_status = {row[0]: row[1] for row in issue_status_result.all()}

        report_result = await self.db.execute(
            select(func.count(ReportModel.id)).where(ReportModel.project_id == project_id)
        )
        total_reports = report_result.scalar() or 0

        report_status_result = await self.db.execute(
            select(
                ReportModel.status,
                func.count(ReportModel.id),
            )
            .where(ReportModel.project_id == project_id)
            .group_by(ReportModel.status)
        )
        report_by_status = {row[0]: row[1] for row in report_status_result.all()}

        return {
            "task_stats": {
                "total": total,
                "completed": completed,
                "in_progress": in_progress,
                "overdue": overdue,
                "average_progress": avg_progress,
            },
            "issue_stats": {
                "total": total_issues,
                "pending": issue_by_status.get("pending", 0)
                + issue_by_status.get("assigned", 0)
                + issue_by_status.get("confirmed", 0),
                "fixing": issue_by_status.get("rectifying", 0)
                + issue_by_status.get("pushed", 0),
                "resolved": issue_by_status.get("closed", 0),
            },
            "report_stats": {
                "total": total_reports,
                "draft": report_by_status.get("draft", 0),
                "pending": report_by_status.get("submitted", 0),
                "approved": report_by_status.get("approved", 0),
            },
        }

    async def get_project_cockpit(self, project_id: str) -> ProjectCockpit:
        from models import Project

        result = await self.db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise ValueError("项目不存在")

        stats = await self.get_project_statistics(project_id)
        traffic_light = await self.get_traffic_light(project_id)

        task_result = await self.db.execute(
            select(WBSTask)
            .where(WBSTask.project_id == project_id)
            .order_by(WBSTask.created_at.desc())
            .limit(5)
        )
        recent_tasks = [
            {"id": str(t.id), "title": t.title, "status": t.status, "progress": t.progress}
            for t in task_result.scalars().all()
        ]

        deadline_result = await self.db.execute(
            select(WBSTask)
            .where(
                WBSTask.project_id == project_id,
                WBSTask.planned_end.isnot(None),
                WBSTask.planned_end >= datetime.now(timezone.utc),
                WBSTask.status != "completed",
            )
            .order_by(WBSTask.planned_end)
            .limit(5)
        )
        upcoming = [
            {"id": str(t.id), "title": t.title, "due_date": t.planned_end}
            for t in deadline_result.scalars().all()
        ]

        avg_progress = stats["task_stats"]["average_progress"]

        return ProjectCockpit(
            project_id=str(project_id),
            project_name=project.name,
            progress=avg_progress,
            budget_utilization=0.0,
            issue_stats=stats["issue_stats"],
            task_stats=stats["task_stats"],
            report_stats=stats["report_stats"],
            traffic_light=traffic_light,
            recent_issues=recent_tasks,
            upcoming_deadlines=upcoming,
        )

    async def get_early_warnings(self, project_id: str = None) -> list[EarlyWarning]:
        warnings = []
        now = datetime.now(timezone.utc)

        query = select(HazardReport).where(
            HazardReport.status.in_(["pending", "assigned", "confirmed", "rectifying", "pushed"])
        )
        if project_id:
            query = query.where(HazardReport.project_id == project_id)

        result = await self.db.execute(query)
        hazard_reports = result.scalars().all()

        for hr in hazard_reports:
            if hr.hazard_type == "safety" and hr.status == "pending":
                level = "critical" if hr.urgency == "urgent" else "warning"
                warnings.append(
                    EarlyWarning(
                        id=str(uuid.uuid4()),
                        type="safety",
                        level=level,
                        title=f"安全隐患待处理：{hr.title}",
                        description=hr.description or "",
                        project_id=str(hr.project_id) if hr.project_id else "",
                        project_name="",
                        created_at=hr.created_at,
                    )
                )

        task_query = select(WBSTask).where(
            WBSTask.planned_end < now,
            WBSTask.status != "completed",
        )
        if project_id:
            task_query = task_query.where(WBSTask.project_id == project_id)

        task_result = await self.db.execute(task_query)
        overdue_tasks = task_result.scalars().all()

        for task in overdue_tasks:
            overdue_days = (now - (task.planned_end or now)).days
            level = "critical" if overdue_days > 7 else "warning"
            warnings.append(
                EarlyWarning(
                    id=str(uuid.uuid4()),
                    type="progress",
                    level=level,
                    title=f"任务逾期：{task.title}",
                    description=f"已逾期 {overdue_days} 天",
                    project_id=str(task.project_id) if hasattr(task, "project_id") else "",
                    project_name="",
                    created_at=task.updated_at or now,
                )
            )

        return sorted(warnings, key=lambda w: (w.level == "warning", w.created_at), reverse=True)[:20]

    async def get_department_overview(self, department_id: str) -> dict:
        from models import Department, Project, User

        dept_result = await self.db.execute(
            select(Department).where(Department.id == department_id)
        )
        dept = dept_result.scalar_one_or_none()
        if not dept:
            raise ValueError("部门不存在")

        project_result = await self.db.execute(
            select(Project).where(Project.department_id == department_id)
        )
        projects = project_result.scalars().all()

        project_count = len(projects)

        traffic_lights = []
        for p in projects:
            try:
                tl = await self.get_traffic_light(str(p.id))
                traffic_lights.append({"id": str(p.id), "name": p.name, "light": tl})
            except Exception:
                pass

        normal = sum(1 for tl in traffic_lights if tl["light"].progress == "green")
        warning = sum(
            1
            for tl in traffic_lights
            if tl["light"].progress in ("yellow", "yellow", "yellow")
        )
        danger = sum(1 for tl in traffic_lights if tl["light"].progress == "red")

        issue_result = await self.db.execute(
            select(func.count(HazardReport.id)).where(
                HazardReport.project_id.in_([str(p.id) for p in projects])
            )
        )
        total_issues = issue_result.scalar() or 0

        member_result = await self.db.execute(
            select(func.count(User.id)).where(User.department_id == department_id)
        )
        member_count = member_result.scalar() or 0

        return {
            "department_id": str(department_id),
            "department_name": dept.name,
            "project_count": project_count,
            "project_stats": {"total": project_count, "normal": normal, "warning": warning, "danger": danger},
            "issue_stats": {"total": total_issues},
            "member_count": member_count,
            "recent_updates": [],
        }

    async def get_company_overview(self) -> dict:
        from models import Company, Project, Department, User

        result = await self.db.execute(select(Company))
        companies = result.scalars().all()

        total_projects = 0
        total_members = 0
        dept_overviews = []

        for company in companies:
            dept_result = await self.db.execute(
                select(Department).where(Department.company_id == company.id)
            )
            depts = dept_result.scalars().all()

            for dept in depts:
                project_result = await self.db.execute(
                    select(Project).where(Project.department_id == dept.id)
                )
                projects = project_result.scalars().all()
                project_count = len(projects)
                total_projects += project_count

                member_result = await self.db.execute(
                    select(func.count(User.id)).where(User.department_id == dept.id)
                )
                member_count = member_result.scalar() or 0
                total_members += member_count

                traffic_lights = []
                for p in projects:
                    try:
                        tl = await self.get_traffic_light(str(p.id))
                        traffic_lights.append(tl)
                    except Exception:
                        pass

                danger = sum(1 for tl in traffic_lights if tl.progress == "red")
                warning = sum(1 for tl in traffic_lights if tl.progress == "yellow")
                normal = sum(1 for tl in traffic_lights if tl.progress == "green")

                dept_overviews.append({
                    "department_id": str(dept.id),
                    "department_name": dept.name,
                    "project_count": project_count,
                    "project_stats": {"total": project_count, "normal": normal, "warning": warning, "danger": danger},
                    "member_count": member_count,
                })

        return {
            "company_overview": {
                "total_projects": total_projects,
                "total_members": total_members,
                "department_count": len(dept_overviews),
            },
            "departments": dept_overviews,
        }
