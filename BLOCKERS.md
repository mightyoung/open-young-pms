# Blockers & Issues Log

## Active Blockers
*(无)*

## 已确认基础设施（2026-03-26 用户确认）
| 服务 | 地址 | 状态 |
|------|------|------|
| PostgreSQL 15 + pgvector | 192.168.1.2:45041 / bs_generator_db | ✅ 已连通 |
| Redis 7 | 192.168.1.2:40967 / DB 3 | ✅ 已连通 |
| rustfs / S3 存储 | 本地 LocalStack 替代，端口 4566 | ⏳ 后续启用 |
| 当前演示模式 | SQLite（USE_SQLITE=true） | ✅ |

## 后续启用计划
- **第 3 周**：docker-compose 中 db/redis 已注释，连接远程地址
- **第 10 周**：Redis 缓存（redis.asyncio），DATABASE_URL 切换生产 PostgreSQL
