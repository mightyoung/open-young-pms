"""Organization models — Department and UserOrganization."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.services.fastapi_code_generator.database import Base


def _patch_user_model():
    """Add organizations relationship to User model."""
    from api.services.fastapi_code_generator.models import User
    if not hasattr(User, "organizations"):
        User.organizations = relationship("UserOrganization", back_populates="user")


_patch_user_model()


class Department(Base):
    __tablename__ = "departments_org"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    parent_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("departments_org.id"), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    manager_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    parent: Mapped[Optional["Department"]] = relationship("Department", remote_side=[id], back_populates="children", foreign_keys=[parent_id])
    children: Mapped[list["Department"]] = relationship("Department", back_populates="parent", foreign_keys=[parent_id])
    manager: Mapped[Optional["User"]] = relationship("User", foreign_keys=[manager_id])
    user_orgs: Mapped[list["UserOrganization"]] = relationship("UserOrganization", back_populates="department")


class UserOrganization(Base):
    __tablename__ = "user_organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments_org.id"), nullable=False)
    position: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=True)

    department: Mapped["Department"] = relationship("Department", back_populates="user_orgs")
    user: Mapped["User"] = relationship("User", back_populates="organizations")
