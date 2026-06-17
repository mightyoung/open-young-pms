"""认证路由."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import (
    verify_password,
    create_access_token,
    hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from api.services.fastapi_code_generator.schemas import LoginRequest, TokenResponse, UserResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(User).where(User.username == data.username))
        user = result.scalar_one_or_none()
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账户已被禁用")

    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return TokenResponse(
        access_token=token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    full_name: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        hashed = hash_password(password)
        user = User(username=username, email=email, hashed_password=hashed, full_name=full_name)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return {"message": "注册成功", "user_id": str(user.id)}
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="注册失败，用户名可能已存在")
