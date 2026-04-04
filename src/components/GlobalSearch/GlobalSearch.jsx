/**
 * GlobalSearch — Cmd+K triggered unified search modal.
 * Searches across hazards, tasks, projects, and users using mock data.
 * Real implementation would call feature APIs.
 */
import React, { useState, useEffect, useRef } from 'react'
import { Modal, Input, Tabs, List, Tag, Typography, Empty } from 'antd'
import {
  SafetyOutlined,
  ProjectOutlined,
  ToolOutlined,
  TeamOutlined,
  SearchOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Text } = Typography

const SEARCH_TABS = [
  { key: 'all', label: '全部' },
  { key: 'hazard', label: '隐患' },
  { key: 'task', label: '任务' },
  { key: 'project', label: '项目' },
  { key: 'user', label: '人员' },
]

// Mock data — real implementation calls feature APIs
const MOCK_HAZARDS = [
  { id: 1, title: '3号车间配电箱门未关闭', type: '安全隐患', location: '3号车间-A区配电房' },
  { id: 2, title: '钢结构焊接质量不达标', type: '质量缺陷', location: '2号厂房-北侧钢结构' },
  { id: 3, title: '施工废料未及时清理', type: '环境问题', location: 'O3厂区-东侧施工区' },
  { id: 4, title: '塔吊电缆绝缘层破损', type: '设备问题', location: '主厂房-3号塔吊' },
  { id: 5, title: '临边防护栏杆缺失', type: '安全隐患', location: '2号平台-3层临边' },
]

const MOCK_TASKS = [
  { id: 1, title: '需求调研', phase: '方案设计', assignee: '张三' },
  { id: 2, title: '技术方案编制', phase: '方案设计', assignee: '李四' },
  { id: 3, title: '方案评审', phase: '方案设计', assignee: '王五' },
  { id: 4, title: '基础施工', phase: '施工阶段', assignee: '赵六' },
  { id: 5, title: '钢结构安装', phase: '施工阶段', assignee: '张三' },
]

const MOCK_PROJECTS = [
  { id: 1, name: '智慧工地一期', manager: '王经理' },
  { id: 2, name: '安全监控系统升级', manager: '李经理' },
  { id: 3, name: '能耗管理平台', manager: '张经理' },
]

const MOCK_USERS = [
  { id: 1, name: '张三', role: '项目经理', department: '工程部' },
  { id: 2, name: '李四', role: '安全员', department: '安环部' },
  { id: 3, name: '王五', role: '质量工程师', department: '质量部' },
  { id: 4, name: '赵六', role: '施工员', department: '工程部' },
]

function highlight(text, keyword) {
  if (!keyword || !text) return text
  const idx = String(text).toLowerCase().indexOf(keyword.toLowerCase())
  if (idx === -1) return String(text)
  return (
    <>
      {String(text).slice(0, idx)}
      <mark style={{ background: '#fef3c7', color: 'inherit', padding: '0 2px' }}>
        {String(text).slice(idx, idx + keyword.length)}
      </mark>
      {String(text).slice(idx + keyword.length)}
    </>
  )
}

