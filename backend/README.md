# Backend

## Quick Start

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure environment (optional)

```bash
# Database URL (default: postgresql://postgres:postgres@localhost:5432/pms)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pms"

# JWT secret (default: dev-secret-change-in-production)
export JWT_SECRET="your-secret-key"
```

### 3. Create database

```sql
CREATE DATABASE pms;
```

### 4. Run server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Server runs at: http://localhost:8000

API docs: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT token |
| GET | `/api/users/me` | Bearer | Get current user info |
| GET | `/api/projects/` | Bearer | List my projects |
| POST | `/api/projects/` | Bearer | Create project |
| GET | `/api/projects/{id}` | Bearer | Get project |
| PUT | `/api/projects/{id}` | Bearer | Update project |
| DELETE | `/api/projects/{id}` | Bearer | Delete project |
| GET | `/api/tasks/` | Bearer | List tasks (filter: project_id, status, assignee_id) |
| POST | `/api/tasks/` | Bearer | Create task |
| GET | `/api/tasks/{id}` | Bearer | Get task |
| PUT | `/api/tasks/{id}` | Bearer | Update task |
| DELETE | `/api/tasks/{id}` | Bearer | Delete task |
| PATCH | `/api/tasks/{id}/status` | Bearer | Update task status |
| GET | `/api/tasks/{id}/comments` | Bearer | List comments |
| POST | `/api/tasks/{id}/comments` | Bearer | Add comment |

## Task Statuses

`backlog` | `inprogress` | `review` | `done`

## Task Priorities

`high` | `medium` | `low`

## Example Usage

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123","full_name":"Alice"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Create project
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"A demo project"}'

# Create task
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"First task","project_id":1,"status":"backlog","priority":"high"}'
```

## Tech Stack

- FastAPI + Uvicorn
- SQLAlchemy 2.x (ORM)
- PostgreSQL
- JWT (python-jose)
- Pydantic v2
