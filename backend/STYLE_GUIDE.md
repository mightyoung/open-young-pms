# Backend Code Style Guide

## Python 版本 & 环境

- Python 3.11+
- 依赖管理：`requirements.txt` 或 `pyproject.toml`
- 虚拟环境：`.venv`（项目根目录）

## 项目目录结构

```
backend/
├── api/                          # 统一 API 基础设施
│   ├── response.py               # 统一响应格式（ApiResponse）
│   ├── exceptions.py             # 标准错误码定义
│   ├── dependencies.py           # 全局异常处理器、中间件
│   ├── routers/                  # 路由（按功能模块拆分）
│   └── services/                 # 业务服务层
│       └── fastapi_code_generator/  # 生成的代码（models/routers/schemas）
│           ├── models.py
│           ├── routers/
│           ├── schemas.py
│           ├── auth.py
│           └── database.py
├── docs/                         # 文档
│   └── ERROR_CODES.md
├── uploads/                      # 本地上传文件（gitignore）
├── data/                         # 运行时数据（counters.json 等）
├── main.py                       # FastAPI 应用入口
├── config.py
├── auth.py
├── database.py
└── requirements.txt
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Python 模块 | snake_case | `file_service.py` |
| Python 类 | PascalCase | `ApiResponse` |
| Python 函数/变量 | snake_case | `save_upload()` |
| 数据库表名 | snake_case（复数） | `hazard_reports` |
| Pydantic Schema | PascalCase | `HazardReportCreate` |
| React 组件 | PascalCase | `HazardReport.jsx` |
| React 函数式组件 | PascalCase | `function LoginForm()` |
| CSS 类名 | kebab-case | `btn-primary` |
| 常量 | UPPER_SNAKE_CASE | `MAX_IMAGE_SIZE` |

## Import 顺序规范

```python
# 1. 标准库（stdlib）
import uuid
import traceback
from datetime import datetime
from pathlib import Path
from typing import Optional

# 2. 第三方库
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# 3. 本地模块（相对导入）
from api.response import ApiResponse, PaginatedResponse
from api.exceptions import ERR_NOT_FOUND
from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import HazardReport
```

**禁止**：不要使用 `from api import *`

## FastAPI 路由规范

```python
# 1. 每个路由文件对应一个功能模块
# 2. 使用 Depends 注入依赖
# 3. 统一使用 async def
# 4. 响应使用 response_model（返回 Pydantic 模型）
# 5. 错误使用 HTTPException 或 BusinessException

@router.get("", response_model=PaginatedResponse)
@router.post("", response_model=HazardReportResponse, status_code=status.HTTP_201_CREATED)
@router.get("/{item_id}", response_model=HazardReportResponse)
@router.patch("/{item_id}", response_model=HazardReportResponse)
@router.delete("/{item_id}")
```

## API 响应规范

所有 API 必须使用 `ApiResponse` 或 `PaginatedResponse` 统一格式：

```python
from api.response import ApiResponse, PaginatedResponse

# 成功
return ApiResponse.ok(data={"id": "xxx"}, message="操作成功")

# 分页
return PaginatedResponse.ok(items=[...], total=100, page=1, page_size=20)

# 业务错误
raise BusinessException(ERR_NOT_FOUND, "资源不存在")
```

**禁止**：直接返回字典或字符串（如 `return {"detail": "..."}`）

## 数据库模型规范

```python
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from api.services.fastapi_code_generator.database import Base
import uuid
from datetime import datetime

class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_draft: Mapped[bool] = mapped_column(Boolean, default=False)
```

## Pydantic Schema 规范

```python
from pydantic import BaseModel, ConfigDict
from typing import Optional

class HazardReportCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    hazard_type: str
    urgency: str = "normal"
    description: Optional[str] = None
```

## 文件上传规范

- 上传文件存放在 `./uploads/` 目录
- 按年月分区：`./uploads/photos/202603/`
- 生成缩略图（200x200，quality=80）
- 支持格式：`jpg/png/webp/gif`，最大 10MB

## Git Commit 规范

```
格式：[TASK-X.Y] 任务描述

示例：
[TASK-1.1] 项目结构规范化
[TASK-1.2] 统一 API 响应格式
[TASK-2.1] 文件上传服务
```

## 前端规范（补充）

```
src/
├── api/                    # API 调用层
│   └── index.js           # 统一 Axios/Fetch 封装
├── components/            # 通用组件
├── pages/                 # 页面组件
├── hooks/                # 自定义 Hooks
└── store/                # 状态管理（Zustand）
```

API 响应格式约定：
```javascript
// 成功：{ code: "A0000", message: "...", data: {...} }
// 列表：{ code: "A0000", message: "...", items: [...], total: N, page: 1, pages: M }
// 错误：{ code: "B0001", message: "...", detail: "..." }
```