function ResultItem({ item, keyword, onClose }) {
  const navigate = useNavigate()
  const iconMap = {
    hazard: <SafetyOutlined style={{ fontSize: 20, color: '#115cb9' }} />,
    task: <ToolOutlined style={{ fontSize: 20, color: '#52c41a' }} />,
    project: <ProjectOutlined style={{ fontSize: 20, color: '#faad14' }} />,
    user: <TeamOutlined style={{ fontSize: 20, color: '#722ed1' }} />,
  }
  const routeMap = { hazard: '/hazards', task: '/tasks', project: '/projects', user: '/users' }
  const titleKey = item.title ? 'title' : item.name ? 'name' : 'full_name'
  const descKey = item.type ? 'type' : item.phase ? 'phase' : item.role ? 'role' : 'manager'
  const subKey = item.location ? 'location' : item.assignee ? 'assignee' : item.department ? 'department' : 'manager'

  return (
    <List.Item
      style={styles.resultItem}
      onClick={() => {
        navigate(routeMap[item._type])
        onClose()
      }}
    >
      <List.Item.Meta
        avatar={iconMap[item._type]}
        title={<Text>{highlight(item[titleKey], keyword)}</Text>}
        description={
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Tag style={{ border: 'none', fontSize: 11 }}>{item[descKey]}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{item[subKey]}</Text>
          </span>
        }
      />
      <ArrowRightOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
    </List.Item>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const [keyword, setKeyword] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ hazard: [], task: [], project: [], user: [] })
  const searchRef = useRef(null)

  // Focus input when modal opens, reset state when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 100)
    } else {
      setKeyword('')
      setActiveTab('all')
      setResults({ hazard: [], task: [], project: [], user: [] })
    }
  }, [open])

  // Search when keyword changes
  useEffect(() => {
    if (!keyword || keyword.length < 1) {
      setResults({ hazard: [], task: [], project: [], user: [] })
      return
    }

    const kw = keyword.toLowerCase()
    setResults({
      hazard: MOCK_HAZARDS.filter(
        h => h.title.toLowerCase().includes(kw) || h.type.toLowerCase().includes(kw)
      ).slice(0, 5),
      task: MOCK_TASKS.filter(
        t => t.title.toLowerCase().includes(kw) || t.phase.toLowerCase().includes(kw)
      ).slice(0, 5),
      project: MOCK_PROJECTS.filter(
        p => (p.name || '').toLowerCase().includes(kw) || (p.manager || '').toLowerCase().includes(kw)
      ).slice(0, 5),
      user: MOCK_USERS.filter(
        u =>
          (u.name || '').toLowerCase().includes(kw) ||
          (u.role || '').toLowerCase().includes(kw) ||
          (u.department || '').toLowerCase().includes(kw)
      ).slice(0, 5),
    })
  }, [keyword])

  const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

  const tabItems = SEARCH_TABS.map(tab => ({
    key: tab.key,
    label:
      tab.key === 'all'
        ? `全部${totalCount > 0 ? ` (${totalCount})` : ''}`
        : `${tab.label}${results[tab.key]?.length > 0 ? ` (${results[tab.key].length})` : ''}`,
  }))

  const getResultContent = () => {
    if (!keyword) {
      return (
        <div style={styles.hintBox}>
          <SearchOutlined style={{ fontSize: 32, color: '#8c8c8c', marginBottom: 8 }} />
          <Text type="secondary">输入关键词搜索隐患、任务、项目、人员</Text>
        </div>
      )
    }
    if (totalCount === 0) {
      return <Empty description={`未找到"${keyword}"相关结果`} style={{ margin: '24px 0' }} />
    }
    const data =
      activeTab === 'all'
        ? [
            ...results.hazard.map(i => ({ ...i, _type: 'hazard' })),
            ...results.task.map(i => ({ ...i, _type: 'task' })),
            ...results.project.map(i => ({ ...i, _type: 'project' })),
            ...results.user.map(i => ({ ...i, _type: 'user' })),
          ]
        : results[activeTab]?.map(i => ({ ...i, _type: activeTab })) || []

    return (
      <List
        dataSource={data}
        renderItem={item => <ResultItem item={item} keyword={keyword} onClose={onClose} />}
        style={styles.list}
      />
    )
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      styles={{ body: { padding: 0 } }}
      destroyOnClose
    >
      <div style={styles.container}>
        <Search
          ref={searchRef}
          placeholder="搜索隐患、任务、项目、人员..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          style={{ marginBottom: 12 }}
          allowClear
          autoFocus
        />
        {keyword && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
            style={{ marginBottom: 8 }}
          />
        )}
        <div style={styles.resultBox}>{getResultContent()}</div>
        <div style={styles.footer}>
          <span><kbd style={styles.kbd}>↑↓</kbd> 导航</span>
          <span><kbd style={styles.kbd}>Enter</kbd> 选中</span>
          <span><kbd style={styles.kbd}>Esc</kbd> 关闭</span>
        </div>
      </div>
    </Modal>
  )
}

const styles = {
  container: { padding: '16px 20px' },
  hintBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0',
  },
  resultBox: { maxHeight: 400, overflowY: 'auto' },
  list: { background: 'transparent' },
  resultItem: {
    cursor: 'pointer',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 4,
    transition: 'background 0.15s',
  },
  footer: {
    display: 'flex',
    gap: 16,
    paddingTop: 12,
    borderTop: '1px solid #f0f0f0',
    marginTop: 8,
    fontSize: 12,
    color: '#8c8c8c',
  },
  kbd: {
    display: 'inline-block',
    padding: '1px 5px',
    background: '#f5f5f5',
    border: '1px solid #d9d9d9',
    borderRadius: 4,
    fontSize: 11,
    fontFamily: 'monospace',
  },
}
