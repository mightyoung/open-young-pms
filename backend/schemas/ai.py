"""AI 模块 Pydantic Schemas"""
from typing import Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    content: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: list = []


class KnowledgeDocument(BaseModel):
    content: str
    source: str
    project_id: Optional[str] = None


class KnowledgeChunk(BaseModel):
    id: str
    content: str
    source: str
    metadata: dict = {}
    similarity: Optional[float] = None


class AIChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    use_rag: bool = True
    project_id: Optional[str] = None


class AIAnalyzeHazardRequest(BaseModel):
    description: str


class AISummarizeReportRequest(BaseModel):
    report_content: str
    report_type: str = "日报"
