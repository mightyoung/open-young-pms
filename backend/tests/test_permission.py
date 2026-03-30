"""Unit tests for permission system."""

import pytest
from unittest.mock import MagicMock

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.permission_service import (
    PERMISSION_MATRIX,
    get_user_permissions,
    has_permission,
    require_any_permission,
    filter_projects_by_permission,
    filter_issues_by_permission,
)


class MockRole:
    def __init__(self, name: str):
        self.name = name


class MockUser:
    def __init__(self, role_name: str | None, department_id: str = "dept1",
                 assigned_projects: list = None, managed_projects: list = None, uid: str = "user1"):
        self.role = MockRole(role_name) if role_name else None
        self.department_id = department_id
        self.assigned_projects = assigned_projects or []
        self.managed_projects = managed_projects or []
        self.id = uid


class MockProject:
    def __init__(self, pid: str, dept_id: str):
        self.id = pid
        self.department_id = dept_id


class MockIssue:
    def __init__(self, iid: str, project_id: str, reporter_id: str, dept_id: str):
        self.id = iid
        self.project_id = project_id
        self.reporter_id = reporter_id
        self.department_id = dept_id


class TestPermissionMatrix:
    def test_all_roles_defined(self):
        expected = {"super_admin", "company_leader", "dept_leader",
                    "section_chief", "project_manager", "field_staff"}
        assert set(PERMISSION_MATRIX.keys()) == expected

    def test_super_admin_has_star(self):
        assert PERMISSION_MATRIX["super_admin"] == ["*"]


class TestGetUserPermissions:
    def test_with_role(self):
        user = MockUser("project_manager")
        perms = get_user_permissions(user)
        assert "project:manage" in perms
        assert "task:*" in perms

    def test_no_role(self):
        user = MockUser(None)
        assert get_user_permissions(user) == []

    def test_field_staff_permissions(self):
        user = MockUser("field_staff")
        perms = get_user_permissions(user)
        assert "issue:create" in perms
        assert "task:execute" in perms
        assert "report:create" in perms


class TestHasPermission:
    def test_super_admin_always_true(self):
        user = MockUser("super_admin")
        assert has_permission(user, "project:create") is True
        assert has_permission(user, "anything") is True

    def test_company_leader_can_read_all_projects(self):
        user = MockUser("company_leader")
        assert has_permission(user, "project:read") is True

    def test_project_manager_can_manage_project(self):
        user = MockUser("project_manager")
        assert has_permission(user, "project:manage") is True

    def test_field_staff_cannot_manage_project(self):
        user = MockUser("field_staff")
        assert has_permission(user, "project:manage") is False


class TestRequireAnyPermission:
    def test_super_admin_passes(self):
        checker = require_any_permission("project:manage", "task:execute")
        user = MockUser("super_admin")
        assert checker(user) is True

    def test_field_staff_passes_task_execute(self):
        checker = require_any_permission("task:execute", "project:manage")
        user = MockUser("field_staff")
        assert checker(user) is True

    def test_no_role_fails(self):
        checker = require_any_permission("project:manage")
        user = MockUser(None)
        assert checker(user) is False


class TestFilterProjectsByPermission:
    def test_super_admin_sees_all(self):
        user = MockUser("super_admin")
        projects = [
            MockProject("p1", "dept1"),
            MockProject("p2", "dept2"),
        ]
        result = filter_projects_by_permission(user, projects)
        assert len(result) == 2

    def test_dept_leader_sees_own_dept(self):
        user = MockUser("dept_leader", department_id="dept1")
        projects = [
            MockProject("p1", "dept1"),
            MockProject("p2", "dept2"),
            MockProject("p3", "dept1"),
        ]
        result = filter_projects_by_permission(user, projects)
        assert len(result) == 2
        assert all(p.department_id == "dept1" for p in result)

    def test_project_manager_sees_assigned_projects(self):
        user = MockUser("project_manager", assigned_projects=["p1", "p3"])
        projects = [
            MockProject("p1", "dept1"),
            MockProject("p2", "dept2"),
            MockProject("p3", "dept3"),
        ]
        result = filter_projects_by_permission(user, projects)
        assert len(result) == 2
        assert {p.id for p in result} == {"p1", "p3"}


class TestFilterIssuesByPermission:
    def test_super_admin_sees_all(self):
        user = MockUser("super_admin")
        issues = [
            MockIssue("i1", "p1", "u1", "dept1"),
            MockIssue("i2", "p2", "u2", "dept2"),
        ]
        result = filter_issues_by_permission(user, issues)
        assert len(result) == 2

    def test_field_staff_sees_own_issues(self):
        user = MockUser("field_staff", uid="u1")
        issues = [
            MockIssue("i1", "p1", "u1", "dept1"),
            MockIssue("i2", "p2", "u2", "dept2"),
            MockIssue("i3", "p1", "u1", "dept1"),
        ]
        result = filter_issues_by_permission(user, issues)
        assert len(result) == 2
        assert all(i.reporter_id == "u1" for i in result)

    def test_project_manager_sees_assigned_project_issues(self):
        user = MockUser("project_manager", assigned_projects=["p1"])
        issues = [
            MockIssue("i1", "p1", "u1", "dept1"),
            MockIssue("i2", "p2", "u2", "dept2"),
        ]
        result = filter_issues_by_permission(user, issues)
        assert len(result) == 1
        assert result[0].project_id == "p1"
