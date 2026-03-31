"""JWT authentication — centralized. Proxies to api.services.fastapi_code_generator.auth."""

from api.services.fastapi_code_generator.auth import (
    create_access_token,
    decode_token,
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)

__all__ = [
    "create_access_token",
    "decode_token",
    "get_current_user",
    "hash_password",
    "require_role",
    "verify_password",
]
