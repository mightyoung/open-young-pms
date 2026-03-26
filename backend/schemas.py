from pydantic import BaseModel
from typing import Optional
from enum import Enum

class CompanyCreate(BaseModel):
    name: str
    code: str

class CompanyResponse(BaseModel):
    id: str
    name: str
    code: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str
    code: str
    parent_id: Optional[str]
    leader_id: Optional[str]

class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    parent_id: Optional[str]
    leader_id: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class RoleCreate(BaseModel):
    name: str
    label: str
    permissions: Optional[str]

class RoleResponse(BaseModel):
    id: str
    name: str
    label: str
    permissions: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    phone: Optional[str]
    role_id: str
    company_id: str
    department_id: Optional[str]

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    phone: Optional[str]
    role_id: str
    company_id: str
    department_id: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    code: str
    description: Optional[str]
    budget: Optional[int]
    start_date: Optional[str]
    end_date: Optional[str]
    manager_id: Optional[str]

class ProjectResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str]
    budget: Optional[int]
    start_date: Optional[str]
    end_date: Optional[str]
    manager_id: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    pages: int

class StatusEnum(str, Enum):
    planning = "planning"
    active = "active"
    suspended = "suspended"
    completed = "completed"