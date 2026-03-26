"""公司管理路由"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import Company
from api.response import ApiResponse

router = APIRouter(prefix="/companies", tags=["组织架构"])


@router.get("")
async def list_companies(
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Company).where(Company.is_active == True))
    rows = result.scalars().all()
    items = [{
        "id": r.id, "name": r.name, "code": r.code,
        "description": r.description
    } for r in rows]
    return ApiResponse.ok(items)


@router.post("")
async def create_company(
    name: str,
    code: str,
    description: str = None,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    company = Company(name=name, code=code, description=description)
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return ApiResponse.ok({"id": company.id, "name": company.name})
