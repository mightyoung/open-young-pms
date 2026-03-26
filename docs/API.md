# PMS API 接口文档

> 自动生成 | 更新时间：2026-03-27 00:05
> Base URL: `http://localhost:8001/api/v1`

## 认证

除 `/auth/login` 外，所有接口需要在 Header 中携带 Token：
```
Authorization: Bearer {access_token}
```

## 通用响应格式

```json
{
  "code": "A0000",       // A0000=成功，其他=失败
  "message": "操作成功",
  "data": { ... },       // 业务数据
  "timestamp": "...",
  "request_id": null
}
```

## 错误码

| code | 说明 |
|------|------|
| A0000 | 成功 |
| A0001 | 参数错误 |
| A0002 | 未授权 |
| A0003 | 禁止访问 |
| A0004 | 资源不存在 |
| A0005 | 服务器错误 |

---

## 认证 Auth

### POST /auth/login
登录

**请求参数：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

## 项目管理 Projects

### GET /projects
获取项目列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| page_size | int | 每页数量，默认 20 |
| status | string | 项目状态（planning/active/completed） |

**响应：**
```json
{
  "items": [...],
  "total": 10,
  "page": 1,
  "page_size": 20
}
```

### POST /projects
创建项目

**请求参数：**
```json
{
  "name": "项目名称",
  "description": "项目描述",
  "status": "planning"
}
```

### GET /projects/{id}
获取项目详情

### GET /projects/{id}/phases
获取项目阶段列表

### PATCH /projects/{id}
更新项目

### DELETE /projects/{id}
删除项目

---

## 任务管理 Tasks

### GET /tasks
获取任务列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目 ID |
| status | string | 任务状态（todo/in_progress/done） |
| assignee_id | string | 负责人 ID |
| page | int | 页码 |
| page_size | int | 每页数量 |

**响应：**
```json
{
  "items": [...],
  "total": 50
}
```

### POST /tasks
创建任务

**请求参数：**
```json
{
  "name": "任务名称",
  "project_id": "...",
  "description": "任务描述",
  "status": "todo",
  "due_date": "2026-04-01"
}
```

### GET /tasks/{id}
获取任务详情

### PATCH /tasks/{id}
更新任务

**请求参数（部分更新）：**
```json
{
  "status": "done"
}
```
或
```json
{
  "name": "新名称",
  "due_date": "2026-04-05"
}
```

### DELETE /tasks/{id}
删除任务

---

## 随手拍 Hazards

