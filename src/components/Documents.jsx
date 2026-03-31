/**
 * Documents.jsx — 文档中心页面
 */
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Button, Tooltip, Typography, Empty } from 'antd'
import {
  Search,
  Plus,
  Upload,
  ArrowUpDown,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Star,
} from 'lucide-react'

const { Text } = Typography

const DESIGN = {
  bg: '#f5f7fa',
  surface: '#f5f7fa',
  card: '#ffffff',
  elevated: '#ffffff',
  border: '#e5e7eb',
  accent: '#115cb9',
  accentLight: '#3377cc',
  text: '#1a1a2e',
  textSec: '#5f5f61',
  textMuted: '#8c8c8c',
}

const va = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4 },
    }),
  },
}

const DOCS = [
  {
    id: 1,
    name: '项目文档',
    type: 'folder',
    open: true,
    children: [
      { id: 11, name: '技术方案.md', type: 'file', starred: true },
      { id: 12, name: 'API文档.md', type: 'file' },
      { id: 13, name: '设计规范.md', type: 'file' },
    ],
  },
  {
    id: 2,
    name: '团队规范',
    type: 'folder',
    open: false,
    children: [
      { id: 21, name: '代码规范.md', type: 'file' },
      { id: 22, name: 'Git工作流.md', type: 'file' },
    ],
  },
  {
    id: 3,
    name: '会议记录',
    type: 'folder',
    open: false,
    children: [
      { id: 31, name: '2026-03-周会.md', type: 'file' },
      { id: 32, name: '2026-03-评审会.md', type: 'file' },
    ],
  },
]

const DOC_CONTENT = {
  '技术方案.md': {
    title: '技术方案',
    content: `# 项目技术方案 v1.2

## 1. 系统架构

本系统采用前后端分离架构，前端使用 React + Vite，后端使用 FastAPI。

### 技术选型
- **前端**: React 18, Ant Design 5, Framer Motion
- **后端**: FastAPI, SQLAlchemy, PostgreSQL
- **认证**: JWT Bearer Token

## 2. 数据库设计

### 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(50) | 用户名 |
| email | VARCHAR(100) | 邮箱 |

## 3. API 接口

\`\`\`python
@router.get("/tasks")
async def list_tasks(project_id: int):
    ...
\`\`\`

## 4. 安全措施

- [x] JWT 认证
- [x] RBAC 权限
- [ ] 审计日志
`,
    fullName: '技术方案.md',
    updated: '2小时前',
    size: '12KB',
    author: '张小明',
  },
  'API文档.md': {
    title: 'API 文档',
    content: '# REST API 文档\n\n## 认证\nPOST /api/auth/login',
    fullName: 'API文档.md',
    updated: '1天前',
    size: '8KB',
    author: '李华',
  },
  '设计规范.md': {
    title: '设计规范',
    content: '# UI 设计规范\n\n## 颜色系统\n- 主色: #6366f1\n- 背景: #0a0a0e',
    fullName: '设计规范.md',
    updated: '3天前',
    size: '5KB',
    author: '王芳',
  },
  '代码规范.md': {
    title: '代码规范',
    content: '# 代码规范\n\n## 命名\n- 变量: camelCase\n- 常量: UPPER_SNAKE_CASE',
    fullName: '代码规范.md',
    updated: '1周前',
    size: '6KB',
    author: '张小明',
  },
  'Git工作流.md': {
    title: 'Git 工作流',
    content: '# Git 工作流\n\n## 分支策略\n- main: 主分支\n- dev: 开发分支',
    fullName: 'Git工作流.md',
    updated: '2周前',
    size: '4KB',
    author: '李华',
  },
  '2026-03-周会.md': {
    title: '2026年3月周会纪要',
    content: '# 周会纪要\n\n## 议题\n1. 项目进度汇报\n2. 遇到的问题',
    fullName: '2026-03-周会.md',
    updated: '2天前',
    size: '3KB',
    author: '项目经理',
  },
  '2026-03-评审会.md': {
    title: '2026年3月评审会',
    content: '# 评审会纪要\n\n## 评审内容\n- UI 原型评审\n- 技术方案评审',
    fullName: '2026-03-评审会.md',
    updated: '1天前',
    size: '5KB',
    author: '项目经理',
  },
}

