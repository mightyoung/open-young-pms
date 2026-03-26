# 错误码规范

## 格式

- A 类（成功）：A0000 正常
- B 类（业务错误）：B0001-B1999
- C 类（权限错误）：C0001-C0999
- D 类（参数错误）：D0001-D0999
- E 类（系统错误）：E0001-E0999

## 错误码表

### A 类 — 成功

| 错误码 | 说明 |
|--------|------|
| A0000 | 操作成功 |

### B 类 — 业务错误

| 错误码 | 说明 |
|--------|------|
| B0001 | 资源不存在 |
| B0002 | 状态不正确 |
| B0003 | 数据重复 |
| B0004 | 未授权操作 |
| B0005 | 资源已存在 |

### C 类 — 权限错误

| 错误码 | 说明 |
|--------|------|
| C0101 | 无权限访问 |
| C0102 | Token 过期 |
| C0103 | Token 无效 |

### D 类 — 参数错误

| 错误码 | 说明 |
|--------|------|
| D0101 | 参数校验失败 |
| D0102 | 必填字段为空 |
| D0103 | 请求格式错误 |

### E 类 — 系统错误

| 错误码 | 说明 |
|--------|------|
| E0101 | 服务器内部错误 |
| E0102 | 数据库错误 |
| E0103 | 文件存储错误 |
| E0104 | 外部服务调用失败 |

## 使用方式

```python
from api.response import ApiResponse, BusinessException
from api.exceptions import ERR_NOT_FOUND, ERR_VALIDATION

# 抛出业务异常
raise BusinessException(ERR_NOT_FOUND, "资源不存在")

# 统一响应
return ApiResponse.ok(data={"id": "xxx"})
return ApiResponse.error(ERR_VALIDATION, "参数校验失败", "字段 age 必须为正整数")
```