### GET /hazards
获取隐患列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 隐患类型（safety/quality/environment） |
| urgency | string | 紧急程度（normal/urgent） |
| status | string | 处理状态（pending/assigned/resolved/closed） |
| page | int | 页码 |
| page_size | int | 每页数量 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "type": "safety",
      "urgency": "normal",
      "description": "现场照明不足",
      "location": "A栋3楼",
      "status": "pending",
      "photos": ["url1", "url2"],
      "created_at": "..."
    }
  ],
  "total": 10
}
```

### POST /hazards
上报隐患

**请求参数：**
```json
{
  "type": "safety",
  "urgency": "normal",
  "description": "现场照明不足",
  "location": "A栋3楼",
  "photos": ["url1", "url2"]
}
```

### GET /hazards/{id}
获取隐患详情

### POST /hazards/{id}/photos
上传隐患照片

**请求格式：** `multipart/form-data`
**参数：** `files` (file, 最多 3 张)

**响应：**
```json
{
  "urls": ["https://..."]
}
```

### POST /hazards/check-content
敏感信息检测

**请求参数：**
```json
{
  "description": "包含手机号 13812345678 的描述"
}
```

**响应：**
```json
{
  "has_pii": true,
  "pii_types": ["phone"]
}
```

### PATCH /hazards/{id}
更新隐患状态

---

## 扫码巡检 Inspection

### GET /inspections
获取巡检记录列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目 ID |
| status | string | 状态 |
| page | int | 页码 |

### POST /inspections
创建巡检记录

**请求参数：**
```json
{
  "inspection_point_id": "...",
  "project_id": "...",
  "result": "pass/fail",
  "remarks": "备注"
}
```

### GET /inspection/points
获取巡检点列表

### POST /inspection/points
创建巡检点

---

## 报告管理 Reports

### GET /reports
获取报告列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 报告类型（daily/weekly/monthly） |
| project_id | string | 项目 ID |
| status | string | 状态 |
| page | int | 页码 |

### POST /reports
提交报告

**请求参数：**
```json
{
  "type": "daily",
  "project_id": "...",
  "period_start": "2026-03-27T00:00:00",
  "period_end": "2026-03-27T23:59:59",
  "content": {
    "summary": "今日工作总结",
    "completed": "完成安全巡检",
    "next_plan": "继续巡检",
    "issues": "人手不足"
  }
}
```

### GET /reports/summary
获取报告统计汇总

### GET /reports/{id}
获取报告详情

### PATCH /reports/{id}
更新报告

### DELETE /reports/{id}
删除报告

---

## 审批流 Approval

### GET /approval/flows
获取审批流程列表

### POST /approval/start
发起审批

**请求参数：**
```json
{
  "flow_id": "...",
  "target_type": "report",
  "target_id": "..."
}
```

### GET /approval/my-tasks
获取待我审批列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | pending/all |

### POST /approval/tasks/{id}/approve
通过审批

### POST /approval/tasks/{id}/return
退回审批

### POST /approval/tasks/{id}/reject
拒绝审批

---

## 监测驾驶舱 Dashboard

### GET /dashboard/summary
驾驶舱汇总数据

**响应：**
```json
{
  "hazard": {
    "total": 10,
    "recent": 3,
    "closed": 7,
    "closure_rate": 70.0
  },
  "task": {
    "total": 50,
    "done": 35,
    "completion_rate": 70.0
  },
  "report": {
    "total": 20
  }
}
```

### GET /dashboard/hazard-trend
隐患 30 天趋势

**响应：**
```json
{
  "items": [
    { "date": "03-01", "count": 3 },
    { "date": "03-02", "count": 5 }
  ]
}
```

### GET /dashboard/hazard-by-type
隐患类型分布

**响应：**
```json
{
  "items": [
    { "type": "safety", "count": 8 },
    { "type": "quality", "count": 3 }
  ]
}
```

### GET /dashboard/hazard-by-status
隐患状态分布

**响应：**
```json
{
  "items": [
    { "name": "已关闭", "value": 5 },
    { "name": "处理中", "value": 3 }
  ]
}
```

---

## 质量管理 Quality

### GET /quality/standards
获取质量标准库

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 标准分类 |
| keyword | string | 关键词搜索 |

### POST /quality/standards
创建质量标准

### GET /quality/standards/{id}
获取质量标准详情

### POST /quality/inspections
提交质量检查

**请求参数：**
```json
{
  "standard_id": "...",
  "project_id": "...",
  "result": "pass/fail",
  "remarks": "检查备注"
}
```

### GET /quality/inspections
获取质量检查记录列表

---

## 合同管理 Contracts

### GET /contracts
获取合同列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态（draft/active/completed/terminated） |
| type | string | 类型（procurement/construction/consulting） |
| page | int | 页码 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "name": "采购合同A",
      "amount": 500000,
      "type": "procurement",
      "status": "draft",
      "created_at": "..."
    }
  ],
  "total": 10
}
```

### POST /contracts
创建合同

**请求参数：**
```json
{
  "name": "采购合同A",
  "amount": 500000,
  "type": "procurement",
  "status": "draft"
}
```

### GET /contracts/{id}
获取合同详情

### PATCH /contracts/{id}
更新合同

**请求参数：**
```json
{
  "status": "active"
}
```