function TreeItem({ item, depth, onSelect, selected, foldersOpen, onToggleFolder }) {
  const isFolder = item.type === 'folder'
  const isOpen = foldersOpen[item.id]
  const content = isFolder ? (
    <>
      <button
        onClick={() => onToggleFolder(item.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: DESIGN.textSec,
          padding: 0,
          marginRight: 4,
          display: 'flex',
        }}
      >
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      <Folder size={14} style={{ color: DESIGN.warning, marginRight: 6, flexShrink: 0 }} />
      <Text style={{ color: DESIGN.text, fontSize: 13 }}>{item.name}</Text>
    </>
  ) : (
    <>
      <div style={{ width: 16 }} />
      <FileText size={14} style={{ color: DESIGN.textSec, marginRight: 6, flexShrink: 0 }} />
      <Text
        style={{
          color: selected === item.name ? DESIGN.accent : DESIGN.textSec,
          fontSize: 13,
          cursor: 'pointer',
          fontWeight: selected === item.name ? 600 : 400,
        }}
        onClick={() => onSelect(item)}
      >
        {item.name}
      </Text>
      {item.starred && <Star size={10} style={{ color: DESIGN.warning, marginLeft: 4 }} />}
    </>
  )

  return (
    <motion.div
      variants={va.fadeUp}
      initial="hidden"
      animate="visible"
      style={{ paddingLeft: depth * 16, paddingRight: 8, paddingTop: 4, paddingBottom: 4 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '5px 8px',
          borderRadius: 8,
          background: selected === (item.name || item.id) ? `${DESIGN.accent}15` : 'transparent',
          cursor: isFolder ? 'pointer' : 'default',
          transition: 'background 0.2s',
        }}
        onClick={isFolder ? () => onToggleFolder(item.id) : undefined}
      >
        {content}
      </div>
      <AnimatePresence>
        {isFolder &&
          isOpen &&
          item.children?.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              selected={selected}
              foldersOpen={foldersOpen}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </AnimatePresence>
    </motion.div>
  )
}

function renderMarkdown(content) {
  if (!content) return null
  const lines = content.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('# '))
      return (
        <h1
          key={i}
          style={{ fontSize: 20, fontWeight: 700, color: DESIGN.text, margin: '16px 0 8px' }}
        >
          {line.slice(2)}
        </h1>
      )
    if (line.startsWith('## '))
      return (
        <h2
          key={i}
          style={{ fontSize: 16, fontWeight: 600, color: DESIGN.text, margin: '12px 0 6px' }}
        >
          {line.slice(3)}
        </h2>
      )
    if (line.startsWith('### '))
      return (
        <h3
          key={i}
          style={{ fontSize: 14, fontWeight: 600, color: DESIGN.textSec, margin: '10px 0 4px' }}
        >
          {line.slice(4)}
        </h3>
      )
    if (line.startsWith('- [x] ') || line.startsWith('- [ ] ')) {
      const checked = line.startsWith('- [x]')
      return (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '2px 0',
            color: DESIGN.textSec,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              border: `2px solid ${checked ? DESIGN.success : DESIGN.textMuted}`,
              background: checked ? DESIGN.success : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {checked && <span style={{ color: '#52c41a', fontSize: 10, fontWeight: 900 }}>✓</span>}
          </div>
          <span
            style={{
              color: checked ? DESIGN.textMuted : DESIGN.textSec,
              textDecoration: checked ? 'line-through' : 'none',
            }}
          >
            {line.slice(6)}
          </span>
        </div>
      )
    }
    if (line.startsWith('- '))
      return (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '2px 0' }}
        >
          <span style={{ color: DESIGN.accent, marginTop: 3 }}>•</span>
          <span style={{ color: DESIGN.textSec, fontSize: 13 }}>{line.slice(2)}</span>
        </div>
      )
    if (line.startsWith('```')) return null
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
    return (
      <p key={i} style={{ color: DESIGN.textSec, fontSize: 13, margin: '2px 0', lineHeight: 1.6 }}>
        {line}
      </p>
    )
  })
}

export default function Documents() {
  const [selected, setSelected] = useState('技术方案.md')
  const [foldersOpen, setFoldersOpen] = useState({ 1: true, 2: false, 3: false })
  const [search, setSearch] = useState('')

  const doc = DOC_CONTENT[selected]

  const toggleFolder = id => {
    setFoldersOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const selectedDoc = DOC_CONTENT[selected]

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, overflow: 'hidden' }}>
      {/* 左侧文件树 */}
      <motion.div
        variants={va.fadeUp}
        initial="hidden"
        animate="visible"
        style={{
          width: 280,
          flexShrink: 0,
          background: DESIGN.surface,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 16,
          padding: 16,
          overflow: 'auto',
          marginRight: 16,
        }}
      >
        {/* 搜索 */}
        <Input
          prefix={<Search size={14} color={DESIGN.textMuted} />}
          placeholder="搜索文档..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 12, borderRadius: 10 }}
        />
        {/* 文件树 */}
        {DOCS.map(item => (
          <TreeItem
            key={item.id}
            item={item}
            depth={0}
            onSelect={setSelected}
            selected={selected}
            foldersOpen={foldersOpen}
            onToggleFolder={toggleFolder}
          />
        ))}
      </motion.div>

      {/* 右侧预览 */}
      <motion.div
        variants={va.fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        style={{
          flex: 1,
          overflow: 'auto',
          background: DESIGN.surface,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 16,
          padding: '24px 28px',
        }}
      >
        {selectedDoc ? (
          <>
            {/* 顶部信息栏 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: `1px solid ${DESIGN.border}`,
              }}
            >
              <div>
                <h2
                  style={{ color: DESIGN.text, fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}
                >
                  {selectedDoc.title}
                </h2>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Text style={{ color: DESIGN.textMuted, fontSize: 12 }}>
                    作者：{selectedDoc.author}
                  </Text>
                  <Text style={{ color: DESIGN.textMuted, fontSize: 12 }}>
                    更新：{selectedDoc.updated}
                  </Text>
                  <Text style={{ color: DESIGN.textMuted, fontSize: 12 }}>{selectedDoc.size}</Text>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip title="收藏">
                  <Button
                    type="text"
                    icon={<Star size={16} />}
                    style={{ color: DESIGN.textSec, borderRadius: 10 }}
                  />
                </Tooltip>
                <Tooltip title="更多">
                  <Button
                    type="text"
                    icon={<MoreHorizontal size={16} />}
                    style={{ color: DESIGN.textSec, borderRadius: 10 }}
                  />
                </Tooltip>
              </div>
            </div>

            {/* Markdown 内容 */}
            <div>{renderMarkdown(selectedDoc.content)}</div>
          </>
        ) : (
          <Empty
            description={<Text style={{ color: DESIGN.textMuted }}>请选择一个文档查看</Text>}
          />
        )}
      </motion.div>
    </div>
  )
}
