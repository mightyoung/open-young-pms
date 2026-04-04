# Open Young PMS - 工程项目管理系统 (开源版)

## 🚀 项目简介
Open Young PMS 是一款面向单部门/多项目场景的数字化工程管理平台。涵盖了从立项、WBS分解、进度监控（甘特图/看板）、隐患上报（随手拍）、到 AI 辅助生成报告的全流程能力。

## 🛠 技术栈
- **后端**: FastAPI + SQLAlchemy + PostgreSQL (pgvector)
- **前端**: React 18 + Ant Design 5 + Framer Motion
- **移动端**: uni-app (Vue 3)
- **AI 能力**: 通义千问 Qwen-Max + RAG 知识库

## 📦 核心功能
- **工业级 WBS 管理**: 支持多层级任务分解，实时 WebSocket 进度同步。
- **智能化报告**: AI 自动汇总项目数据，一键生成周报/月报。
- **随手拍 (Safety Capture)**: 移动端离线优先架构，支持弱网环境下隐患快速上报。
- **数据治理看板**: 提供项目维度的多维统计与导出功能。

## 🔐 安全与隐私
- 项目已移除所有私有 API 密钥。
- 请在 `.env` 文件中配置您的 `JWT_SECRET` 和 `DASHSCOPE_API_KEY`。
- **注意**: 默认数据库连接串位于 `backend/database.py`，建议在生产环境通过环境变量覆盖。

## 🚀 快速开始
1. 克隆仓库: `git clone https://github.com/mightyoung/open-young-pms.git`
2. 前端启动: `npm install && npm run dev`
3. 后端启动: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
4. 移动端: 使用 HBuilderX 打开 `mobile` 目录进行编译。

---
*Created by Gemini CLI Agent*
