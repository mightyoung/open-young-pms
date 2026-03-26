# PMS 数据服务设计方案

## 一、项目背景与现状分析

### 1.1 当前数据层问题
- 数据分散在各个 domain router 中，无统一管理入口
- 数据质量规则散落各处，缺乏统一校验机制
- 数据血缘不清晰，跨实体追踪困难
- 敏感数据无统一脱敏标准
- 元数据（数据字典）未集中管理
- 数据标准不统一（命名、格式、约束）

### 1.2 数据治理的必要性
- 支撑 AI 助手准确理解业务数据（RAG 需要高质量数据）
- 支撑监管合规（日志审计、安全合规）
- 支撑数据资产化管理
- 支撑跨系统数据打通（ERP 对接）

## 二、数据治理框架（DAMA-DMBOK）

### 2.1 核心概念
- 数据治理（Data Governance）：数据管理的最高层框架
- 主数据管理（MDM）：核心业务实体的统一管理
- 数据质量管理（DQM）：数据准确性、完整性、一致性
- 数据血缘（Data Lineage）：数据从产生到消费的完整链路
- 元数据管理（Metadata）：数据的数据（结构、含义、血缘）
- 数据安全（Data Security）：访问控制 + 脱敏 + 审计

### 2.2 数据治理成熟度模型

| 级别 | 特征 |
|------|------|
| L1 初始级 | 数据由各系统自行管理，无统一标准 |
| L2 基础级 | 建立数据标准，有基本的数据字典 |
| L3 规范级 | 实施主数据管理，有质量监控 |
| L4 量化级 | 数据质量可量化，有自动化校验 |
| L5 优化级 | 持续优化，数据驱动决策 |

**当前 PMS 处于 L2-L3 级别，目标 L4。**

## 三、数据分类与分级

### 3.1 数据分类模型

| 数据类别 | 典型实体 | 治理级别 | 管理策略 |
|---------|---------|---------|---------|
| 主数据（Master） | 用户、项目、部门、角色 | S级（最高） | 强校验 + 变更审批 + 版本管理 |
| 业务数据（Business） | 随手拍、报告、任务、审批 | A级 | 完整性校验 + 操作日志 |
| 参考数据（Reference） | 状态枚举、类型字典 | B级 | 标准化 + 唯一性约束 |
| 配置数据（Config） | 审批流模板、指派规则 | B级 | 版本化 + 权限管控 |
| 日志数据（Log） | 审计日志、操作记录 | C级 | 定期归档 + 脱敏 |

### 3.2 数据级别定义

**S 级（战略级）**：直接影响公司经营决策
- 用户主数据、项目主数据
- 治理要求：变更必须审批、历史可追溯、版本化管理

**A 级（核心级）**：日常业务运营依赖
- 随手拍隐患、报告、审批
- 治理要求：完整性校验、操作日志、定期备份

**B 级（支撑级）**：业务辅助
- 论坛帖子、消息通知、字典数据
- 治理要求：标准化、权限管控

**C 级（参考级）**：系统运行辅助
- 日志数据、会话数据、缓存
- 治理要求：定期清理、安全存储

## 四、数据服务架构

### 4.1 三层架构

```
[数据服务层 DataService]
    ↓ 统一 API
[数据治理层 DataGovernance]
    ↓ 元数据/质量/安全
[数据存储层 DataStorage] → PostgreSQL + Redis + 文件存储
```

### 4.2 核心模块

1. **统一数据网关**（Data Gateway）— 所有数据访问的唯一入口
2. **主数据管理**（MDM）— 用户/项目/部门/角色等核心实体
3. **数据质量管理**（DQM）— 规则引擎 + 质量评分
4. **数据血缘追踪**（Lineage）— 记录数据从哪来到哪去
5. **元数据管理**（Metadata）— 表结构/字段/业务含义
6. **数据安全与合规**（Security）— 字段级脱敏 + 访问审计

## 五、主数据管理（MDM）

### 5.1 主数据范围
- mst_user（用户）
- mst_project（项目）
- mst_department（部门）
- mst_role（角色）

