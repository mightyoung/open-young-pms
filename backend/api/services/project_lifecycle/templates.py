"""Default project lifecycle templates for the first implementation slice."""

from schemas.project_lifecycle import (
    LifecycleStage,
    ProcessTemplate,
    ProjectTypeInfo,
    StageGate,
    WorkItemTypeInfo,
)

PROJECT_TYPES = [
    ProjectTypeInfo(
        code="software_product",
        name="软件产品开发",
        description="面向持续迭代的软件产品，强调产品发现、Backlog、Sprint、发布与反馈。",
    ),
    ProjectTypeInfo(
        code="integration_engineering",
        name="集成/工程项目",
        description="面向工程建设、系统集成和交付周期较长的项目，强调 WBS、进度、成本、质量、风险和验收。",
    ),
    ProjectTypeInfo(
        code="software_project",
        name="软件项目交付",
        description="面向客户定制或一次性交付的软件工程项目，强调需求基线、设计、测试、UAT、上线和移交。",
    ),
]


DEFAULT_TEMPLATES = [
    ProcessTemplate(
        id="tpl_software_product_default",
        project_type="software_product",
        name="软件产品开发默认流程",
        description="基于 Scrum 与持续交付实践的软件产品迭代流程。",
        stages=[
            LifecycleStage(code="discover", name="产品发现", order=1, default_owner_role="product_manager"),
            LifecycleStage(code="backlog", name="Backlog 管理", order=2, default_owner_role="product_owner"),
            LifecycleStage(code="sprint", name="Sprint 交付", order=3, default_owner_role="scrum_master"),
            LifecycleStage(code="release", name="发布与反馈", order=4, default_owner_role="release_manager"),
        ],
        stage_gates=[
            StageGate(
                code="gate_discovery_ready",
                name="需求澄清完成",
                stage_code="discover",
                required_artifacts=["problem_statement", "success_metrics"],
                approver_roles=["product_owner"],
                pass_criteria=["价值假设清晰", "验收指标可衡量"],
            ),
            StageGate(
                code="gate_release_ready",
                name="发布就绪",
                stage_code="release",
                required_artifacts=["release_note", "test_summary"],
                approver_roles=["product_owner", "qa_owner"],
                pass_criteria=["关键缺陷关闭", "回滚方案明确"],
            ),
        ],
        work_item_types=[
            WorkItemTypeInfo(code="epic", name="Epic", statuses=["draft", "ready", "active", "done"], default_status="draft"),
            WorkItemTypeInfo(code="story", name="User Story", statuses=["backlog", "ready", "in_progress", "review", "done"], default_status="backlog"),
            WorkItemTypeInfo(code="bug", name="缺陷", statuses=["open", "triaged", "fixing", "verified", "closed"], default_status="open"),
            WorkItemTypeInfo(code="release", name="发布", statuses=["planned", "building", "released", "rolled_back"], default_status="planned"),
            WorkItemTypeInfo(code="feedback", name="用户反馈", statuses=["new", "reviewing", "accepted", "rejected"], default_status="new"),
        ],
        metrics=["sprint_completion_rate", "release_frequency", "lead_time", "change_failure_rate", "mttr"],
    ),
    ProcessTemplate(
        id="tpl_integration_engineering_default",
        project_type="integration_engineering",
        name="集成/工程项目默认流程",
        description="基于 WBS、里程碑、质量、风险和验收治理的工程型项目流程。",
        stages=[
            LifecycleStage(code="initiation", name="立项", order=1, default_owner_role="project_sponsor"),
            LifecycleStage(code="planning", name="计划与 WBS", order=2, default_owner_role="project_manager"),
            LifecycleStage(code="execution", name="实施与集成", order=3, default_owner_role="delivery_manager"),
            LifecycleStage(code="acceptance", name="验收与移交", order=4, default_owner_role="project_manager"),
        ],
        stage_gates=[
            StageGate(
                code="gate_charter_approved",
                name="立项批准",
                stage_code="initiation",
                required_artifacts=["project_charter", "budget_estimate"],
                approver_roles=["company_leader", "department_leader"],
                pass_criteria=["范围边界明确", "预算责任明确"],
            ),
            StageGate(
                code="gate_acceptance_passed",
                name="验收通过",
                stage_code="acceptance",
                required_artifacts=["acceptance_record", "delivery_documents"],
                approver_roles=["project_sponsor", "quality_owner"],
                pass_criteria=["关键问题关闭", "交付物归档完成"],
            ),
        ],
        work_item_types=[
            WorkItemTypeInfo(code="milestone", name="里程碑", statuses=["planned", "at_risk", "completed", "delayed"], default_status="planned"),
            WorkItemTypeInfo(code="risk", name="风险", statuses=["identified", "assessed", "mitigating", "closed"], default_status="identified"),
            WorkItemTypeInfo(code="issue", name="问题", statuses=["open", "assigned", "resolving", "closed"], default_status="open"),
            WorkItemTypeInfo(code="change_request", name="变更单", statuses=["draft", "submitted", "approved", "rejected"], default_status="draft"),
            WorkItemTypeInfo(code="deliverable", name="交付物", statuses=["planned", "in_progress", "submitted", "accepted"], default_status="planned"),
        ],
        metrics=["milestone_hit_rate", "schedule_variance", "cost_variance", "risk_closure_rate", "acceptance_pass_rate"],
    ),
    ProcessTemplate(
        id="tpl_software_project_default",
        project_type="software_project",
        name="软件项目交付默认流程",
        description="面向定制软件或一次性交付项目的需求、设计、开发、测试、上线、移交流程。",
        stages=[
            LifecycleStage(code="baseline", name="需求基线", order=1, default_owner_role="business_analyst"),
            LifecycleStage(code="design", name="方案与设计", order=2, default_owner_role="architect"),
            LifecycleStage(code="build_test", name="开发与测试", order=3, default_owner_role="tech_lead"),
            LifecycleStage(code="uat_launch", name="验收与上线", order=4, default_owner_role="release_manager"),
        ],
        stage_gates=[
            StageGate(
                code="gate_baseline_locked",
                name="需求基线确认",
                stage_code="baseline",
                required_artifacts=["requirement_spec", "scope_baseline"],
                approver_roles=["customer_owner", "project_manager"],
                pass_criteria=["范围冻结", "变更流程明确"],
            ),
            StageGate(
                code="gate_launch_ready",
                name="上线批准",
                stage_code="uat_launch",
                required_artifacts=["uat_report", "deployment_plan", "rollback_plan"],
                approver_roles=["customer_owner", "release_manager"],
                pass_criteria=["UAT 通过", "运维移交清单完成"],
            ),
        ],
        work_item_types=[
            WorkItemTypeInfo(code="requirement", name="需求", statuses=["draft", "baselined", "changed", "delivered"], default_status="draft"),
            WorkItemTypeInfo(code="development_task", name="开发任务", statuses=["todo", "in_progress", "review", "done"], default_status="todo"),
            WorkItemTypeInfo(code="test_case", name="测试用例", statuses=["draft", "ready", "passed", "failed"], default_status="draft"),
            WorkItemTypeInfo(code="defect", name="缺陷", statuses=["open", "fixing", "retest", "closed"], default_status="open"),
            WorkItemTypeInfo(code="release_package", name="发布包", statuses=["planned", "built", "deployed", "accepted"], default_status="planned"),
        ],
        metrics=["requirement_change_rate", "test_pass_rate", "defect_closure_rate", "acceptance_first_pass_rate", "rollback_count"],
    ),
]
