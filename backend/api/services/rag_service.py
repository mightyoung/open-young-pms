"""RAG 知识库服务 — 使用 pgvector + 通义千问嵌入"""
import os
import re
import uuid
import httpx

# ── 配置 ──────────────────────────────────────────────
QWEN_API_KEY = os.environ.get("QWEN_API_KEY", "sk-001574b0bf7a45bbaad14864b280e138")
EMBEDDING_URL = "https://dashscope.aliyuncs.com/compatible-mode/text-embedding/text-embedding-v4"
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "sk-72e4f93aae054f6f8d4e4a0e8484cff7")
DEEPSEEK_URL = "https://api.deepseek.com/v1"
DEEPSEEK_MODEL = "deepseek-chat"


# ── 文本分块 ───────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """按段落分块，chunk_size=500字符，overlap=50"""
    # 先按段落分割
    paragraphs = re.split(r'\n\n+', text.strip())
    chunks = []
    current = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) + 2 <= chunk_size:
            current += "\n\n" + para if current else para
        else:
            if current:
                chunks.append(current)
            # overlap
            overlap_chars = current[-overlap:] if current else ""
            current = overlap_chars + "\n\n" + para if overlap_chars else para
    if current:
        chunks.append(current)
    return [c.strip() for c in chunks if c.strip()]


# ── 向量化 ──────────────────────────────────────────────
async def get_embedding(text: str) -> list[float]:
    """调用通义千问 embedding 接口"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            EMBEDDING_URL,
            headers={
                "Authorization": f"Bearer {QWEN_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "text-embedding-v4",
                "input": text[:8000],  # 限制输入长度
            }
        )
        if resp.status_code != 200:
            raise RuntimeError(f"Embedding failed: {resp.status_code} {resp.text}")
        data = resp.json()
        return data["data"][0]["embedding"]


# ── LLM 生成 ──────────────────────────────────────────────
async def chat_with_rag(question: str, context_chunks: list[dict]) -> str:
    """调用 DeepSeek LLM，带 RAG 上下文"""
    if context_chunks:
        context = "\n\n".join([
            f"[来源: {c.get('source', '知识库')}]\n{c.get('content', '')}"
            for c in context_chunks
        ])
        system_prompt = f"""你是一个项目管理专家。基于以下知识库内容回答用户问题。
如果知识库中没有相关信息，请诚实说明，不要编造。

知识库内容：
{context}

回答要求：
1. 准确基于知识库内容回答
2. 如涉及具体数据，引用来源
3. 简洁有条理"""
    else:
        system_prompt = "你是一个项目管理专家，诚实回答用户问题，不知道的内容如实说明。"

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                ],
                "temperature": 0.3,
                "max_tokens": 1000,
            }
        )
        if resp.status_code != 200:
            raise RuntimeError(f"LLM failed: {resp.status_code} {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"]


# ── 知识库检索 ──────────────────────────────────────────────
async def search_knowledge(query: str, top_k: int = 5) -> list[dict]:
    """语义检索知识库（使用 embedding + pgvector）"""
    try:
        from sqlalchemy import text
        from api.services.fastapi_code_generator.database import engine

        # 获取 query embedding
        query_emb = await get_embedding(query)

        # pgvector 相似度搜索
        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT id, content, source, metadata,
                           1 - (embedding <=> :query_emb::vector) AS similarity
                    FROM knowledge_chunks
                    ORDER BY embedding <=> :query_emb::vector
                    LIMIT :top_k
                """),
                {"query_emb": str(query_emb), "top_k": top_k}
            )
            rows = result.fetchall()

        return [
            {
                "id": str(r.id),
                "content": r.content,
                "source": r.source,
                "metadata": r.metadata or {},
                "similarity": round(float(r.similarity), 4),
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[RAG] Search failed: {e}")
        return []


async def add_knowledge(content: str, source: str, metadata: dict = None) -> list[str]:
    """添加知识片段到向量库"""
    try:
        from sqlalchemy import text
        from api.services.fastapi_code_generator.database import engine

        chunks = chunk_text(content)
        chunk_ids = []

        with engine.connect() as conn:
            for chunk in chunks:
                emb = await get_embedding(chunk)
                result = conn.execute(
                    text("""
                        INSERT INTO knowledge_chunks (id, content, source, metadata, embedding)
                        VALUES (:id, :content, :source, :metadata, :embedding::vector)
                        RETURNING id
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "content": chunk[:2000],
                        "source": source,
                        "metadata": str(metadata or {}),
                        "embedding": str(emb),
                    }
                )
                row = result.fetchone()
                if row:
                    chunk_ids.append(str(row.id))

        return chunk_ids
    except Exception as e:
        print(f"[RAG] Add failed: {e}")
        return []
