import React, { useState, useEffect } from 'react'
import EmptyState from '../components/EmptyState';
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Select, Space, Empty, Drawer, Descriptions } from 'antd'
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const ACTION_MAP = {
  login: { label: '登录', color: 'green' }, logout: { label: '登出', color: 'default' },
  create: { label: '创建', color: 'blue' }, update: { label: '更新', color: 'orange' },
  delete: { label: '删除', color: 'red' }, approve: { label: '通过', color: 'green' },
  reject: { label: '驳回', color: 'red' }, submit: { label: '提交', color: 'blue' },
}
const ENTITY_MAP = {
  user: '用户', project: '项目', hazard: '随手拍', report: '报告', approval: '审批流', task: '任务',
}

export default function AuditLogs() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null)
  const [entityType, setEntityType] = useState(null)
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, page_size: 20 }
      if (action) params.action = action
      if (entityType) params.entity_type = entityType
      const res = await api.get('/audit/logs', { params })
      const items = res.items || res.data?.items || []
      setData(items)
      setTotal(res.total || res.data?.total || 0)
      setPage(p)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [action, entityType])

  const columns = [
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: t => <span style={{ color: colors.text.muted, fontSize: 12 }}>{t ? new Date(t).toLocaleString() : '-'}</span> },
    { title: '操作', dataIndex: 'action', key: 'action', render: a => <Tag color={ACTION_MAP[a]?.color}>{ACTION_MAP[a]?.label || a}</Tag> },
    { title: '对象', dataIndex: 'entity_type', key: 'entity_type', render: e => <span style={{ color: colors.text.secondary }}>{ENTITY_MAP[e] || e}</span> },
    { title: '名称', dataIndex: 'entity_name', key: 'entity_name', render: t => <span style={{ color: colors.text.primary }}>{t || '-'}</span> },
    { title: '用户', dataIndex: 'username', key: 'username', render: t => <span style={{ color: colors.text.muted }}>{t}</span> },
    { title: 'IP', dataIndex: 'ip_address', key: 'ip_address', render: t => <span style={{ color: colors.text.disabled, fontSize: 12 }}>{t || '-'}</span> },
    { title: '详情', key: 'detail', render: (_, r) => <Button size="small" onClick={() => setDetail(r)}>查看</Button> },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: colors.text.primary, marginBottom: 16 }}><FileTextOutlined style={{ marginRight: 8 }} />审计日志</h2>
      <Card style={{ background: colors.bg.card, border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <Space wrap>
          <Select placeholder="操作类型" allowClear style={{ width: 120 }}
            onChange={v => setAction(v)} options={Object.entries(ACTION_MAP).map(([k,v]) => ({value:k, label:v.label}))} />
          <Select placeholder="对象类型" allowClear style={{ width: 120 }}
            onChange={v => setEntityType(v)} options={Object.entries(ENTITY_MAP).map(([k,v]) => ({value:k, label:v}))} />
          <Button icon={<SearchOutlined />} onClick={() => load(1)}>搜索</Button>
        </Space>
      </Card>
      <Card style={{ background: colors.bg.card, border: '1px solid #e5e7eb' }}>
        {loading ? <SkeletonContent type='table' /> :
         data.length === 0 ? <EmptyState type="list" title="暂无日志" style={{ marginTop: 60 }} /> :
         <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
           onChange={p => load(p.current)}
           pagination={{ current: page, total, pageSize: 20, showTotal: t => `共 ${t} 条` }}
         />}
      </Card>

      <Drawer title="日志详情" open={!!detail} onClose={() => setDetail(null)} width={500}
        styles={{ body: { background: colors.bg.base, color: colors.text.primary } }}>
        {detail && (
          <Descriptions column={1} size="small" bordered
            styles={{ label: { color: colors.text.muted, width: 120 }, content: { color: colors.text.primary } }}>
            <Descriptions.Item label="时间">{detail.created_at}</Descriptions.Item>
            <Descriptions.Item label="操作"><Tag color={ACTION_MAP[detail.action]?.color}>{ACTION_MAP[detail.action]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="对象">{ENTITY_MAP[detail.entity_type]} (ID: {detail.entity_id || '-'})</Descriptions.Item>
            <Descriptions.Item label="名称">{detail.entity_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="用户">{detail.username}</Descriptions.Item>
            <Descriptions.Item label="IP">{detail.ip_address || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
