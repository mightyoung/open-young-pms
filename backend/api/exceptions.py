"""标准错误码定义"""

# A 类：成功
ERR_OK = "A0000"

# B 类：业务错误（0000-1999）
ERR_NOT_FOUND = "B0001"          # 资源不存在
ERR_STATE_INVALID = "B0002"     # 状态不正确
ERR_DUPLICATE = "B0003"         # 数据重复
ERR_NOT_AUTHORIZED = "B0004"    # 未授权操作
ERR_ALREADY_EXISTS = "B0005"    # 资源已存在

# C 类：权限错误
ERR_FORBIDDEN = "C0101"          # 无权限访问
ERR_TOKEN_EXPIRED = "C0102"     # Token 过期
ERR_TOKEN_INVALID = "C0103"     # Token 无效

# D 类：参数错误
ERR_VALIDATION = "D0101"        # 参数校验失败
ERR_MISSING_FIELD = "D0102"     # 必填字段为空
ERR_BAD_REQUEST = "D0103"        # 请求格式错误

# E 类：系统错误
ERR_INTERNAL = "E0101"          # 服务器内部错误
ERR_DB_ERROR = "E0102"          # 数据库错误
ERR_STORAGE_ERROR = "E0103"      # 文件存储错误
ERR_EXTERNAL_SERVICE = "E0104"   # 外部服务调用失败
