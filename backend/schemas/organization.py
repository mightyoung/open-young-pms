"""Organization Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    name: str
    code: str
    parent_id: Optional[str] = None
    level: int = 1
    sort_order: int = 0
    manager_id: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None
    manager_id: Optional[str] = None


class DepartmentTreeNode(BaseModel):
    id: str
    name: str
    code: str
    level: int
    children: list["DepartmentTreeNode"] = []
    user_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class UserDepartmentAssign(BaseModel):
    department_id: str
    position: Optional[str] = None
    is_default: bool = False


class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    parent_id: Optional[str] = None
    level: int
    sort_order: int
    manager_id: Optional[str] = None
    is_active: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class UserOrganizationResponse(BaseModel):
    id: str
    user_id: str
    department_id: str
    position: Optional[str] = None
    is_default: bool

    model_config = ConfigDict(from_attributes=True)
