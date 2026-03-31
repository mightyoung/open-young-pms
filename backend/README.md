# Backend

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env   # Edit to set JWT_SECRET, DATABASE_URL
```

### 3. Run server

```bash
uvicorn main:app --reload --port 8001
```

Server runs at: http://localhost:8001
API docs: http://localhost:8001/docs
Health: http://localhost:8001/health

## Tests

```bash
pytest tests/ -v              # All tests (auth, health, schemas, permissions)
pytest tests/ -v -k health   # Health check tests only
pytest tests/ -v --tb=short  # Short traceback
```

## Tech Stack

- FastAPI + Uvicorn
- SQLAlchemy 2.x (async)
- PostgreSQL + asyncpg
- JWT (python-jose)
- Pydantic v2