### 5.2 数据标准规范
- 编码规则：统一使用 UUID 作为主键，附加业务编号字段
- 命名规范：表名 mst_ 前缀，字段使用 snake_case
- 状态字段：使用标准化枚举值（active/inactive/pending）
- 时间字段：created_at/updated_at/closed_at 标准三时间戳

### 5.3 数据字典

#### 用户主数据（mst_user）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 用户ID | UUID | 否 | PK | 主键 |
| username | 用户名 | VARCHAR(100) | 否 | UNIQUE | 登录账号 |
| password_hash | 密码哈希 | VARCHAR(255) | 否 | | BCrypt 哈希 |
| full_name | 姓名 | VARCHAR(100) | 否 | | |
| email | 邮箱 | VARCHAR(200) | 是 | | |
| phone | 手机号 | VARCHAR(20) | 是 | | |
| role_id | 角色ID | UUID | 是 | FK→mst_role | |
| department_id | 部门ID | UUID | 是 | FK→mst_department | |
| project_ids | 项目列表 | UUID[] | 是 | | 所属项目 |
| status | 状态 | ENUM | 否 | DEFAULT active | active/inactive |
| employee_no | 员工编号 | VARCHAR(50) | 是 | UNIQUE | |
| entry_date | 入职日期 | DATE | 是 | | |
| avatar_url | 头像 | VARCHAR(500) | 是 | | |
| created_at | 创建时间 | DATETIME | 否 | | |
| updated_at | 更新时间 | DATETIME | 否 | | |
| is_deleted | 删除标记 | BOOLEAN | 否 | DEFAULT false | 软删除 |

#### 项目主数据（mst_project）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 项目ID | UUID | 否 | PK | |
| project_code | 项目编号 | VARCHAR(50) | 否 | UNIQUE | 业务编号 |
| project_name | 项目名称 | VARCHAR(200) | 否 | | |
| description | 项目描述 | TEXT | 是 | | |
| project_type | 项目类型 | VARCHAR(50) | 是 | | |
| status | 状态 | ENUM | 否 | | planning/active/completed/suspended |
| owner_id | 负责人 | UUID | 是 | FK→mst_user | |
| start_date | 开始日期 | DATE | 是 | | |
| end_date | 结束日期 | DATE | 是 | | |
| budget | 预算 | DECIMAL(15,2) | 是 | | |
| department_id | 所属部门 | UUID | 是 | FK→mst_department | |
| location | 地点 | VARCHAR(200) | 是 | | |
| created_at | 创建时间 | DATETIME | 否 | | |
| updated_at | 更新时间 | DATETIME | 否 | | |

#### 部门主数据（mst_department）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 部门ID | UUID | 否 | PK | |
| dept_code | 部门编码 | VARCHAR(50) | 否 | UNIQUE | |
| dept_name | 部门名称 | VARCHAR(100) | 否 | | |
| parent_id | 上级部门 | UUID | 是 | FK→mst_department | 树形结构 |
| manager_id | 负责人 | UUID | 是 | FK→mst_user | |
| dept_type | 部门类型 | VARCHAR(50) | 是 | | |
| sort_order | 排序 | INT | 是 | DEFAULT 0 | |
| created_at | 创建时间 | DATETIME | 否 | | |
| updated_at | 更新时间 | DATETIME | 否 | | |

#### 角色主数据（mst_role）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 角色ID | UUID | 否 | PK | |
| role_code | 角色编码 | VARCHAR(50) | 否 | UNIQUE | |
| role_name | 角色名称 | VARCHAR(100) | 否 | | |
| role_type | 角色类型 | ENUM | 否 | | system/custom |
| permissions | 权限列表 | JSON | 否 | | 权限码数组 |
| description | 描述 | TEXT | 是 | | |
| created_at | 创建时间 | DATETIME | 否 | | |

