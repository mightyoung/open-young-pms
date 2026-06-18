"""Forum routes for posts, replies, and likes."""

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select

from api.response import ApiResponse
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import ForumLike, ForumPost, ForumReply

router = APIRouter(prefix="/forum", tags=["论坛"])


class PostCreate(BaseModel):
    title: str
    content: str
    tags: list[str] = Field(default_factory=list)
    visibility: str = "public"


class ReplyCreate(BaseModel):
    content: str
    mentioned_users: list[str] = Field(default_factory=list)


class LikeCreate(BaseModel):
    target_type: str
    target_id: str


async def _post_like_count(db, post_id: str) -> int:
    result = await db.execute(select(func.count(ForumLike.id)).where(ForumLike.post_id == post_id))
    return result.scalar() or 0


async def _post_reply_count(db, post_id: str) -> int:
    result = await db.execute(select(func.count(ForumReply.id)).where(ForumReply.post_id == post_id))
    return result.scalar() or 0


async def _is_post_liked(db, user_id: str, post_id: str) -> bool:
    result = await db.execute(
        select(ForumLike.id).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id)
    )
    return result.scalar_one_or_none() is not None


async def _serialize_post(db, post: ForumPost, current_user_id: str | None = None) -> dict:
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author_id": post.author_id,
        "project_id": post.project_id,
        "tags": post.tags or [],
        "is_pinned": post.is_pinned,
        "is_featured": False,
        "view_count": post.view_count or 0,
        "like_count": await _post_like_count(db, post.id),
        "reply_count": await _post_reply_count(db, post.id),
        "liked": await _is_post_liked(db, current_user_id, post.id) if current_user_id else False,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
    }


def _serialize_reply(reply: ForumReply, floor_number: int) -> dict:
    return {
        "id": reply.id,
        "content": reply.content,
        "author_id": reply.author_id,
        "floor_number": floor_number,
        "like_count": 0,
        "mentioned_users": [],
        "created_at": reply.created_at.isoformat() if reply.created_at else None,
        "updated_at": reply.updated_at.isoformat() if reply.updated_at else None,
    }


