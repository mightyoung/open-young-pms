# FastAPI Backend — Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv for fast package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy requirements first for caching
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# Copy source
COPY . .

# Non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "api.services.fastapi_code_generator.main:app", "--host", "0.0.0.0", "--port", "8000"]