#### 随手拍隐患主数据（mst_hazard）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 隐患ID | UUID | 否 | PK | |
| hazard_no | 隐患编号 | VARCHAR(50) | 否 | UNIQUE | 编号规则：HP+日期+序号 |
| title | 标题 | VARCHAR(200) | 否 | | |
| description | 描述 | TEXT | 是 | | |
| type | 类型 | ENUM | 否 | | safety/quality/environment |
| severity | 严重程度 | ENUM | 否 | | urgent/important/normal |
| status | 状态 | ENUM | 否 | | reported/assigned/rectifying/verified/closed |
| location | 位置描述 | VARCHAR(200) | 是 | | |
| latitude | 纬度 | DECIMAL(10,7) | 是 | | |
| longitude | 经度 | DECIMAL(10,7) | 是 | | |
| reporter_id | 上报人 | UUID | 否 | FK→mst_user | |
| assignee_id | 处理人 | UUID | 是 | FK→mst_user | |
| project_id | 关联项目 | UUID | 是 | FK→mst_project | |
| dept_id | 所属部门 | UUID | 是 | FK→mst_department | |
| images | 图片列表 | VARCHAR(500)[] | 是 | | 多张图片URL |
| rectify_deadline | 整改截止 | DATE | 是 | | |
| rectify_images | 整改图片 | VARCHAR(500)[] | 是 | | |
| verify_result | 验收结果 | TEXT | 是 | | |
| created_at | 创建时间 | DATETIME | 否 | | |
| updated_at | 更新时间 | DATETIME | 否 | | |
| closed_at | 关闭时间 | DATETIME | 是 | | |

#### 报告主数据（mst_report）

| 字段 | 中文名 | 类型 | 可空 | 约束 | 说明 |
|------|--------|------|------|------|------|
| id | 报告ID | UUID | 否 | PK | |
| report_no | 报告编号 | VARCHAR(50) | 否 | UNIQUE | 编号规则：RP+类型缩写+日期 |
| report_type | 报告类型 | ENUM | 否 | | daily/weekly/monthly |
| project_id | 关联项目 | UUID | 是 | FK→mst_project | |
| author_id | 作者 | UUID | 否 | FK→mst_user | |
| period_start | 周期开始 | DATE | 是 | | |
| period_end | 周期结束 | DATE | 是 | | |
| content | 报告内容 | JSON | 否 | | 结构化内容 |
| status | 状态 | ENUM | 否 | | draft/submitted/approved/rejected |
| submitted_at | 提交时间 | DATETIME | 是 | | |
| approved_by | 审批人 | UUID | 是 | FK→mst_user | |
| approved_at | 审批时间 | DATETIME | 是 | | |
| created_at | 创建时间 | DATETIME | 否 | | |

## 六、数据质量管理

### 6.1 质量维度

| 维度 | 定义 | 衡量指标 |
|------|------|---------|
| 完整性 | 必填字段是否有值 | 非空率 |
| 准确性 | 数据与业务事实是否一致 | 规则通过率 |
| 一致性 | 跨系统/跨表数据是否一致 | 外键成功率 |
| 时效性 | 数据是否及时更新 | 超时更新率 |
| 唯一性 | 唯一标识字段是否重复 | 重复率 |
| 有效性 | 数据值是否在允许范围内 | 枚举合规率 |

### 6.2 质量规则引擎

```python
class DataQualityRule:
    rule_id: str           # 规则ID
    entity_type: str       # 实体类型
    field: str            # 字段名
    rule_type: str        # not_null | unique | range | format | enum | cross_field
    rule_config: dict     # 规则参数
    severity: str         # critical | warning | info
    message: str          # 违规提示
```

### 6.3 预置质量规则

**用户（users）**：
| 规则ID | 字段 | 类型 | 严重性 | 规则描述 |
|--------|------|------|--------|---------|
| u001 | phone | format | critical | 手机号格式：1[3-9]\d{9} |
| u002 | email | format | warning | 邮箱格式：[\w.-]+@[\w.-]+\.\w+ |
| u003 | role_id | not_null | critical | 角色不能为空 |

**项目（projects）**：
| 规则ID | 字段 | 类型 | 严重性 | 规则描述 |
|--------|------|------|--------|---------|
| p001 | project_code | not_null | critical | 项目编号不能为空 |
| p002 | end_date | range | critical | 结束日期必须晚于开始日期 |

