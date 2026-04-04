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
    AIGenerateReportRequest,
    AIIntentResponse,
)
from services.ai_service import ai_service
from api.services.fastapi_code_generator.models import Task, HazardReport, Project, Phase
from api.services.fastapi_code_generator.database import get_db
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, Query
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI助手"])

_sessions: dict[str, list[dict]] = {}


@router.post("/generate-report")
async def generate_report(
    req: AIGenerateReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1. 查询基础数据
    # 查询任务 (Task 需 join Phase 才能根据 project_id 过滤)
    tasks_query = select(Task).join(Phase).where(
        and_(
            Phase.project_id == req.project_id,
            Task.updated_at >= datetime.fromisoformat(req.start_date.replace("Z", "+00:00")).replace(tzinfo=None),
            Task.updated_at <= datetime.fromisoformat(req.end_date.replace("Z", "+00:00")).replace(tzinfo=None),
        )
    )
    tasks_result = await db.execute(tasks_query)
    tasks = tasks_result.scalars().all()

    # 查询隐患
    hazards_query = select(HazardReport).where(
        and_(
            HazardReport.project_id == req.project_id,
            HazardReport.created_at >= datetime.fromisoformat(req.start_date.replace("Z", "+00:00")).replace(tzinfo=None),
            HazardReport.created_at <= datetime.fromisoformat(req.end_date.replace("Z", "+00:00")).replace(tzinfo=None),
        )
    )
    hazards_result = await db.execute(hazards_query)
    hazards = hazards_result.scalars().all()

    # 查询项目信息
    project_query = select(Project).where(Project.id == req.project_id)
    project_result = await db.execute(project_query)
    project = project_result.scalar_one_or_none()

    # 2. 格式化数据为 AI 摘要
    completed_tasks = [t.title for t in tasks if t.status == "done"]
    ongoing_tasks = [t.title for t in tasks if t.status == "in_progress" or t.status == "backlog"]
    new_hazards = [h.title for h in hazards]
    closed_hazards = [h.title for h in hazards if h.status == "closed"]

    data_summary = f"""
项目名称: {project.name if project else "未知"}
周期: {req.start_date} 至 {req.end_date}
报告类型: {req.report_type}

已完成任务:
{'- ' + '\n- '.join(completed_tasks) if completed_tasks else '无'}

进行中/待办任务:
{'- ' + '\n- '.join(ongoing_tasks) if ongoing_tasks else '无'}

本期新增隐患:
{'- ' + '\n- '.join(new_hazards) if new_hazards else '无'}

已闭环隐患:
{'- ' + '\n- '.join(closed_hazards) if closed_hazards else '无'}
"""

    # 3. 调用 AI 生成
    prompt = f"""你是资深项目经理。请根据以下项目运行数据，生成一份专业的{req.report_type}。
要求：
1. 必须包含三个部分，并使用以下标记包裹内容：
   [PROGRESS] ...内容... [/PROGRESS]
   [ISSUES] ...内容... [/ISSUES]
   [MILESTONE] ...内容... [/MILESTONE]
2. 语言要专业、精炼。
3. 如果数据较少，请基于常识进行合理推演。

项目运行数据：
{data_summary}
"""

    answer = await ai_service.chat([{"role": "user", "content": prompt}])

    return ApiResponse.ok({
        "project_name": project.name if project else "未知",
        "generated_content": answer,
        "data_points": {
            "tasks_count": len(tasks),
            "hazards_count": len(hazards),
        }
    })


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
        context_chunks = await ai_service._retrieve_docs(req.message, str(current_user.id), req.project_id)
        context = ai_service._build_context(context_chunks)
    else:
        context = None

    messages = [{"role": "user", "content": req.message}]
    answer = await ai_service.chat(messages, context)

    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": answer})
    _sessions[session_id] = history

    return ApiResponse.ok(
        {
            "session_id": session_id,
            "answer": answer,
            "sources": [c.metadata for c in context_chunks],
            "context_used": len(context_chunks) > 0,
        }
    )


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
    return ApiResponse.ok(
        {
            "results": [
                {"id": r.id, "content": r.content, "source": r.metadata.get("source", ""), "similarity": r.similarity}
                for r in results
            ]
        }
    )


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


@router.post("/parse-intent")
async def parse_intent(
    text: str,
    current_user=Depends(get_current_user),
):
    """解析自然语言意图（用于移动端语音录入）"""
    result = await ai_service.parse_intent(text)
    return ApiResponse.ok(result)
