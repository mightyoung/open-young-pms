# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PMS (Project Management System) - A React + Ant Design + Tailwind CSS SPA frontend with a FastAPI backend. Token-based auth (JWT), role-based access control.

## Dev Commands

```bash
npm run dev      # Frontend dev server → http://localhost:5173 (proxies /api/* to :8001)
npm run build   # Production build with vendor chunk splitting + lazy-loaded routes
npm run preview # Preview production build
npm run lint    # ESLint + Prettier (0 errors required in CI)
npm run test    # Vitest smoke tests

# Backend (from project root)
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in JWT_SECRET
ruff check .           # Python lint (0 errors required in CI)
ruff format .          # Format code (run before committing)
pytest tests/ -v       # All backend tests (36 passing)

uvicorn main:app --reload --port 8001  # Backend API
```

## Architecture

### Frontend Directory Structure

```
src/
├── api/                # HTTP client (client.js), error classes, domain API wrappers
├── app/                # App entry: AppRoot, routes, route-map, menu config, auth-session
├── components/         # Shared UI components (Header, Sidebar, Charts, etc.)
│   └── auth/          # Auth-gating components (PublicRoute, AuthenticatedRoute)
├── contexts/           # React Contexts (AuthContext)
├── features/           # Feature modules — NEW code goes here
│   ├── dashboard/
│   └── users/
├── hooks/              # Custom hooks (useAuth)
├── pages/               # Legacy flat page structure — DO NOT add new pages here
├── styles/             # Theme tokens (theme.js) + global CSS
└── utils/              # Utilities (offlineQueue, imageCompress, etc.)
```

**Module boundaries — strict enforcement:**
- `src/pages/` — LEGACY. Existing pages remain until migrated. **No new pages may be added here.**
- `src/features/` — CANONICAL. All new pages must be created here as feature modules.
- `src/components/` — Shared UI primitives only. No page-level logic.
- `src/contexts/` — Global React state only (auth only today).
- `src/hooks/` — Reusable behavioral logic. No business data fetching.
- `src/utils/` — Pure utility functions. No side effects.

**Mobile projects**: `mobile/` is the tracked UniApp (Vue) mobile project. `pms-uniapp/` is gitignored — experimental/alternative copy. Only `mobile/` receives commits.

### Backend Directory Structure

```
backend/
├── api/
│   ├── routers/        # Layer 3 — New modular routers (data_service, knowledge, quality...)
│   └── services/
│       ├── fastapi_code_generator/  # Layer 1 — Auto-generated routers + models + auth
│       │   ├── auth.py     # JWT: get_current_user(), require_role(), decode_token() (single source of truth)
│       │   ├── database.py # PostgreSQL only (no SQLite)
│       │   └── models.py  # SQLAlchemy models (User, Project, Task, etc.)
│       └── ...
├── routers/            # Layer 2 — Legacy hand-written routers (dashboard, approval, forum...)
├── middleware/
│   └── permission.py   # JWT validation middleware; imports decode_token from auth.py (no duplicate)
├── models/             # Legacy SQLAlchemy models (task, audit, permission...)
├── schemas/            # Pydantic schemas
└── main.py            # FastAPI app entry. Routers registered in three layers.
```

**Backend router layers (defined in main.py):**
- Layer 1 (`api.services.fastapi_code_generator.routers`) — Auto-generated CRUD: auth, users, projects, hazard_reports, inspections, reports, notifications. Do not edit directly.
- Layer 2 (`routers/`) — Legacy canonical: dashboard, approval, audit, tasks, files, forum, reports, notifications, websocket, organization, permission, AI (V2). These are the real implementations.
- Layer 3 (`api/routers/`) — New modular: upload, roles, data_service, knowledge, quality, contracts, notification_settings, export, forum (API), companies, departments, risks, ai_chat. Incrementally replacing Layer 2.

