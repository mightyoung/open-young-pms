# PRD v1.2 补充章节
> 版本：v1.3（补充版）
> 日期：2026-03-26
> 状态：新增章节
> 说明：基于 PRD v1.2 补充数据服务设计（三十六）和多级菜单设计（三十七）

---

## 三十六、数据服务设计与数据治理

### 36.0 设计背景与目标

#### 36.0.1 当前数据层问题
- 数据分散在各个 domain router 中，无统一管理入口
- 数据质量规则散落各处，缺乏统一校验机制
- 数据血缘不清晰，跨实体追踪困难
- 敏感数据无统一脱敏标准
- 元数据（数据字典）未集中管理
- 数据标准不统一（命名、格式、约束）

#### 36.0.2 数据治理必要性
- **支撑 AI 助手**：RAG 需要高质量、结构化的业务数据作为知识库底座
- **支撑监管合规**：日志审计、安全合规需要完整的数据血缘
- **支撑数据资产化管理**：将 PMS 数据转化为可量化、可追溯的企业资产
- **支撑 ERP 对接**：统一数据标准是系统对接的基础（见 PRD 二十一.5）

#### 36.0.3 设计目标
| 目标 | 衡量指标 | 目标值 |
|------|---------|--------|
| 统一数据入口 | API 覆盖率 | 100% |
| 数据质量评分 | DQM 得分 | ≥85/100 |
| 血缘可追溯 | 核心链路覆盖率 | ≥90% |
| 敏感数据保护 | 脱敏覆盖率 | 100% |
| 元数据完备 | 字段文档化率 | ≥95% |

---

### 36.1 数据治理框架（DAMA-DMBOK）

#### 36.1.1 核心概念映射

