"""监测看板数据模型."""
from datetime import datetime

from pydantic import BaseModel


class TrafficLight(BaseModel):
    """红绿灯"""
    progress: str
    quality: str
    safety: str
    budget: str
    updated_at: datetime


class ProjectCockpit(BaseModel):
    """项目驾驶舱"""
    project_id: str
    project_name: str
    progress: int
    budget_utilization: float
    issue_stats: dict
    task_stats: dict
    report_stats: dict
    traffic_light: TrafficLight
    recent_issues: list
    upcoming_deadlines: list


class EarlyWarning(BaseModel):
    """预警"""
    id: str
    type: str
    level: str
    title: str
    description: str
    project_id: str
    project_name: str
    created_at: datetime


class DepartmentOverview(BaseModel):
    """部门总览"""
    department_id: str
    department_name: str
    project_count: int
    project_stats: dict
    issue_stats: dict
    member_count: int
    recent_updates: list


class CompanyOverview(BaseModel):
    """公司总览"""
    company_overview: dict
    departments: list
