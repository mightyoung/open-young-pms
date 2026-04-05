"""通知模型 — 扩展已生成的 NotificationSetting."""

from sqlalchemy import Boolean, Column, ForeignKey, String, UniqueConstraint

from api.services.fastapi_code_generator.database import Base


class UserNotification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}


class UserNotificationSetting(Base):
    __tablename__ = "notification_settings"
    __table_args__ = (UniqueConstraint("user_id", name="uq_notification_settings_user_id"), {"extend_existing": True})

    id: str = Column(String(36), primary_key=True)
    user_id: str = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)

    issue_assign: bool = Column(Boolean, default=True)
    issue_verify: bool = Column(Boolean, default=True)
    reply_like: bool = Column(Boolean, default=True)
    mention: bool = Column(Boolean, default=True)
    approval: bool = Column(Boolean, default=True)
    system: bool = Column(Boolean, default=True)

    in_app: bool = Column(Boolean, default=True)
    email: bool = Column(Boolean, default=False)
    push: bool = Column(Boolean, default=False)