@router.get("/posts")
async def list_posts(
    tab: str = "all",
    keyword: str | None = None,
    page: int = 1,
    page_size: int = 20,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List forum posts with computed counters."""
    query = select(ForumPost)
    count_query = select(func.count(ForumPost.id))

    if tab == "pinned":
        query = query.where(ForumPost.is_pinned.is_(True))
        count_query = count_query.where(ForumPost.is_pinned.is_(True))
    if keyword:
        query = query.where(ForumPost.title.ilike(f"%{keyword}%"))
        count_query = count_query.where(ForumPost.title.ilike(f"%{keyword}%"))

    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
    total = (await db.execute(count_query)).scalar() or 0
    rows = (
        (
            await db.execute(
                query.order_by(desc(ForumPost.is_pinned), desc(ForumPost.created_at))
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        )
        .scalars()
        .all()
    )
    items = [await _serialize_post(db, post, str(current_user.id)) for post in rows]
    return ApiResponse.ok(
        {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
        }
    )


@router.post("/posts")
async def create_post(
    data: PostCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a forum post."""
    post = ForumPost(
        author_id=str(current_user.id),
        title=data.title,
        content=data.content,
        tags=data.tags or [],
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return ApiResponse.ok(await _serialize_post(db, post, str(current_user.id)), message="发布成功")


@router.get("/posts/{post_id}")
async def get_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get a forum post and its replies."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        return ApiResponse.error("B0001", "帖子不存在")

    post.view_count = (post.view_count or 0) + 1
    await db.commit()
    await db.refresh(post)

    replies = (
        (
            await db.execute(
                select(ForumReply).where(ForumReply.post_id == post_id).order_by(ForumReply.created_at)
            )
        )
        .scalars()
        .all()
    )
    data = await _serialize_post(db, post, str(current_user.id))
    data["replies"] = [_serialize_reply(reply, idx + 1) for idx, reply in enumerate(replies)]
    return ApiResponse.ok(data)


@router.post("/posts/{post_id}/replies")
async def create_reply(
    post_id: str,
    data: ReplyCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a reply for a post."""
    post_result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    if not post_result.scalar_one_or_none():
        return ApiResponse.error("B0001", "帖子不存在")

    reply = ForumReply(
        post_id=post_id,
        author_id=str(current_user.id),
        content=data.content,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)

    reply_count = await _post_reply_count(db, post_id)
    return ApiResponse.ok({"id": reply.id, "floor_number": reply_count}, message="回帖成功")


@router.get("/posts/{post_id}/replies")
async def get_replies(
    post_id: str,
    db=Depends(get_db),
):
    """List replies for a forum post."""
    replies = (
        (
            await db.execute(
                select(ForumReply).where(ForumReply.post_id == post_id).order_by(ForumReply.created_at)
            )
        )
        .scalars()
        .all()
    )
    items = [_serialize_reply(reply, idx + 1) for idx, reply in enumerate(replies)]
    return ApiResponse.ok({"items": items, "total": len(items)})


@router.post("/like")
async def toggle_like(
    data: LikeCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Toggle like for a post."""
    if data.target_type != "post":
        return ApiResponse.error("B0002", "当前仅支持帖子点赞")

    post_result = await db.execute(select(ForumPost.id).where(ForumPost.id == data.target_id))
    if post_result.scalar_one_or_none() is None:
        return ApiResponse.error("B0001", "帖子不存在")

    user_id = str(current_user.id)
    existing_result = await db.execute(
        select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == data.target_id)
    )
    existing = existing_result.scalar_one_or_none()
    liked = existing is None

    if existing:
        await db.delete(existing)
    else:
        db.add(ForumLike(user_id=user_id, post_id=data.target_id))

    await db.commit()
    return ApiResponse.ok({"liked": liked, "like_count": await _post_like_count(db, data.target_id)})


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Compatibility endpoint: like a post."""
    return await toggle_like(LikeCreate(target_type="post", target_id=post_id), db, current_user)


@router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Compatibility endpoint: unlike a post."""
    user_id = str(current_user.id)
    result = await db.execute(select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id))
    existing = result.scalar_one_or_none()
    if existing:
        await db.delete(existing)
        await db.commit()
    return ApiResponse.ok({"liked": False, "like_count": await _post_like_count(db, post_id)})


@router.post("/posts/{post_id}/feature")
async def toggle_feature(
    post_id: str,
    featured: bool = Body(True),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Use pinned status as the available featured marker."""
    return await pin_post(post_id, featured, db, current_user)


@router.put("/posts/{post_id}/pin")
async def pin_post(
    post_id: str,
    is_pinned: bool = Body(False),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Pin or unpin a forum post."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        return ApiResponse.error("B0001", "帖子不存在")
    post.is_pinned = is_pinned
    await db.commit()
    return ApiResponse.ok({"is_pinned": is_pinned})


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a post owned by the current user."""
    result = await db.execute(select(ForumPost).where(ForumPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        return ApiResponse.error("B0001", "帖子不存在")
    if post.author_id != str(current_user.id):
        return ApiResponse.error("A0003", "无权删除此帖子")

    likes = (await db.execute(select(ForumLike).where(ForumLike.post_id == post_id))).scalars().all()
    replies = (await db.execute(select(ForumReply).where(ForumReply.post_id == post_id))).scalars().all()
    for row in [*likes, *replies, post]:
        await db.delete(row)
    await db.commit()
    return ApiResponse.ok(message="删除成功")


@router.post("/posts/{post_id}/favorite")
async def favorite_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Stub favorite endpoint kept for frontend compatibility."""
    return ApiResponse.ok({"favorited": True})


@router.delete("/posts/{post_id}/favorite")
async def unfavorite_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Stub unfavorite endpoint kept for frontend compatibility."""
    return ApiResponse.ok({"favorited": False})
