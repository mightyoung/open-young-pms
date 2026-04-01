"""AI 助手路由 — RAG 问答 + 闲聊

DEPRECATED: This router duplicates routers.ai (Layer 2).
Use routers.ai ("AI助手V2") as the canonical implementation.
Will be removed in a future release after routes are consolidated.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from api.services.fastapi_code_generator.auth import get_current_user
from api.response import ApiResponse
from api.services import rag_service
import uuid

router = APIRouter(prefix="/ai", tags=["AI助手"])


class ChatRequest(BaseModel):
    message: str
    session_id: str = None
    use_rag: bool = True


# 内存会话存储（生产用 Redis）
_sessions: dict[str, list[dict]] = {}


@router.post("/chat")
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    """AI 对话（支持 RAG 知识库）"""
    session_id = req.session_id or str(uuid.uuid4())

    # 初始化会话
    if session_id not in _sessions:
        _sessions[session_id] = []

    # 限制上下文 10 轮
    history = _sessions[session_id][-20:]

    # RAG 检索
    context_chunks = []
    if req.use_rag:
        context_chunks = await rag_service.search_knowledge(req.message, top_k=5)

    # 调用 LLM
    answer = await rag_service.chat_with_rag(req.message, context_chunks)

    # 保存对话历史
    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": answer})
    _sessions[session_id] = history

    return ApiResponse.ok(
        {
            "session_id": session_id,
            "answer": answer,
            "sources": [c["source"] for c in context_chunks if c.get("source")],
            "context_used": len(context_chunks) > 0,
        }
    )


@router.get("/chat/history/{session_id}")
async def get_history(session_id: str, current_user=Depends(get_current_user)):
    """获取对话历史"""
    history = _sessions.get(session_id, [])
    return ApiResponse.ok({"session_id": session_id, "messages": history})


@router.post("/knowledge/add")
async def add_knowledge(content: str, source: str, current_user=Depends(get_current_user)):
    """手动添加知识库片段"""
    ids = await rag_service.add_knowledge(content, source, {"added_by": str(current_user.id)})
    return ApiResponse.ok(
        {
            "chunks_added": len(ids),
            "chunk_ids": ids,
        }
    )


@router.get("/knowledge/search")
async def search_knowledge(q: str, top_k: int = 5, current_user=Depends(get_current_user)):
    """检索知识库"""
    results = await rag_service.search_knowledge(q, top_k=top_k)
    return ApiResponse.ok({"results": results, "total": len(results)})


@router.post("/chat/analyze-hazard")
async def analyze_hazard(description: str, current_user=Depends(get_current_user)):
    """AI 分析随手拍隐患（风险评估 + 建议）"""
    prompt = f"""你是安全专家。请分析以下隐患描述，给出：
1. 风险等级（高/中/低）
2. 整改建议
3. 相关法规参考

隐患描述：{description}

请用简洁的列表格式回答。"""

    answer = await rag_service.chat_with_rag(prompt, [])
    return ApiResponse.ok({"analysis": answer})


@router.post("/chat/summarize-report")
async def summarize_report(report_content: str, report_type: str = "日报", current_user=Depends(get_current_user)):
    """AI 生成报告摘要"""
    prompt = f"""你是项目经理。请为以下{report_type}生成摘要：
- 主要完成工作
- 存在问题
- 下期计划

报告内容：
{report_content[:3000]}

请用简洁的Markdown格式回答。"""

    answer = await rag_service.chat_with_rag(prompt, [])
    return ApiResponse.ok({"summary": answer})
