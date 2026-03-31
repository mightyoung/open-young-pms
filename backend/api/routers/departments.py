"""部门管理路由 — 公司-部门-科室三级结构"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import Company, Department
from api.response import ApiResponse
from pydantic import BaseModel

router = APIRouter(prefix="/departments", tags=["组织架构"])


class DeptCreate(BaseModel):
    name: str
    code: str
    company_id: str
    parent_id: str = None
    sort_order: int = 0


class DeptUpdate(BaseModel):
    name: str = None
    parent_id: str = None
    sort_order: int = None


@router.get("/tree")
async def get_department_tree(db: AsyncSession = Depends(get_db)):
    """获取完整部门树形结构"""
    result = await db.execute(select(Company).where(Company.is_active == True))
    companies = result.scalars().all()

    tree = []
    for company in companies:
        dept_result = await db.execute(
            select(Department).where(
                Department.company_id == company.id,
                Department.is_active == True
            ).order_by(Department.sort_order)
        )
        depts = dept_result.scalars().all()

        root_depts = [d for d in depts if d.parent_id is None]

        def build_tree(dept):
            children = [d for d in depts if d.parent_id == dept.id]
            return {
                "id": dept.id, "name": dept.name, "code": dept.code,
                "sort_order": dept.sort_order,
                "children": [build_tree(c) for c in children]
            }

        tree.append({
            "id": company.id, "name": company.name, "type": "company",
            "children": [build_tree(d) for d in root_depts]
        })

    return ApiResponse.ok(tree)


@router.get("")
async def list_departments(
    company_id: str = None,
    parent_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """查询部门列表（支持筛选）"""
    query = select(Department).where(Department.is_active == True)
    if company_id:
        query = query.where(Department.company_id == company_id)
    if parent_id is not None:
        if parent_id == "":
            query = query.where(Department.parent_id.is_(None))
        else:
            query = query.where(Department.parent_id == parent_id)

    result = await db.execute(query.order_by(Department.sort_order))
    rows = result.scalars().all()
    items = [{
        "id": r.id, "name": r.name, "code": r.code,
        "parent_id": r.parent_id, "company_id": r.company_id,
        "sort_order": r.sort_order
    } for r in rows]
    return ApiResponse.ok({"items": items, "total": len(items)})


@router.post("")
async def create_department(
    data: DeptCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """创建部门"""
    dept = Department(
        name=data.name, code=data.code, company_id=data.company_id,
        parent_id=data.parent_id, sort_order=data.sort_order
    )
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return ApiResponse.ok({"id": dept.id, "name": dept.name})


@router.put("/{dept_id}")
async def update_department(
    dept_id: str,
    data: DeptUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """更新部门"""
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        return ApiResponse.error("B0001", "部门不存在")
    if data.name is not None: dept.name = data.name
    if data.parent_id is not None: dept.parent_id = data.parent_id
    if data.sort_order is not None: dept.sort_order = data.sort_order
    await db.commit()
    return ApiResponse.ok({"id": dept.id})


@router.delete("/{dept_id}")
async def delete_department(
    dept_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """删除部门（软删除）"""
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        return ApiResponse.error("B0001", "部门不存在")
    dept.is_active = False
    await db.commit()
    return ApiResponse.ok({"message": "已删除"})
