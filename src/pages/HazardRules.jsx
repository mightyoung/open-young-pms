import React, { useState } from 'react'
import SkeletonContent from "../components/SkeletonContent";
import { colors } from '../styles/theme'
import { Card, Typography, Table, Tag, Space, Button, message, Switch } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

// 预定义派发规则
const DEFAULT_RULES = [
  { id: 1, name: '紧急隐患自动派发', trigger: 'urgency=urgent AND type=safety', assignee: '科室负责人', enabled: true },
  { id: 2, name: '安全生产隐患派发', trigger: 'type=safety', assignee: '安全主管', enabled: true },
  { id: 3, name: '重要隐患通知部门领导', trigger: 'urgency=important', assignee: '部门领导', enabled: false },
  { id: 4, name: '质量缺陷派发质量部', trigger: 'type=quality', assignee: '质量部负责人', enabled: true },
]

export default function HazardRules() {
  const [rules, setRules] = useState(DEFAULT_RULES)

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
    message.success('规则已更新')
  }

  const columns = [
    { title: '规则名称', dataIndex: 'name', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '触发条件', dataIndex: 'trigger', render: t => <Text style={{ color: colors.text.secondary, fontFamily: 'monospace', fontSize: 12 }}>{t}</Text> },
    { title: '自动派发给', dataIndex: 'assignee', render: t => <Tag color="blue">{t}</Tag> },
    {
      title: '状态',
      dataIndex: 'enabled',
      render: (v, r) => (
        <Switch checked={v} onChange={() => toggleRule(r.id)} size="small" />
      )
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <SettingOutlined style={{ marginRight: 8 }} />随手拍自动派发规则
        </Title>
      </div>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a', marginBottom: 16 }}>
        <Text style={{ color: colors.text.muted, fontSize: 12 }}>
          💡 自动派发规则：当隐患满足触发条件时，自动指派给指定负责人，无需手动处理。
        </Text>
      </Card>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={rules} columns={columns} rowKey="id" size="small" pagination={false}
          locale={{ emptyText: '暂无规则' }} />
      </Card>
    </div>
  )
}
