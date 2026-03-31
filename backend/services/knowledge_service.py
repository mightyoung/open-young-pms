"""知识库服务 — 向量存储（pgvector）+ 文本分块"""
import re
import uuid

from services.ai_service import ai_service


class DocumentChunk:
    def __init__(self, id: str, content: str, metadata: dict, similarity: float = None):
        self.id = id
        self.content = content
        self.metadata = metadata
        self.similarity = similarity


class KnowledgeService:
    def __init__(self):
        self._vector_store = None

    def _get_vector_store(self):
        if self._vector_store is None:
            try:
                from sqlalchemy import text
                from api.services.fastapi_code_generator.database import engine

                class PgVectorStore:
                    def __init__(self, conn):
                        self.conn = conn

                    async def search(
                        self, embedding: list, filter: dict = None, top_k: int = 5
                    ) -> list[DocumentChunk]:
                        cond = "1=1"
                        params = {"query_emb": str(embedding), "top_k": top_k}
                        if filter:
                            if filter.get("user_id"):
                                cond += " AND (metadata->>'user_id') = :user_id"
                                params["user_id"] = filter["user_id"]
                            if filter.get("project_id"):
                                cond += " AND (metadata->>'project_id') = :project_id"
                                params["project_id"] = filter["project_id"]

                        result = self.conn.execute(
                            text(f"""
                                SELECT id, content, source, metadata,
                                       1 - (embedding <=> :query_emb::vector) AS similarity
                                FROM knowledge_chunks
                                WHERE {cond}
                                ORDER BY embedding <=> :query_emb::vector
                                LIMIT :top_k
                            """),
                            params,
                        )
                        rows = result.fetchall()
                        return [
                            DocumentChunk(
                                id=str(r.id),
                                content=r.content,
                                metadata=r.metadata or {},
                                similarity=float(r.similarity),
                            )
                            for r in rows
                        ]

                    async def add(
                        self, id: str, embedding: list, content: str, metadata: dict
                    ):
                        self.conn.execute(
                            text("""
                                INSERT INTO knowledge_chunks (id, content, source, metadata, embedding)
                                VALUES (:id, :content, :source, :metadata, :embedding::vector)
                                ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content
                            """),
                            {
                                "id": id,
                                "content": content[:2000],
                                "source": metadata.get("source", ""),
                                "metadata": metadata,
                                "embedding": str(embedding),
                            },
                        )


                self._vector_store = PgVectorStore(engine.connect().__enter__())
            except Exception as e:
                print(f"[KnowledgeService] Vector store init failed: {e}")
                self._vector_store = None
        return self._vector_store

    async def add_document(self, content: str, metadata: dict) -> str:
        chunks = self._chunk_text(content)
        doc_id = str(uuid.uuid4())
        vector_store = self._get_vector_store()

        for i, chunk in enumerate(chunks):
            embedding = await ai_service._get_embedding(chunk)
            chunk_meta = {**metadata, "chunk_index": i}
            if vector_store:
                await vector_store.add(
                    id=f"{doc_id}_{i}",
                    embedding=embedding,
                    content=chunk,
                    metadata=chunk_meta,
                )
        return doc_id

    async def search(
        self, query: str, user_id: str = None, project_id: str = None
    ) -> list[DocumentChunk]:
        query_embedding = await ai_service._get_embedding(query)
        filters = {}
        if user_id:
            filters["user_id"] = user_id
        if project_id:
            filters["project_id"] = project_id
        vector_store = self._get_vector_store()
        if vector_store:
            return await vector_store.search(query_embedding, filters=filters, top_k=10)
        return []

    async def vector_search(
        self, query_embedding: list, filter: dict = None, top_k: int = 5
    ) -> list[DocumentChunk]:
        vector_store = self._get_vector_store()
        if vector_store:
            return await vector_store.search(query_embedding, filter=filter, top_k=top_k)
        return []

    def _chunk_text(self, text: str, chunk_size: int = 500) -> list[str]:
        paragraphs = re.split(r"\n\n+", text.strip())
        chunks = []
        current = ""
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current) + len(para) + 2 <= chunk_size:
                current = (current + "\n\n" + para) if current else para
            else:
                if current:
                    chunks.append(current)
                current = para
        if current:
            chunks.append(current)
        return [c for c in chunks if c]


knowledge_service = KnowledgeService()
