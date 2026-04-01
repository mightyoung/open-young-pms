"""数据导出路由"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import HazardReport, Report, Risk, Contract
from api.response import ApiResponse
from api.utils.exporter import export_hazards, export_reports, export_risks, export_contracts
import os

router = APIRouter(prefix="/export", tags=["数据导出"])


@router.get("/hazards")
async def export_hazards_api(
    status: str = None,
    hazard_type: str = None,
    urgency: str = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """导出隐患数据（CSV）"""
    query = select(HazardReport).order_by(desc(HazardReport.created_at))
    if status:
        query = query.where(HazardReport.status == status)
    if hazard_type:
        query = query.where(HazardReport.hazard_type == hazard_type)
    if urgency:
        query = query.where(HazardReport.urgency == urgency)
    result = await db.execute(query)
    items = [
        dict(
            hazard_no=getattr(r, "id", None) if hasattr(r, "id") else None,
            type=getattr(r, "hazard_type", None),
            urgency=getattr(r, "urgency", None),
            status=getattr(r, "status", None),
            description=getattr(r, "description", None),
            location=getattr(r, "location", None),
            reporter_name=getattr(r, "reporter_id", None),
            created_at=str(getattr(r, "created_at", None) or ""),
        )
        for r in result.scalars().all()
    ]

    file_path = export_hazards(items)
    file_name = os.path.basename(file_path)
    return ApiResponse.ok(
        {
            "file_path": file_path,
            "file_name": file_name,
            "record_count": len(items),
            "download_url": f"/api/v1/export/download/{file_name}",
        }
    )


@router.get("/reports")
async def export_reports_api(
    report_type: str = None,
    r_status: str = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """导出报告数据"""
    query = select(Report).order_by(desc(Report.created_at))
    if report_type:
        query = query.where(Report.type == report_type)
    if r_status:
        query = query.where(Report.status == r_status)
    result = await db.execute(query)
    items = [
        dict(
            report_no=getattr(r, "id", None) if hasattr(r, "id") else None,
            type=getattr(r, "type", None),
            status=getattr(r, "status", None),
            period_start=str(getattr(r, "period_start", None) or ""),
            period_end=str(getattr(r, "period_end", None) or ""),
            created_by_name=getattr(r, "submitter_id", None),
            created_at=str(getattr(r, "created_at", None) or ""),
        )
        for r in result.scalars().all()
    ]

    file_path = export_reports(items)
    file_name = os.path.basename(file_path)
    return ApiResponse.ok(
        {
            "file_path": file_path,
            "file_name": file_name,
            "record_count": len(items),
            "download_url": f"/api/v1/export/download/{file_name}",
        }
    )


@router.get("/risks")
async def export_risks_api(
    level: str = None,
    risk_status: str = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """导出风险数据"""
    query = select(Risk).order_by(desc(Risk.created_at))
    if level:
        query = query.where(Risk.level == level)
    if risk_status:
        query = query.where(Risk.status == risk_status)
    result = await db.execute(query)
    items = [
        dict(
            title=getattr(r, "title", None),
            category=getattr(r, "category", None),
            level=getattr(r, "level", None),
            probability=getattr(r, "probability", None),
            impact=getattr(r, "impact", None),
            status=getattr(r, "status", None),
            mitigation=getattr(r, "mitigation", None),
        )
        for r in result.scalars().all()
    ]

    file_path = export_risks(items)
    file_name = os.path.basename(file_path)
    return ApiResponse.ok(
        {
            "file_path": file_path,
            "file_name": file_name,
            "record_count": len(items),
            "download_url": f"/api/v1/export/download/{file_name}",
        }
    )


@router.get("/contracts")
async def export_contracts_api(
    contract_type: str = None,
    c_status: str = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """导出合同数据"""
    query = select(Contract).order_by(desc(Contract.created_at))
    if contract_type:
        query = query.where(Contract.contract_type == contract_type)
    if c_status:
        query = query.where(Contract.status == c_status)
    result = await db.execute(query)
    items = [
        dict(
            code=getattr(r, "code", None),
            name=getattr(r, "name", None),
            contract_type=getattr(r, "contract_type", None),
            party_a=getattr(r, "party_a", None),
            party_b=getattr(r, "party_b", None),
            amount=float(getattr(r, "amount", 0) or 0),
            status=getattr(r, "status", None),
        )
        for r in result.scalars().all()
    ]

    file_path = export_contracts(items)
    file_name = os.path.basename(file_path)
    return ApiResponse.ok(
        {
            "file_path": file_path,
            "file_name": file_name,
            "record_count": len(items),
            "download_url": f"/api/v1/export/download/{file_name}",
        }
    )