**随手拍（hazards）**：
| 规则ID | 字段 | 类型 | 严重性 | 规则描述 |
|--------|------|------|--------|---------|
| h001 | images | min_count | critical | 图片至少上传1张 |
| h002 | latitude | range | critical | 纬度范围：-90~90 |
| h003 | longitude | range | critical | 经度范围：-180~180 |
| h004 | severity | enum | critical | 严重程度：urgent/important/normal |

**报告（reports）**：
| 规则ID | 字段 | 类型 | 严重性 | 规则描述 |
|--------|------|------|--------|---------|
| r001 | content | not_null | critical | 报告内容不能为空 |
| r002 | report_type | enum | critical | 报告类型：daily/weekly/monthly |

### 6.4 质量评分模型

```
总分 = 完整性得分×30% + 准确性得分×30% + 一致性得分×20% + 时效性得分×20%

- 完整性 = 非空字段数 / 总字段数
- 准确性 = 通过规则数 / 规则总数
- 一致性 = 外键关联成功率 / 外键总数
- 时效性 = 及时更新率 / 超时更新率

扣分规则：
- critical 违规：-30分/条
- warning 违规：-10分/条
```

## 七、数据血缘追踪

### 7.1 血缘类型
- **表级血缘**：表与表之间的主外键关系
- **字段级血缘**：字段之间的计算和转换关系
- **业务血缘**：业务含义上的数据流向

### 7.2 血缘记录模型

```python
class DataLineage:
    lineage_id: str       # 血缘记录ID
    source_entity: str    # 源实体
    source_field: str     # 源字段
    target_entity: str    # 目标实体
    target_field: str     # 目标字段
    transformation: str   # 转换逻辑：direct/derive/aggregate
    business_meaning: str # 业务含义
    created_at: datetime  # 创建时间
```

### 7.3 核心血缘链路

| 源实体 | 源字段 | 目标实体 | 目标字段 | 转换 | 业务含义 |
|--------|--------|----------|----------|------|---------|
| users | id | hazards | reporter_id | direct | 用户上报随手拍 |
| users | id | hazards | assignee_id | direct | 用户被指派处理随手拍 |
| users | id | reports | author_id | direct | 用户撰写报告 |
| projects | id | hazards | project_id | direct | 项目关联随手拍 |
| projects | id | reports | project_id | direct | 项目关联报告 |
| departments | id | users | department_id | direct | 部门包含用户 |
| departments | id | projects | department_id | direct | 部门下有项目 |
| roles | id | users | role_id | direct | 角色赋予用户权限 |

### 7.4 业务链路图

```
部门 (mst_department)
    ├── 用户 (mst_user) ──────┬──→ 随手拍 (mst_hazard) ──→ 整改验收
    │                         ├── 报告 (mst_report)
    │                         └── 任务 (mst_task)
    └── 项目 (mst_project) ────├──→ 随手拍 (mst_hazard)
                                └── 报告 (mst_report)

角色 (mst_role) ──→ 权限 ──→ 菜单 ──→ 页面访问
```

### 7.5 血缘应用场景
- **影响分析**：修改主数据字段，评估对下游的影响
- **根因追踪**：数据质量问题追溯到源头
- **AI 增强**：将血缘信息注入 RAG，提升 AI 回答准确性

## 八、统一数据 API

### 8.1 API 分层
- **数据网关层**：统一入口，认证鉴权
- **数据服务层**：业务逻辑，数据转换
- **数据访问层**：数据库操作，缓存

### 8.2 端点清单

#### 主数据管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/data/master/users | 用户主数据查询（分页） |
| POST | /api/v1/data/master/users/validate | 用户数据质量校验 |
| GET | /api/v1/data/master/projects | 项目主数据查询 |
| GET | /api/v1/data/master/departments | 部门主数据查询 |

