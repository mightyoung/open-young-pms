"""Permission models — extend User with project-level permissions."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from api.services.fastapi_code_generator.database import Base


def _patch_user_model():
    """Add project-level permission columns to User model."""
    from api.services.fastapi_code_generator.models import User

    if not hasattr(User, "assigned_projects"):
        User.assigned_projects = Column(JSON, default=list)
    if not hasattr(User, "managed_projects"):
        User.managed_projects = Column(JSON, default=list)


_patch_user_model()


class PermissionRole(Base):
    __tablename__ = "roles_ext"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    permissions: Mapped[list] = mapped_column(JSON, default=list)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PermissionUserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = {"extend_existing": True}

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    role_code: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