### DELETE /contracts/{id}
删除合同

---

## 风险管理 Risks

### GET /risks
获取风险列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| project_id | string | 项目 ID |
| level | string | 风险等级（high/medium/low） |
| status | string | 状态 |
| page | int | 页码 |

### POST /risks
登记风险

**请求参数：**
```json
{
  "title": "人员不足风险",
  "level": "high",
  "project_id": "...",
  "probability": 0.7,
  "impact": "high",
  "mitigation": "尽快招聘",
  "status": "open"
}
```

### GET /risks/{id}
获取风险详情

### PATCH /risks/{id}
更新风险状态

**请求参数：**
```json
{
  "status": "resolved"
}
```

### DELETE /risks/{id}
删除风险

---

## 资源调度 Resources

### GET /resources
获取资源列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 资源类型（equipment/material/vehicle） |
| status | string | 状态（idle/in_use/maintenance） |
| page | int | 页码 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "name": "挖掘机#1",
      "type": "equipment",
      "spec": "型号规格",
      "quantity": 2,
      "status": "idle"
    }
  ],
  "total": 10
}
```

### POST /resources
登记资源

**请求参数：**
```json
{
  "name": "挖掘机#1",
  "type": "equipment",
  "spec": "型号规格",
  "status": "idle",
  "quantity": 2
}
```

### GET /resources/{id}
获取资源详情

### PATCH /resources/{id}
更新资源状态

**请求参数：**
```json
{
  "status": "in_use"
}
```

### DELETE /resources/{id}
删除资源

---

## 数据服务 Data

### GET /data/dict
获取数据字典

**响应：**
```json
{
  "items": [
    {
      "code": "hazard_type",
      "name": "隐患类型",
      "category": "hazard",
      "options": [
        { "value": "safety", "label": "安全隐患" },
        { "value": "quality", "label": "质量隐患" }
      ]
    }
  ]
}
```

### POST /data/quality-rules
质量评分规则配置

**请求参数：**
```json
{
  "completeness": 0.3,
  "accuracy": 0.3,
  "consistency": 0.2,
  "timeliness": 0.2
}
```

### POST /data/lineage
数据血缘分析

**请求参数：**
```json
{
  "table_name": "hazards"
}
```

**响应：**
```json
{
  "table_name": "hazards",
  "columns": [
    { "name": "id", "source": "auto" },
    { "name": "project_id", "source": "projects.id" }
  ]
}
```

### POST /data/metadata
元数据管理

**请求参数：**
```json
{
  "name": "hazards",
  "data_level": "S",
  "owner": "安全部门",
  "description": "隐患数据表"
}
```

### GET /data/validate
数据质量验证

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| rule | string | 验证规则名称 |

---

## 论坛 Forum

### GET /forum/posts
获取帖子列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 帖子类型 |
| page | int | 页码 |
| page_size | int | 每页数量 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "title": "标题",
      "content": "内容",
      "author": { "id": "...", "name": "张三" },
      "tags": ["安全"],
      "likes": 5,
      "created_at": "..."
    }
  ],
  "total": 20
}
```

### POST /forum/posts
发帖

**请求参数：**
```json
{
  "title": "标题",
  "content": "内容",
  "tags": ["安全"]
}
```

### GET /forum/posts/{id}
获取帖子详情（含回复）

### POST /forum/posts/{id}/replies
发表回复

**请求参数：**
```json
{
  "content": "回复内容"
}
```

### POST /forum/like
点赞

**请求参数：**
```json
{
  "target_type": "post/reply",
  "target_id": "..."
}
```

### DELETE /forum/posts/{id}
删除帖子

---

## 知识库 Knowledge

