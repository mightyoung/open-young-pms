"""合同管理路由"""
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import Contract
from api.services.fastapi_code_generator.schemas import ContractCreate
from api.response import ApiResponse

router = APIRouter(prefix="/contracts", tags=["合同管理"])


@router.get("")
async def list_contracts(
    keyword: str = None,
    contract_type: str = None,
    status: str = None,
    page: int = 1, page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """合同列表"""
    query = select(Contract)
    if keyword:
        query = query.where(Contract.name.ilike(f"%{keyword}%"))
    if contract_type:
        query = query.where(Contract.contract_type == contract_type)
    if status:
        query = query.where(Contract.status == status)
    query = query.order_by(desc(Contract.created_at))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [dict(
        id=str(r.id), name=r.name, code=r.code,
        contract_type=r.contract_type, party_a=r.party_a, party_b=r.party_b,
        amount=r.amount, status=r.status,
        signed_date=r.signed_date.isoformat() if r.signed_date else None,
        payment_terms=r.payment_terms or [],
        created_at=r.created_at.isoformat() if r.created_at else None,
    ) for r in result.scalars().all()]

    return ApiResponse.ok({"items": items, "total": total, "page": page})


@router.post("")
async def create_contract(
    data: ContractCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """创建合同"""
    contract = Contract(**data.model_dump(), created_by=str(current_user.id))
    db.add(contract)
    await db.commit()
    await db.refresh(contract)
    return ApiResponse.ok({"id": str(contract.id), "name": contract.name})


@router.get("/{contract_id}")
async def get_contract(contract_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    """合同详情"""
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    c = result.scalar_one_or_none()
    if not c:
        return ApiResponse.error("C0001", "合同不存在")
    return ApiResponse.ok({
        "id": str(c.id), "name": c.name, "code": c.code,
        "contract_type": c.contract_type, "party_a": c.party_a, "party_b": c.party_b,
        "amount": c.amount, "status": c.status,
        "signed_date": c.signed_date.isoformat() if c.signed_date else None,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None,
        "payment_terms": c.payment_terms or [],
    })
