from enum import Enum


class ErrorCode(Enum):
    SUCCESS = (0, "success")
    INVALID_PARAMS = (1001, "参数错误")
    UNAUTHORIZED = (1002, "未授权")
    FORBIDDEN = (1003, "禁止访问")
    NOT_FOUND = (1004, "资源不存在")
    INTERNAL_ERROR = (1005, "服务器内部错误")
    PERMISSION_DENIED = (2001, "权限不足")
    ROLE_NOT_FOUND = (2002, "角色不存在")
    PROJECT_NOT_FOUND = (3001, "项目不存在")
    ISSUE_NOT_FOUND = (3002, "问题不存在")
    USER_NOT_FOUND = (3003, "用户不存在")
    FILE_TOO_LARGE = (4001, "文件大小超过限制")
    FILE_NOT_FOUND = (4002, "文件不存在")

    @property
    def code(self) -> int:
        return self.value[0]

    @property
    def message(self) -> str:
        return self.value[1]
