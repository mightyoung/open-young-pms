import React, { useState, useEffect } from 'react'
import EmptyState from '../components/EmptyState';
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Empty } from 'antd'
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  submitted: { label: '已提交', color: 'blue' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
}

const TYPE_MAP = {
  daily: '日报', weekly: '周报', monthly: '月报',
}

export default function Reports() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reports')
      const items = res?.items || res?.data?.items || []
      setData(items)
      setTotal(res?.total || res?.data?.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (id) => {
    try {
      await api.post(`/reports/${id}/submit`)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    { title: '报告编号', dataIndex: 'report_no', key: 'report_no', render: t => <span style={{ color: colors.text.primary }}>{t}</span> },
    { title: '类型', dataIndex: 'report_type', key: 'report_type', render: t => <Tag>{TYPE_MAP[t] || t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => {
      const cfg = STATUS_MAP[s] || STATUS_MAP.draft
      return <Tag color={cfg.color}>{cfg.label}</Tag>
    }},
    { title: '提交时间', dataIndex: 'submitted_at', key: 'submitted_at', render: t => <span style={{ color: colors.text.muted }}>{t ? new Date(t).toLocaleString() : '-'}</span> },
    { title: '操作', key: 'action', render: (_, r) => r.status === 'draft' && (
      <Button size="small" type="primary" onClick={() => handleSubmit(r.id)}>提交</Button>
    )},
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: colors.text.primary, margin: 0 }}><FileTextOutlined style={{ marginRight: 8 }} />报告管理</h2>
      </div>
      <Card style={{ background: colors.bg.card, border: '1px solid #3f3f46' }}>
        {loading ? <SkeletonContent type='table' /> :
         data.length === 0 ? <EmptyState type="list" title="暂无报告" style={{ marginTop: 60 }} /> : (
          <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
            pagination={{ total, pageSize: 20, showTotal: t => `共 ${t} 条` }}
          />
        )}
      </Card>
    </div>
  )
}
