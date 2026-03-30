"""AI 助手路由"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends

from api.services.fastapi_code_generator.auth import get_current_user
from api.response import ApiResponse
from schemas.ai import (
    AIChatRequest,
    AIAnalyzeHazardRequest,
    AISummarizeReportRequest,
)
from services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI助手"])

_sessions: dict[str, list[dict]] = {}


@router.post("/chat")
async def chat(
    req: AIChatRequest,
    current_user=Depends(get_current_user),
):
    session_id = req.session_id or str(uuid.uuid4())
    if session_id not in _sessions:
        _sessions[session_id] = []
    history = _sessions[session_id][-20:]

    context_chunks = []
    if req.use_rag:
        context_chunks = await ai_service._retrieve_docs(
            req.message, str(current_user.id), req.project_id
        )
        context = ai_service._build_context(context_chunks)
    else:
        context = None

    messages = [{"role": "user", "content": req.message}]
    answer = await ai_service.chat(messages, context)

    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": answer})
    _sessions[session_id] = history

    return ApiResponse.ok({
        "session_id": session_id,
        "answer": answer,
        "sources": [c.metadata for c in context_chunks],
        "context_used": len(context_chunks) > 0,
    })


@router.get("/chat/history/{session_id}")
async def get_history(session_id: str, current_user=Depends(get_current_user)):
    history = _sessions.get(session_id, [])
    return ApiResponse.ok({"session_id": session_id, "messages": history})


@router.post("/knowledge/add")
async def add_knowledge(
    content: str,
    source: str,
    project_id: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    from services.knowledge_service import knowledge_service

    doc_id = await knowledge_service.add_document(
        content=content,
        metadata={
            "user_id": str(current_user.id),
            "project_id": project_id,
            "source": source,
        },
    )
    return ApiResponse.ok({"doc_id": doc_id})


@router.get("/knowledge/search")
async def search_knowledge(
    query: str,
    project_id: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    from services.knowledge_service import knowledge_service

    results = await knowledge_service.search(
        query=query,
        user_id=str(current_user.id),
        project_id=project_id,
    )
    return ApiResponse.ok({
        "results": [
            {"id": r.id, "content": r.content, "source": r.metadata.get("source", ""), "similarity": r.similarity}
            for r in results
        ]
    })


@router.post("/chat/analyze-hazard")
async def analyze_hazard(
    req: AIAnalyzeHazardRequest,
    current_user=Depends(get_current_user),
):
    prompt = f"""你是安全专家。请分析以下隐患描述，给出：
1. 风险等级（高/中/低）
2. 整改建议
3. 相关法规参考

隐患描述：{req.description}

请用简洁的列表格式回答。"""
    answer = await ai_service.chat([{"role": "user", "content": prompt}])
    return ApiResponse.ok({"analysis": answer})


@router.post("/chat/summarize-report")
async def summarize_report(
    req: AISummarizeReportRequest,
    current_user=Depends(get_current_user),
):
    prompt = f"""你是项目经理。请为以下{req.report_type}生成摘要：
- 主要完成工作
- 存在问题
- 下期计划

报告内容：
{req.report_content[:3000]}

请用简洁的Markdown格式回答。"""
    answer = await ai_service.chat([{"role": "user", "content": prompt}])
    return ApiResponse.ok({"summary": answer})
