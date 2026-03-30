"""Permission service — RBAC checking and project/issue filtering."""

from typing import TYPE_CHECKING, Any, Optional

if TYPE_CHECKING:
    from api.services.fastapi_code_generator.models import User


PERMISSION_MATRIX = {
    "super_admin": ["*"],
    "company_leader": [
        "project:read:all", "approval:all", "report:read:all",
        "ai:chat", "issue:read:all",
    ],
    "dept_leader": [
        "project:read:dept", "approval:dept", "report:read:dept",
        "ai:chat", "issue:read:dept", "monitor:view",
    ],
    "section_chief": [
        "approval:section", "issue:verify", "report:read:section",
        "ai:chat", "issue:read:section",
    ],
    "project_manager": [
        "project:manage", "task:*", "issue:manage",
        "report:manage", "ai:chat:project",
    ],
    "field_staff": [
        "issue:create", "task:execute", "report:create", "ai:chat",
    ],
}


def get_user_permissions(user: "User") -> list[str]:
    """Get flat permission list for a user from role and matrix."""
    if not user.role:
        return []
    role_code = user.role.name
    return PERMISSION_MATRIX.get(role_code, [])


def has_permission(user: "User", action: str, resource: Optional[str] = None) -> bool:
    """Check if user has a specific permission.
    
    Args:
        action: permission action in form 'resource:verb' or 'resource:verb:scope'
               e.g. 'project:read', 'project:read:all'
    """
    if not user.role:
        return False
    role_code = user.role.name
    perms = PERMISSION_MATRIX.get(role_code, [])
    if "*" in perms:
        return True
    
    action_base = action.split(":")[0] if ":" in action else action
    action_verb = action.split(":")[1] if ":" in action else None
    
    for perm in perms:
        perm_parts = perm.split(":")
        if perm == action:
            return True
        if len(perm_parts) >= 2 and perm_parts[0] == action_base and perm_parts[1] == action_verb:
            if len(perm_parts) == 2:
                return True
            if len(perm_parts) == 3 and perm_parts[2] == "all":
                return True
    return False


def require_any_permission(*perms: str):
    """Return a checker that returns True if user has any of the required permissions."""
    def checker(user: "User") -> bool:
        if not user.role:
            return False
        role_code = user.role.name
        role_perms = PERMISSION_MATRIX.get(role_code, [])
        if "*" in role_perms:
            return True
        for required in perms:
            if has_permission(user, required):
                return True
        return False
    return checker


def filter_projects_by_permission(user: "User", projects: list[dict]) -> list[dict]:
    """Filter project list by user's role-level permission."""
    if not user.role:
        return []
    role_code = user.role.name
    if role_code in ("super_admin", "company_leader"):
        return projects
    if role_code in ("dept_leader", "section_chief"):
        return [p for p in projects if str(getattr(p, "department_id", None)) == str(user.department_id)]
    if role_code in ("project_manager", "field_staff"):
        assigned = user.assigned_projects or []
        return [p for p in projects if str(getattr(p, "id", None)) in assigned]
    return projects


def filter_issues_by_permission(user: "User", issues: list[dict]) -> list[dict]:
    """Filter issue list by user's role-level permission."""
    if not user.role:
        return []
    role_code = user.role.name
    if role_code in ("super_admin", "company_leader"):
        return issues
    if role_code == "dept_leader":
        return [i for i in issues if str(getattr(i, "department_id", None)) == str(user.department_id)]
    if role_code in ("section_chief", "project_manager"):
        assigned = user.assigned_projects or []
        return [i for i in issues if str(getattr(i, "project_id", None)) in assigned]
    if role_code == "field_staff":
        return [i for i in issues if str(getattr(i, "reporter_id", None)) == str(user.id)]
    return issues
