"""Unit tests for project lifecycle templates and work item service logic."""

import os
import sys

import pytest
from fastapi import HTTPException

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_project_types_include_three_target_flows():
    from api.services.project_lifecycle import get_project_types

    types = get_project_types()
    codes = {item.code for item in types}

    assert codes == {"software_product", "integration_engineering", "software_project"}


def test_default_templates_cover_all_project_types_with_unique_ids():
    from api.services.project_lifecycle import list_templates

    templates = list_templates()
    ids = [template.id for template in templates]

    assert len(templates) == 3
    assert len(ids) == len(set(ids))
    assert {template.project_type for template in templates} == {
        "software_product",
        "integration_engineering",
        "software_project",
    }


def test_list_templates_filters_by_project_type():
    from api.services.project_lifecycle import list_templates

    templates = list_templates("software_product")

    assert len(templates) == 1
    assert templates[0].project_type == "software_product"
    assert templates[0].work_item_types


@pytest.mark.parametrize(
    "project_type",
    ["software_product", "integration_engineering", "software_project"],
)
def test_lifecycle_preview_contains_stages_gates_and_metrics(project_type):
    from api.services.project_lifecycle import build_lifecycle_preview

    lifecycle = build_lifecycle_preview("project-1", project_type)

    assert lifecycle.project_id == "project-1"
    assert lifecycle.project_type == project_type
    assert lifecycle.stages
    assert lifecycle.stage_gates
    assert lifecycle.metrics


def test_project_from_template_preview_uses_requested_project_data():
    from api.services.project_lifecycle import create_project_from_template_preview
    from schemas.project_lifecycle import ProjectFromTemplateRequest

    preview = create_project_from_template_preview(
        ProjectFromTemplateRequest(
            project_type="software_project",
            name="客户门户交付项目",
            code="SP-001",
            description="first slice preview",
        )
    )

    assert preview.project.name == "客户门户交付项目"
    assert preview.project.code == "SP-001"
    assert preview.template.project_type == "software_project"
    assert preview.lifecycle.stages
    assert preview.stage_gates == preview.template.stage_gates


def test_create_work_item_accepts_valid_type_and_default_status():
    from api.services.project_lifecycle import create_work_item
    from schemas.project_lifecycle import WorkItemCreate

    item = create_work_item("project-1", "software_product", "story", WorkItemCreate(title="作为用户查看路线图"))

    assert item.project_id == "project-1"
    assert item.type == "story"
    assert item.status == "backlog"


def test_create_work_item_rejects_type_outside_project_template():
    from api.services.project_lifecycle import create_work_item
    from schemas.project_lifecycle import WorkItemCreate

    with pytest.raises(HTTPException) as exc_info:
        create_work_item("project-1", "software_product", "milestone", WorkItemCreate(title="工程里程碑"))

    assert exc_info.value.status_code == 400


def test_create_work_item_rejects_invalid_status():
    from api.services.project_lifecycle import create_work_item
    from schemas.project_lifecycle import WorkItemCreate

    with pytest.raises(HTTPException) as exc_info:
        create_work_item(
            "project-1",
            "software_project",
            "defect",
            WorkItemCreate(
                title="登录缺陷",
                status="accepted",
            ),
        )

    assert exc_info.value.status_code == 400


def test_transition_work_item_accepts_valid_target_status():
    from api.services.project_lifecycle import transition_work_item

    item = transition_work_item(
        work_item_id="wi-1",
        project_type="integration_engineering",
        work_item_type="risk",
        target_status="mitigating",
    )

    assert item.id == "wi-1"
    assert item.status == "mitigating"
    assert item.type == "risk"


def test_transition_work_item_rejects_invalid_target_status():
    from api.services.project_lifecycle import transition_work_item

    with pytest.raises(HTTPException) as exc_info:
        transition_work_item(
            work_item_id="wi-1",
            project_type="integration_engineering",
            work_item_type="risk",
            target_status="released",
        )

    assert exc_info.value.status_code == 400