| DAMA-DMBOK 概念 | PMS 实现 | 说明 |
|----------------|---------|------|
| 数据治理（Data Governance） | 数据服务层 DataService | 最高层框架，统一管理 |
| 主数据管理（MDM） | mst_* 表 | 核心业务实体标准化 |
| 数据质量管理（DQM） | QualityRuleEngine | 规则引擎 + 评分 |
| 数据血缘（Data Lineage） | Lineage API | 字段级血缘追踪 |
| 元数据管理（Metadata） | /data/metadata/* | 数据字典 + 业务含义 |
| 数据安全（Data Security） | Security API | 脱敏 + 访问审计 |

#### 36.1.2 数据治理成熟度模型

| 级别 | 特征 | PMS 当前 |
|------|------|---------|
| L1 初始级 | 数据由各系统自行管理，无统一标准 | — |
| L2 基础级 | 建立数据标准，有基本的数据字典 | ✅ 已达到 |
| L3 规范级 | 实施主数据管理，有质量监控 | 🔄 本阶段目标 |
| L4 量化级 | 数据质量可量化，有自动化校验 | 📋 下一阶段 |
| L5 优化级 | 持续优化，数据驱动决策 | 📋 远期目标 |

---

### 36.2 数据分类与分级

#### 36.2.1 数据分类模型

| 数据类别 | 典型实体 | 治理级别 | 管理策略 |
|---------|---------|---------|---------|
| **主数据（Master）** | 用户、项目、部门、角色 | S级（最高） | 强校验 + 变更审批 + 版本管理 |
| **业务数据（Business）** | 随手拍、报告、任务、审批 | A级 | 完整性校验 + 操作日志 |
| **参考数据（Reference）** | 状态枚举、类型字典 | B级 | 标准化 + 唯一性约束 |
| **配置数据（Config）** | 审批流模板、指派规则 | B级 | 版本化 + 权限管控 |
| **日志数据（Log）** | 审计日志、操作记录 | C级 | 定期归档 + 脱敏 |

#### 36.2.2 数据级别定义

**S 级（战略级）**：直接影响公司经营决策
- 用户主数据、项目主数据
- 治理要求：变更必须审批、历史可追溯、版本化管理

**A 级（核心级）**：日常业务运营依赖
- 随手拍隐患、报告、审批流程
- 治理要求：完整性校验、操作日志、定期备份

**B 级（支撑级）**：业务辅助
- 论坛帖子、消息通知、字典数据
- 治理要求：标准化、权限管控

**C 级（参考级）**：系统运行辅助
- 日志数据、会话数据、缓存
- 治理要求：定期清理、安全存储

---

### 36.3 主数据管理（MDM）

#### 36.3.1 主数据范围

| 实体 | 表名 | 编号规则 | 变更审批 |
|------|------|---------|---------|
| 用户 | mst_user | 自动 UUID | 需要 |
| 项目 | mst_project | PROJECT-YYYYMMDD-XXX | 需要 |
| 部门 | mst_department | DEPT-XXX | 需要 |
| 角色 | mst_role | ROLE-XXX | 需要 |

#### 36.3.2 数据标准规范

```
命名规范：
- 表名：mst_ 前缀（master data）
- 字段：snake_case
- 业务编号：{TYPE}-YYYYMMDD-{SEQ}

状态字段标准枚举：
- 用户状态：active / inactive / pending
- 项目状态：planning / active / suspended / closed
- 随手拍状态：pending / assigned / confirmed / pushed / rectifying / pending_acceptance / closed / rejected
- 报告状态：draft / submitted / approved / rejected

时间戳标准：
- created_at：创建时间（不可变更）
- updated_at：最后更新时间
- closed_at：关闭时间（适用于随手拍、报告等）
```

#### 36.3.3 数据字典（核心主数据）

##### 用户主数据（mst_user）

| 字段名 | 中文名 | 类型 | 约束 | 说明 |
|--------|-------|------|------|------|
| id | 用户ID | UUID | PK, NOT NULL | 主键 |
| username | 用户名 | VARCHAR(100) | UNIQUE, NOT NULL | 登录账号 |
| password_hash | 密码哈希 | VARCHAR(255) | NOT NULL | SHA-256 哈希 |
| full_name | 姓名 | VARCHAR(100) | NOT NULL | 真实姓名 |
| email | 邮箱 | VARCHAR(200) | — | 个人邮箱 |
| phone | 手机号 | VARCHAR(20) | — | 11位手机号 |
| role_id | 角色ID | UUID | FK → mst_role | 关联角色 |
| department_id | 部门ID | UUID | FK → mst_department | 关联部门 |
| employee_no | 员工编号 | VARCHAR(50) | UNIQUE | 工号 |
| entry_date | 入职日期 | DATE | — | 入职时间 |
| status | 状态 | ENUM | NOT NULL, DEFAULT 'active' | active/inactive/pending |
| avatar_url | 头像URL | VARCHAR(500) | — | OSS 存储 |
| created_at | 创建时间 | DATETIME | NOT NULL | — |
| updated_at | 更新时间 | DATETIME | NOT NULL | — |

##### 项目主数据（mst_project）

| 字段名 | 中文名 | 类型 | 约束 | 说明 |
|--------|-------|------|------|------|
| id | 项目ID | UUID | PK, NOT NULL | 主键 |
| project_code | 项目编号 | VARCHAR(50) | UNIQUE, NOT NULL | 业务编号 |
| project_name | 项目名称 | VARCHAR(200) | NOT NULL | 项目全称 |
| description | 项目描述 | TEXT | — | 详细描述 |
| project_type | 项目类型 | VARCHAR(50) | — | 房建/市政/工业等 |
| status | 状态 | ENUM | NOT NULL | planning/active/suspended/closed |
| owner_id | 负责人 | UUID | FK → mst_user | 项目经理 |
| start_date | 开始日期 | DATE | — | 计划开始 |
| end_date | 结束日期 | DATE | — | 计划结束 |
| budget | 预算 | DECIMAL(15,2) | — | 万元 |
| department_id | 所属部门 | UUID | FK → mst_department | 归属部门 |
| location | 项目地址 | VARCHAR(300) | — | 物理位置 |
| created_at | 创建时间 | DATETIME | NOT NULL | — |

##### 随手拍主数据（mst_hazard）

| 字段名 | 中文名 | 类型 | 约束 | 说明 |
|--------|-------|------|------|------|
| id | 隐患ID | UUID | PK, NOT NULL | 主键 |
| issue_no | 隐患编号 | VARCHAR(50) | UNIQUE, NOT NULL | ISSUE-YYYYMMDD-XXX |
| title | 标题 | VARCHAR(200) | NOT NULL | 简洁描述 |
| description | 描述 | TEXT | — | 详细描述 |
| hazard_type | 类型 | ENUM | NOT NULL | safety/quality/environment |
| severity | 严重程度 | ENUM | NOT NULL | urgent/important/normal |
| status | 状态 | ENUM | NOT NULL | 见状态流程 |
| latitude | 纬度 | DECIMAL(10,7) | — | GPS 坐标 |
| longitude | 经度 | DECIMAL(10,7) | — | GPS 坐标 |
| location_desc | 位置描述 | VARCHAR(300) | — | 文字描述位置 |
| reporter_id | 上报人 | UUID | FK → mst_user, NOT NULL | 上报人员 |
| assignee_id | 处理人 | UUID | FK → mst_user | 当前责任人 |
| project_id | 关联项目 | UUID | FK → mst_project | 所属项目 |
| rectify_deadline | 整改截止 | DATE | — | 截止日期 |
| rectify_images | 整改图片 | JSON | — | 整改后照片 |
| verify_result | 验收结论 | TEXT | — | 验收备注 |
| created_at | 创建时间 | DATETIME | NOT NULL | — |
| updated_at | 更新时间 | DATETIME | NOT NULL | — |
| closed_at | 关闭时间 | DATETIME | — | 完成时间 |

---

### 36.4 数据质量管理（DQM）

#### 36.4.1 质量维度定义

| 维度 | 定义 | 衡量指标 | 权重 |
|------|------|---------|------|
| **完整性** | 必填字段是否有值 | 非空率 | 30% |
| **准确性** | 数据与业务事实一致 | 规则通过率 | 30% |
| **一致性** | 跨表数据是否一致 | 外键成功率 | 20% |
| **时效性** | 数据是否及时更新 | 及时更新率 | 20% |

#### 36.4.2 质量规则引擎

```python
# 规则类型
rule_type:
  not_null     # 非空校验
  unique       # 唯一性校验
  format       # 格式校验（正则）
  range        # 范围校验（数值/日期）
  enum         # 枚举值校验
  cross_field  # 跨字段校验（如 end_date > start_date）
  min_count    # 数组最少元素数（如图片至少1张）
```

#### 36.4.3 预置质量规则

**用户数据（users）**：

| 规则ID | 字段 | 类型 | 级别 | 规则 | 提示消息 |
|-------|------|------|------|------|---------|
| u001 | phone | format | 🔴critical | ^1[3-9]\d{9}$ | 手机号格式错误 |
| u002 | email | format | 🟡warning | ^[\w.-]+@[\w.-]+\.\w+$ | 邮箱格式错误 |
| u003 | role_id | not_null | 🔴critical | — | 角色不能为空 |

**项目数据（projects）**：

| 规则ID | 字段 | 类型 | 级别 | 规则 | 提示消息 |
|-------|------|------|------|------|---------|
| p001 | project_code | not_null | 🔴critical | — | 项目编号不能为空 |
| p002 | end_date | cross_field | 🔴critical | end_date > start_date | 结束日期必须晚于开始日期 |

**随手拍数据（hazards）**：

| 规则ID | 字段 | 类型 | 级别 | 规则 | 提示消息 |
|-------|------|------|------|------|---------|
| h001 | images | min_count | 🔴critical | min=1 | 图片至少上传1张 |
| h002 | latitude | range | 🔴critical | [-90, 90] | 纬度范围错误 |
| h003 | longitude | range | 🔴critical | [-180, 180] | 经度范围错误 |
| h004 | severity | enum | 🔴critical | urgent/important/normal | 严重程度必选 |

**报告数据（reports）**：

| 规则ID | 字段 | 类型 | 级别 | 规则 | 提示消息 |
|-------|------|------|------|------|---------|
| r001 | content | not_null | 🔴critical | — | 报告内容不能为空 |
| r002 | report_type | enum | 🔴critical | daily/weekly/monthly | 报告类型错误 |

#### 36.4.4 质量评分公式

```
总分 = 完整性(30%) + 准确性(30%) + 一致性(20%) + 时效性(20%)

评分逻辑：
- 完整性得分 = 非空字段数 / 必填字段总数 × 100
- 准确性得分 = 通过规则数 / 规则总数 × 100
- 一致性得分 = 外键关联成功率 / 外键总数 × 100
- 时效性得分 = 及时更新率 × 100

扣分规则：
- critical 级别违规：-30分/条
- warning 级别违规：-10分/条
```

---

### 36.5 数据血缘追踪（Data Lineage）

#### 36.5.1 血缘类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **表级血缘** | 表与表之间的主外键关系 | users.id → hazard_reports.reporter_id |
| **字段级血缘** | 字段之间的计算和转换关系 | report.content（JSON合并） |
| **业务血缘** | 业务含义上的数据流向 | 用户上报 → 隐患 → 整改 → 验收 |

#### 36.5.2 核心血缘链路

```
┌─────────┐
│ 用户    │ ←── 部门所属
│ mst_user│
└────┬────┘
     │
     ├──→ 随手拍（上报人）──→ 随手拍处理人 ──→ 随手拍验收人
     │        reporter_id          assignee_id         verifier_id
     │
     ├──→ 报告（作者）──────→ 报告审批人
     │        author_id             approved_by
     │
     ├──→ 项目（负责人）
     │        owner_id
     │
     └──→ 巡检记录（巡检人）
              inspector_id

┌─────────┐
│ 项目    │
│mst_project│
└────┬────┘
     │
     ├──→ 随手拍 ──→ 巡检点 ──→ 巡检记录
     │   project_id    point_id     record_id
     │
     └──→ 报告
          project_id

┌─────────┐
│ 部门    │
│mst_dept │
└────┬────┘
     │
     ├──→ 用户（部门成员）
     │      department_id
     │
     ├──→ 项目（所属部门）
     │      department_id
     │
     └──→ 随手拍/报告/审批（归属）
            dept_id
```

#### 36.5.3 血缘应用场景

| 场景 | 说明 |
|------|------|
| **影响分析** | 修改主数据字段时，评估对下游业务的影响范围 |
| **根因追踪** | 数据质量问题追溯到源头（如某随手拍数据异常 → 追溯到上报人） |
| **AI RAG 增强** | 将血缘信息注入知识库，AI 可理解数据来源和关系 |

---

### 36.6 统一数据 API 设计

#### 36.6.1 API 分层架构

```
┌──────────────────────────────────────────────────────────────┐
│                     数据服务层 DataService                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 统一数据网关 /data/*                                     │ │
│  │ - 认证鉴权（复用 auth）                                  │ │
│  │ - 统一响应格式（ApiResponse）                            │ │
│  │ - 访问日志记录                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ MDM API  │ │ DQM API  │ │ Lineage   │ │ Security │       │
│  │ 主数据   │ │ 质量     │ │   API     │ │   API    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              数据治理层 DataGovernance                         │
│  - 元数据管理（Metadata Registry）                             │
│  - 质量规则引擎（Rule Engine）                                │
│  - 血缘追踪器（Lineage Tracker）                              │
│  - 脱敏处理器（Mask Processor）                               │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              数据存储层 DataStorage                            │
│  PostgreSQL（主数据 + 业务数据）│ Redis（缓存）│ 文件存储      │
└──────────────────────────────────────────────────────────────┘
```

#### 36.6.2 端点清单

| 分类 | 方法 | 端点 | 说明 |
|------|------|------|------|
| **主数据** | GET | `/data/master/users` | 用户主数据查询（分页+筛选） |
| **主数据** | POST | `/data/master/users/validate` | 用户数据质量校验 |
| **主数据** | GET | `/data/master/projects` | 项目主数据查询 |
| **主数据** | POST | `/data/master/projects/validate` | 项目数据质量校验 |
| **主数据** | GET | `/data/master/departments` | 部门主数据查询 |
| **数据质量** | GET | `/data/quality/score` | 数据质量总分（按实体或全局） |
| **数据质量** | GET | `/data/quality/rules` | 质量规则列表 |
| **数据质量** | POST | `/data/quality/check` | 对指定实体执行质量检查 |
| **数据质量** | GET | `/data/quality/issues` | 质量违规列表 |
| **数据血缘** | GET | `/data/lineage/{entity}` | 实体血缘图（上下游） |
| **数据血缘** | GET | `/data/lineage/trace/{id}` | 追踪单条数据血缘 |
| **元数据** | GET | `/data/metadata/entities` | 实体元数据列表 |
| **元数据** | GET | `/data/metadata/fields/{entity}` | 实体字段详情 |
| **元数据** | GET | `/data/dictionary` | 完整数据字典 |
| **数据安全** | GET | `/data/security/sensitive` | 敏感字段列表 |
| **数据安全** | POST | `/data/security/mask` | 数据脱敏（测试） |

#### 36.6.3 统一响应格式

所有端点返回 ApiResponse 格式：

```json
{
  "code": "A0000",
  "message": "操作成功",
  "data": {
    // 业务数据
  },
  "timestamp": "2026-03-26T21:00:00+08:00",
  "request_id": "req_xxx"
}
```

---

### 36.7 数据安全设计

#### 36.7.1 敏感字段识别

| 实体 | 字段 | 敏感级别 | 脱敏类型 | 说明 |
|------|------|---------|---------|------|
| users | password_hash | 🔴最高 | 不可逆哈希 | SHA-256，不可还原 |
| users | phone | 🟡高 | 部分隐藏 | 138****1234 |
| users | email | 🟡高 | 部分隐藏 | te***@example.com |
| audit_logs | before_value | 🟡高 | JSON递归脱敏 | 变更前值 |
| audit_logs | after_value | 🟡高 | JSON递归脱敏 | 变更后值 |
| users | id_card | 🔴最高 | 不可逆哈希 | 身份证号 |

#### 36.7.2 脱敏策略

| 类型 | 算法 | 示例 |
|------|------|------|
| 手机号 | 中间4位隐藏 | `138****1234` |
| 邮箱 | 用户名部分隐藏 | `te***@example.com` |
| 密码 | SHA-256 哈希 | `a1b2c3...` (仅存哈希) |
| 身份证 | 生日部分隐藏 | `310101****1234` |
| 金额 | 精确到分 | `¥12,345.67` |
| JSON对象 | 递归字段脱敏 | 遍历脱敏每个敏感字段 |

---

### 36.8 数据治理组织

#### 36.8.1 数据 owner 矩阵

| 数据类型 | 数据所有者（Data Owner） | 数据管理者（Data Steward） | 变更审批人 |
|---------|----------------------|----------------------|---------|
| 用户主数据 | 超级管理员 | 超级管理员 | 超级管理员 |
| 项目主数据 | 公司领导 | 部门领导 | 公司领导 |
| 随手拍数据 | 部门领导 | 项目负责人 | 部门领导 |
| 报告数据 | 部门领导 | 项目负责人 | 部门领导 |
| 审批数据 | 超级管理员 | 超级管理员 | 超级管理员 |
| 配置数据 | 超级管理员 | 超管/部门领导 | 超级管理员 |

#### 36.8.2 数据标准委员会（虚拟组织）

| 角色 | 职责 | 参与频率 |
|------|------|---------|
| 数据治理官 | 制定数据政策、审批标准 | 季度 |
| 数据 owner | 管理各自数据域、审批变更 | 按需 |
| 数据管理者 | 执行数据质量检查、处理问题 | 月度 |
| 开发团队 | 实现数据标准、接入规范 | 持续 |

---

### 36.9 实施路线图

| 阶段 | 时间 | 内容 | 产出 |
|------|------|------|------|
| **Phase 1** | 第1-2周 | 数据分类 + 元数据管理 + 数据字典 | `/data/metadata/*` API |
| **Phase 2** | 第3-4周 | 质量规则引擎 + 评分体系 | `/data/quality/*` API |
| **Phase 3** | 第5-6周 | 数据血缘追踪 + API 实现 | `/data/lineage/*` API |
| **Phase 4** | 第7-8周 | 数据安全 + 脱敏 + 审计 | `/data/security/*` API |
| **Phase 5** | 第9-10周 | 与 AI 助手集成 + RAG 增强 | AI 可理解数据关系 |

---

### 36.10 实现状态

| 模块 | 文件 | 状态 |
|------|------|------|
| 数据服务路由 | `backend/api/routers/data_service.py` | ✅ 已实现 |
| 质量规则定义 | DATA_QUALITY_RULES | ✅ 已实现 |
| 元数据定义 | MASTER_DATA_METADATA | ✅ 已实现 |
| 数据血缘定义 | DATA_LINEAGE | ✅ 已实现 |
| 敏感字段定义 | SENSITIVE_FIELDS | ✅ 已实现 |
| API 端点 | 全部 14 个端点 | ✅ 已实现 |
| 路由注册 | main.py | ✅ 已注册 |

---

## 三十七、多级菜单设计

### 37.1 设计背景

PRD v1.2 中各角色页面汇总后，系统共包含 16+ 个功能菜单项。平铺展示导致：
- 视觉拥挤，难以快速定位
- 相关功能不聚集
- 移动端/小屏体验差

**设计目标**：通过分组折叠，将平铺菜单组织为层次结构。

### 37.2 菜单结构

```
📊 仪表盘              ← 一级（首页固定）
📈 监测驾驶舱           ← 一级（首页固定）
────────────────────────────────
📁 项目协同              ← 分组（可折叠）
   ├── 看板
   ├── 甘特图
   └── 文档中心
🔍 现场管理
   ├── 随手拍
   └── 草稿箱
📝 报告管理
   ├── 报告列表
   └── 撰写报告
👥 组织人员
   ├── 组织架构
   ├── 用户管理
   └── 我的团队
💬 沟通协作
   ├── 论坛
   └── 消息中心
────────────────────────────────
🤖 系统智能              ← 分组
   ├── AI助手
   └── 审计日志
```

### 37.3 分组逻辑

| 分组 | 包含功能 | 设计依据 |
|------|---------|---------|
| 项目协同 | 看板、甘特图、文档 | PRD 七（项目负责人核心页面） |
| 现场管理 | 随手拍、草稿箱 | PRD 八（现场人员核心功能） |
| 报告管理 | 报告列表、撰写报告 | PRD 十五（报告模块） |
| 组织人员 | 组织架构、用户管理、团队 | PRD 二十（组织架构） |
| 沟通协作 | 论坛、消息中心 | PRD 十三/十四 |
| 系统智能 | AI助手、审计日志 | PRD 十 + 三十六（新增） |

### 37.4 技术实现

**前端框架**：Ant Design v5 Menu + SubMenu

```jsx
<Menu mode="inline" items={menuItems}>
// items 支持嵌套 children，自动渲染为 SubMenu
```

**分组实现**：

```javascript
const menuItems = [
  { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard /> },
  { key: 'cockpit', label: '监测驾驶舱', icon: <DashboardOutlined /> },
  {
    key: 'grp-project',
    label: '项目协同',
    icon: <Kanban />,
    children: [
      { key: 'kanban', label: '看板' },
      { key: 'gantt', label: '甘特图' },
      { key: 'docs', label: '文档中心' },
    ],
  },
  // ... 其他分组
]
```

**状态路由**：使用 React state `current` 控制页面切换，不使用 react-router-dom（保持轻量）

### 37.5 权限联动

菜单项根据用户角色动态显示（参考 PRD 二.4 权限矩阵）：

| 角色 | 可见的分组 |
|------|---------|
| 超级管理员 | 全部分组 |
| 公司领导 | 项目协同、报告管理、组织人员、沟通协作、系统智能 |
| 部门领导 | 项目协同、现场管理、报告管理、沟通协作 |
| 项目负责人 | 项目协同、现场管理、报告管理、沟通协作 |
| 现场人员 | 现场管理、沟通协作 |
| 科室负责人 | 项目协同、现场管理、报告管理 |

### 37.6 实现状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 菜单数据结构 | ✅ 已实现 | items + children 嵌套 |
| 折叠子菜单 | ✅ 已实现 | antd SubMenu 自动处理 |
| 图标 | ✅ 已实现 | lucide-react + antd icons |
| 选中态样式 | ✅ 已实现 | linear-gradient + 左侧强调线 |
| 路由渲染 | ✅ 已实现 | App.jsx state 切换 |

---

> 文档版本：v1.3
> 更新日期：2026-03-26
> 更新内容：
> - v1.3：新增第三十六章（数据服务设计与数据治理）、第三十七章（多级菜单设计）
> 编写者：Claude AI
