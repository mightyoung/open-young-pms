"""AI 服务 — 通义千问 + RAG"""
import os

import httpx

AI_CONFIG = {
    "api_key": os.getenv("DASHSCOPE_API_KEY"),
    "model": "qwen-max",
    "embedding_model": "text-embedding-v3",
    "rag": {
        "chunk_size": 500,
        "chunk_overlap": 50,
        "top_k": 5,
    },
}


class AIService:
    def __init__(self):
        self.api_key = AI_CONFIG["api_key"]
        self.model = AI_CONFIG["model"]

    async def chat(self, messages: list, context: dict = None) -> str:
        prompt = self._build_prompt(messages, context)
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "input": {"prompt": prompt},
                    "parameters": {"temperature": 0.7, "max_tokens": 2000},
                },
            )
        result = resp.json()
        return result["output"]["text"]

    async def chat_with_rag(
        self, query: str, user_id: str, project_id: str = None
    ) -> dict:
        docs = await self._retrieve_docs(query, user_id, project_id)
        context = self._build_context(docs)
        messages = [{"role": "user", "content": query}]
        response = await self.chat(messages, context)
        return {"response": response, "sources": [doc.metadata for doc in docs]}

    async def _retrieve_docs(
        self, query: str, user_id: str, project_id: str = None
    ) -> list:
        from services.knowledge_service import knowledge_service

        query_embedding = await self._get_embedding(query)
        filters = {"user_id": user_id}
        if project_id:
            filters["project_id"] = project_id
        docs = await knowledge_service.vector_search(
            query_embedding, filters=filters, top_k=AI_CONFIG["rag"]["top_k"]
        )
        return docs

    async def _get_embedding(self, text: str) -> list:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                "https://dashscope.aliyuncs.com/api/v1/services/embeddings/embeddings",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": AI_CONFIG["embedding_model"],
                    "input": {"texts": [text]},
                },
            )
        result = resp.json()
        return result["output"]["embeddings"][0]["embedding"]

    def _build_context(self, docs: list) -> str:
        if not docs:
            return ""
        ctx = "参考信息：\n"
        for i, doc in enumerate(docs, 1):
            ctx += f"[{i}] {doc.content}\n"
            ctx += f"来源：{doc.metadata.get('source', '未知')}\n\n"
        return ctx

    def _build_prompt(self, messages: list, context: str = None) -> str:
        system_prompt = """你是一个专业的项目管理助手。请根据参考信息回答用户问题。
如果参考信息中没有相关内容，请如实说明。
回答要专业、准确、简洁。"""
        if context:
            system_prompt += f"\n\n{context}"
        prompt = system_prompt + "\n\n"
        for msg in messages:
            prompt += f"{msg['role']}: {msg['content']}\n"
        return prompt


ai_service = AIService()