#### 数据质量
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/data/quality/score | 数据质量总分（全局/按实体） |
| GET | /api/v1/data/quality/rules | 质量规则列表 |
| POST | /api/v1/data/quality/check | 对指定实体执行质量检查 |
| GET | /api/v1/data/quality/issues | 质量违规列表 |

#### 数据血缘
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/data/lineage/{entity} | 实体血缘图（上下游） |
| GET | /api/v1/data/lineage/trace/{id} | 追踪单条数据血缘 |

#### 元数据管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/data/metadata/entities | 实体列表 |
| GET | /api/v1/data/metadata/fields/{entity} | 字段详情 |
| GET | /api/v1/data/dictionary | 完整数据字典 |

#### 数据安全
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/data/security/sensitive | 敏感字段列表 |
| POST | /api/v1/data/security/mask | 数据脱敏（测试） |

## 九、数据安全设计

### 9.1 敏感数据识别

| 实体 | 字段 | 敏感类型 | 描述 |
|------|------|---------|------|
| users | password_hash | hash | 密码哈希（SHA-256） |
| users | phone | partial | 手机号部分隐藏 |
| users | email | partial | 邮箱脱敏 |
| audit_logs | before_value | json_mask | 变更前值脱敏 |
| audit_logs | after_value | json_mask | 变更后值脱敏 |

### 9.2 脱敏策略

| 类型 | 规则 | 示例 |
|------|------|------|
| 手机号 | 中间4位隐藏 | 138****1234 |
| 邮箱 | 用户名部分隐藏 | te***@example.com |
| 密码 | 不可逆哈希 | SHA-256 截断16位 |
| JSON字段 | 递归脱敏 | 嵌套敏感字段处理 |

### 9.3 访问审计
- 所有数据访问均记录审计日志
- 敏感数据访问单独标记
- 高风险操作（删除/批量修改）需二次确认

## 十、数据治理组织

### 10.1 数据 Owner 矩阵

| 数据类型 | 数据所有者（Data Owner） | 数据管理者（Data Steward） |
|---------|----------------------|----------------------|
| 用户主数据 | 超管 | 超管 |
| 项目主数据 | 公司领导 | 部门领导 |
| 随手拍数据 | 部门领导 | 项目负责人 |
| 报告数据 | 部门领导 | 项目负责人 |
| 审批数据 | 超管 | 超管 |

## 十一、实施路线图

| 阶段 | 时间 | 内容 | 交付物 |
|------|------|------|--------|
| Phase 1 | 第1-2周 | 数据分类 + 元数据管理 + 数据字典 | 数据字典文档、敏感字段清单 |
| Phase 2 | 第3-4周 | 质量规则引擎 + 评分体系 | 规则引擎API、质量评分API |
| Phase 3 | 第5-6周 | 数据血缘追踪 + API 实现 | 血缘图API、数据服务路由 |
| Phase 4 | 第7-8周 | 数据安全 + 脱敏 + 审计 | 脱敏API、审计日志表 |
| Phase 5 | 第9-10周 | 与 AI 助手集成 + RAG 增强 | AI数据问答能力 |

## 十二、成熟案例参考

### 12.1 企业级数据治理典型案例
- **华为数据治理**：OneCode（统一数据标准）+ 数据底座
- **阿里数据中台**：DataPhin（数据建模 + 质量 + 血缘）
- **国家电网数据治理**：SG-DCM（数据标准 + 主数据 + 数据共享）

### 12.2 开源数据治理工具
- **Apache Atlas**：元数据管理 + 血缘追踪（配合 Hadoop 生态）
- **DataHub**：现代数据目录（LinkedIn 开源，支持元数据 + 血缘）
- **Great Expectations**：数据质量验证（Python 原生，灵活规则引擎）
- **dbt**：数据转换 + 质量测试（Analytics Engineering 领域）
- **OpenMetadata**：统一元数据平台（发现 + 质量 + 治理）

### 12.3 工程项目管理数据治理要点
- 项目编号唯一性：跨系统追踪的基础
- 隐患编号连续性：满足监管要求
- 报告时间戳精确性：审计合规要求
- 人员数据同步：与 HR 系统对接的基础