### GET /knowledge/documents
获取文档列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 关键词搜索 |
| category | string | 文档分类 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "title": "安全操作规程",
      "category": "safety",
      "content": "...",
      "created_at": "..."
    }
  ],
  "total": 10
}
```

### POST /knowledge/documents
创建文档

**请求参数：**
```json
{
  "title": "安全操作规程",
  "content": "文档内容",
  "category": "safety"
}
```

### GET /knowledge/documents/{id}
获取文档详情

### GET /knowledge/search
文档搜索

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| q | string | 搜索关键词 |

---

## 组织架构 Organization

### GET /companies
获取公司列表

### POST /companies
创建公司

### GET /companies/{id}
获取公司详情

### PATCH /companies/{id}
更新公司

### DELETE /companies/{id}
删除公司

### GET /departments
获取部门列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| company_id | string | 公司 ID |

### POST /departments
创建部门

### GET /departments/{id}
获取部门详情

### PATCH /departments/{id}
更新部门

### DELETE /departments/{id}
删除部门

---

## 用户管理 Users

### GET /users
获取用户列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| department_id | string | 部门 ID |
| role | string | 角色 |
| page | int | 页码 |

### POST /users
创建用户

### GET /users/{id}
获取用户详情

### PATCH /users/{id}
更新用户

### DELETE /users/{id}
删除用户

---

## 角色权限 Roles

### GET /roles
获取角色列表

### POST /roles
创建角色

### GET /roles/{id}
获取角色详情

### PATCH /roles/{id}
更新角色权限

### DELETE /roles/{id}
删除角色

---

## 消息通知 Notifications

### GET /notifications
获取消息列表

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| is_read | boolean | 是否已读 |
| page | int | 页码 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "title": "审批通知",
      "content": "您有一个待审批任务",
      "is_read": false,
      "created_at": "..."
    }
  ],
  "total": 5
}
```

### POST /notifications/mark-read
标记已读

**请求参数：**
```json
{
  "ids": ["id1", "id2"]
}
```

---

## 审计日志 Audit

### GET /audit/logs
获取审计日志

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| action_type | string | 操作类型 |
| object_type | string | 对象类型 |
| start_date | string | 开始日期 |
| end_date | string | 结束日期 |
| page | int | 页码 |

**响应：**
```json
{
  "items": [
    {
      "id": "...",
      "user_id": "...",
      "action": "create",
      "object_type": "hazard",
      "object_id": "...",
      "detail": "上报了一条隐患",
      "created_at": "..."
    }
  ],
  "total": 100
}
```

---

## AI 助手 AI

### POST /ai/chat
聊天对话

**请求参数：**
```json
{
  "message": "分析一下最近的安全隐患",
  "context": {}
}
```

**响应：**
```json
{
  "reply": "根据最近的隐患数据分析...",
  "suggestions": ["建议1", "建议2"]
}
```

### POST /ai/analyze-hazard
隐患智能分析

**请求参数：**
```json
{
  "hazard_id": "..."
}
```

### POST /ai/summarize-report
报告摘要生成

**请求参数：**
```json
{
  "report_id": "..."
}
```

---

## 数据导出 Export

### POST /export/request
发起导出任务

**请求参数：**
```json
{
  "type": "hazards",
  "filters": {},
  "format": "csv"
}
```

### GET /export/download/{task_id}
下载导出文件

---

## 文件上传 Upload

### POST /upload/images
上传图片

**请求格式：** `multipart/form-data`
**参数：** `files` (file, 支持 jpg/png)

**响应：**
```json
{
  "urls": ["https://..."]
}
```

### POST /upload/files
上传通用文件

**请求格式：** `multipart/form-data`
**参数：** `files` (file)

---

## 通知设置 Notification Settings

### GET /notification-settings
获取通知设置

**响应：**
```json
{
  "channels": ["in_app", "email"],
  "frequency": "realtime",
  "types": ["approval", "mention", "hazard"]
}
```

### PUT /notification-settings
更新通知设置

**请求参数：**
```json
{
  "channels": ["in_app"],
  "frequency": "daily",
  "types": ["approval", "mention"]
}
```
