"""知识库路由 — 文档管理与搜索"""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from api.services.fastapi_code_generator.auth import get_current_user
from api.response import ApiResponse
import uuid

router = APIRouter(prefix="/knowledge", tags=["知识库"])


# ── 内存存储（可替换为数据库）───────────────────────────────────
_knowledge_docs = {}


class KnowledgeDocCreate(BaseModel):
    title: str
    content: str = ""
    category: str = "other"


class KnowledgeDocUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None


def _doc_to_dict(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "title": doc["title"],
        "content": doc["content"],
        "category": doc["category"],
        "created_by": doc.get("created_by", ""),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("/documents")
async def list_documents(
    keyword: Optional[str] = Query(None, description="标题关键词"),
    category: Optional[str] = Query(None, description="分类筛选"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    """文档列表"""
    items = list(_knowledge_docs.values())

    # 过滤
    if keyword:
        items = [d for d in items if keyword.lower() in d["title"].lower()]
    if category:
        items = [d for d in items if d["category"] == category]

    total = len(items)
    # 分页
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    return ApiResponse.ok(
        {
            "items": [_doc_to_dict(d) for d in page_items],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.post("/documents")
async def create_document(
    doc_in: KnowledgeDocCreate,
    current_user=Depends(get_current_user),
):
    """创建文档"""
    doc_id = str(uuid.uuid4())
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat() + "Z"
    doc = {
        "id": doc_id,
        "title": doc_in.title,
        "content": doc_in.content,
        "category": doc_in.category,
        "created_by": str(current_user.id),
        "created_at": now,
        "updated_at": now,
    }
    _knowledge_docs[doc_id] = doc
    return ApiResponse.ok(_doc_to_dict(doc))


@router.get("/documents/{doc_id}")
async def get_document(
    doc_id: str,
    current_user=Depends(get_current_user),
):
    """获取单个文档"""
    doc = _knowledge_docs.get(doc_id)
    if not doc:
        return ApiResponse.error("K0001", "文档不存在")
    return ApiResponse.ok(_doc_to_dict(doc))


@router.put("/documents/{doc_id}")
async def update_document(
    doc_id: str,
    doc_in: KnowledgeDocUpdate,
    current_user=Depends(get_current_user),
):
    """更新文档"""
    doc = _knowledge_docs.get(doc_id)
    if not doc:
        return ApiResponse.error("K0001", "文档不存在")
    from datetime import datetime, timezone

    if doc_in.title is not None:
        doc["title"] = doc_in.title
    if doc_in.content is not None:
        doc["content"] = doc_in.content
    if doc_in.category is not None:
        doc["category"] = doc_in.category
    doc["updated_at"] = datetime.now(timezone.utc).isoformat() + "Z"
    _knowledge_docs[doc_id] = doc
    return ApiResponse.ok(_doc_to_dict(doc))


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user=Depends(get_current_user),
):
    """删除文档"""
    if doc_id not in _knowledge_docs:
        return ApiResponse.error("K0001", "文档不存在")
    del _knowledge_docs[doc_id]
    return ApiResponse.ok({"deleted": doc_id})