**⚠️ Dual implementations exist (to be resolved in P3):**
- Forum: `routers/forum.py` (增强) + `api/routers/forum.py` (API)
- AI: `routers/ai.py` (V2) + `api/routers/ai_chat.py`
- Reports: `reports_router` + `reports_custom_router`

### API Layer (`src/api/`)
- `client.js` — Core fetch wrapper. Adds `Authorization: Bearer <token>`, normalizes responses.
- `adapters.js` — `normalizeApiResponse()` accepts `{code: 'A0000', data}` or `{success: true, data}`.
- `errors.js` — Class hierarchy: `ApiError` → `UnauthorizedError`, `ForbiddenError`, `ServerError`, `NetworkError`, `BusinessError`.
- Domain APIs (`auth.js`, `dashboard.js`, `users.js`, `hazards.js`, etc.) call `get/post/put/patch/del` from client.

**API response normalization**: `normalizeApiResponse()` returns `{ok, data, message, code, raw}`. Both `code === 'A0000'` and `success: true` are treated as `ok: true`. Non-2xx throws `BusinessError`.

### Authentication
- Token stored via `src/app/auth-session.js` (localStorage).
- `AuthContext` (`src/contexts/AuthContext.jsx`) provides `login`, `logout`, `user`, `token`, `isAuthenticated`.
- Demo login: `admin` / `admin123` (frontend-only mock, only works when backend is unreachable).
- 401 responses automatically trigger logout via `setUnauthorizedHandler` in `client.js`.
- Backend `get_current_user()` requires valid JWT + user exists in DB — **no demo/fallback users**.
- `auth.py` is the single source of truth for `decode_token`; both `PermissionMiddleware` and the `get_current_user` dependency reuse it via ContextVar caching.

### UI Stack
- **Ant Design v5** — UI components
- **Tailwind CSS v3** — Utility styling (`tailwind.config.js`)
- **Framer Motion** — Animations
- **Recharts** — Charts
- **Lucide React** + **@ant-design/icons** — Icons

## Key Patterns

### Adding a new feature (P3-compliant workflow)
1. Create `src/features/<feature>/pages/FeaturePage.jsx`
2. Add to `src/app/route-map.js` and `src/app/menu.config.js`
3. Use `React.lazy()` + `Suspense` in `src/app/routes.jsx` (see existing pattern for DashboardPage/UsersPage)
4. Add domain API methods in `src/api/<feature>.js`

### Adding a new API endpoint (backend)
1. Determine which layer the router belongs to (Layer 2 or 3)
2. Create router in `routers/` or `api/routers/`
3. Use `from api.services.fastapi_code_generator.auth import get_current_user, require_role`
4. Use `from api.services.fastapi_code_generator.database import get_db`
5. Register in `backend/main.py` under the correct layer comment block

### Permission Gates
`PermissionGate` component (`src/components/PermissionGate/`) restricts UI visibility by role.

## Build Output

Production build → `dist/`:
- `vendor-react`, `vendor-antd` (~285KB gzip), `vendor-charts`, `vendor-framer`
- `DashboardPage-*.js`, `UsersPage-*.js` — lazy-loaded feature chunks
- `index-*.js` — main entry (~40KB gzip)

## Health Check Tiers (backend)

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /health` | Application liveness | None |
| `GET /health/ready` | Readiness (DB reachable) | None |
| `GET /health/db` | Database connectivity | None |

## API Versioning Strategy

- Current API: `/api/v1/...`
- All routers registered with `prefix="/api/v1"`
- Response envelope: `{code: "A0000", data: {...}, message: ""}` for success, `{code: "...", message: "..."}` for errors
- When making breaking changes: introduce `/api/v2/` prefix, maintain v1 simultaneously for 1 release cycle

## Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | JWT signing key (min 32 chars) |
| `JWT_ALGORITHM` | No | Default HS256 |
| `JWT_EXPIRE_MINUTES` | No | Default 480 |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://...` |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
