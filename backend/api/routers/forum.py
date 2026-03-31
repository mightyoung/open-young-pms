"""论坛路由 — 帖子/回帖/点赞"""
from fastapi import APIRouter, Depends, Body
from sqlalchemy import select, func, desc
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.models import ForumPost, ForumReply, ForumLike
from api.response import ApiResponse
from pydantic import BaseModel

router = APIRouter(prefix="/forum", tags=["论坛"])


class PostCreate(BaseModel):
    title: str
    content: str
    tags: list = []
    visibility: str = "public"


class ReplyCreate(BaseModel):
    content: str
    mentioned_users: list = []


class LikeCreate(BaseModel):
    target_type: str
    target_id: str


@router.get("/posts")
async def list_posts(
    tab: str = "all",  # all/pinned/featured
    keyword: str = None,
    page: int = 1, page_size: int = 20,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """帖子列表（支持Tab筛选、搜索）"""
    query = select(ForumPost).where(ForumPost.status == "published")
    if tab == "pinned":
        query = query.where(ForumPost.is_pinned == True)
    if tab == "featured":
        query = query.where(ForumPost.is_featured == True)
    if keyword:
        query = query.where(ForumPost.title.ilike(f"%{keyword}%"))

    query = query.order_by(desc(ForumPost.is_pinned), desc(ForumPost.created_at))

    total = len((await db.execute(query)).scalars().all())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    rows = result.scalars().all()
    items = [{
        "id": r.id, "title": r.title, "author_id": r.author_id,
        "tags": r.tags or [], "visibility": r.visibility or "public",
        "is_pinned": r.is_pinned, "is_featured": r.is_featured,
        "view_count": r.view_count, "like_count": r.like_count,
        "reply_count": r.reply_count,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]
    return ApiResponse.ok({
        "items": items, "total": total, "page": page,
        "pages": (total + page_size - 1) // page_size
    })


@router.post("/posts")
async def create_post(
    data: PostCreate,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """发帖"""
    post = ForumPost(
        title=data.title, content=data.content, author_id=str(current_user.id),
        tags=data.tags or [], visibility=data.visibility
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return ApiResponse.ok({"id": post.id, "title": post.title})


@router.get("/posts/{post_id}")
async def get_post(
    post_id: str,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """帖子详情"""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        return ApiResponse.error("B0001", "帖子不存在")

    post.view_count += 1
    await db.commit()

    replies_result = await db.execute(
        select(ForumReply).where(
            ForumReply.post_id == post_id, ForumReply.status == "published"
        ).order_by(ForumReply.floor_number)
    )
    replies = replies_result.scalars().all()
    reply_items = [{
        "id": r.id, "content": r.content, "author_id": r.author_id,
        "floor_number": r.floor_number, "like_count": r.like_count,
        "mentioned_users": r.mentioned_users or [],
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in replies]

    return ApiResponse.ok({
        "id": post.id, "title": post.title, "content": post.content,
        "author_id": post.author_id, "tags": post.tags or [],
        "is_pinned": post.is_pinned, "is_featured": post.is_featured,
        "view_count": post.view_count, "like_count": post.like_count,
        "reply_count": post.reply_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "replies": reply_items,
    })


@router.post("/posts/{post_id}/replies")
async def create_reply(
    post_id: str,
    data: ReplyCreate,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """回帖"""
    max_floor = await db.execute(
        select(func.max(ForumReply.floor_number)).where(ForumReply.post_id == post_id)
    )
    max_n = max_floor.scalar() or 0

    reply = ForumReply(
        post_id=post_id, author_id=str(current_user.id), content=data.content,
        floor_number=max_n + 1, mentioned_users=data.mentioned_users or []
    )
    db.add(reply)

    post_result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = post_result.scalar_one_or_none()
    if post:
        post.reply_count += 1
    await db.commit()

    if data.mentioned_users:
        print(f"[Forum] User {current_user.id} mentioned {data.mentioned_users} in post {post_id}")

    return ApiResponse.ok({"id": reply.id, "floor_number": reply.floor_number})


@router.post("/like")
async def toggle_like(
    data: LikeCreate,
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """点赞/取消点赞"""
    user_id = str(current_user.id)
    target_type = data.target_type
    target_id = data.target_id

    existing = await db.execute(
        select(ForumLike).where(
            ForumLike.user_id == user_id,
            ForumLike.target_type == target_type,
            ForumLike.target_id == target_id
        )
    )
    like = existing.scalar_one_or_none()

    if like:
        await db.delete(like)
        delta = -1
    else:
        like = ForumLike(user_id=user_id, target_type=target_type, target_id=target_id)
        db.add(like)
        delta = 1

    if target_type == "post":
        result = await db.execute(select(ForumPost).where(ForumPost.id == target_id))
    else:
        result = await db.execute(select(ForumReply).where(ForumReply.id == target_id))
    obj = result.scalar_one_or_none()
    if obj:
        obj.like_count = max(0, obj.like_count + delta)

    await db.commit()
    return ApiResponse.ok({"liked": delta == 1, "like_count": obj.like_count if obj else 0})


@router.post("/posts/{post_id}/feature")
async def toggle_feature(
    post_id: str,
    featured: bool = Body(True),
    db=Depends(get_db), current_user=Depends(get_current_user),
):
    """加精/取消加精"""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        return ApiResponse.error("B0001", "帖子不存在")
    post.is_featured = featured
    await db.commit()
    return ApiResponse.ok({"is_featured": featured})
