import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Tabs, Space, Modal, Typography, Divider } from 'antd'
import { CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Text, Title } = Typography

const STATUS_MAP = {
  pending: { label: '待审批', color: 'orange' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  returned: { label: '已退回', color: 'default' },
}

const TYPE_MAP = {
  hazard_rectification: '隐患整改验收',
  report_submit: '报告提交',
  project_create: '项目立项',
  task_complete: '任务完成',
  budget_adjust: '预算调整',
}

export default function ApprovalCenter() {
  const [tab, setTab] = useState('todo')
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [detail, setDetail] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadTasks = async (tabKey) => {
    setLoading(true)
    try {
      const res = await api.get('/approval/my-tasks', { params: { status: tabKey === 'todo' ? 'pending' : 'all' } })
      const items = res?.items || []
      setTasks(items)
    } catch (e) {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks(tab) }, [tab])

  const handleAction = async (taskId, action) => {
    setActionLoading(true)
    try {
      const endpoint = action === 'approve'
        ? `/approval/tasks/${taskId}/approve`
        : `/approval/tasks/${taskId}/return`
      await api.post(endpoint, {})
      loadTasks(tab)
      setDetail(null)
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { title: '类型', dataIndex: 'flow_type', key: 'flow_type', render: t => <Tag>{TYPE_MAP[t] || t}</Tag> },
    { title: '标题', dataIndex: 'title', key: 'title', render: t => <Text style={{ color: colors.text.primary }}>{t || '-'}</Text> },
    { title: '发起人', dataIndex: 'initiator_name', key: 'initiator_name', render: t => <Text style={{ color: colors.text.secondary }}>{t || '-'}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag> },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t ? new Date(t).toLocaleString() : '-'}</Text> },
    {
      title: '操作', key: 'action', render: (_, r) => (
        r.status === 'pending' ? (
          <Space>
            <Button type="link" icon={<CheckOutlined />} onClick={() => setDetail(r)} style={{ color: colors.success }}>处理</Button>
          </Space>
        ) : (
          <Button type="link" onClick={() => setDetail(r)}>查看</Button>
        )
      )
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <ClockCircleOutlined style={{ marginRight: 8 }} />审批中心
      </Title>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'todo', label: `待我审批 ${tab === 'todo' ? `(${tasks.length})` : ''}`, children: null },
          { key: 'history', label: '审批历史', children: null },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: tab === 'todo' ? '🎉 暂无待审批任务' : '暂无审批记录' }}
          pagination={{ pageSize: 20, showTotal: t => `共 ${t} 条` }}
        />
      </Card>

      {/* 审批处理弹窗 */}
      <Modal
        title={<Text style={{ color: colors.text.primary }}>审批处理</Text>}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={detail?.status === 'pending' ? (
          <Space>
            <Button icon={<CloseOutlined />} onClick={() => handleAction(detail.id, 'reject')} loading={actionLoading}>驳回</Button>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleAction(detail.id, 'approve')} loading={actionLoading}>通过</Button>
          </Space>
        ) : null}
        styles={{ body: { background: colors.bg.page, color: colors.text.primary } }}
      >
        {detail && (
          <div style={{ padding: '12px 0' }}>
            <Text style={{ color: colors.text.muted }}>类型：</Text>
            <Tag style={{ marginLeft: 8 }}>{TYPE_MAP[detail.flow_type] || detail.flow_type}</Tag>
            <Divider style={{ borderColor: colors.bg.card }} />
            <Text style={{ color: colors.text.muted }}>标题：</Text>
            <Text style={{ color: colors.text.primary, display: 'block', marginTop: 4 }}>{detail.title || '-'}</Text>
            <Divider style={{ borderColor: colors.bg.card }} />
            <Text style={{ color: colors.text.muted }}>发起人：</Text>
            <Text style={{ color: colors.text.primary, display: 'block', marginTop: 4 }}>{detail.initiator_name || '-'}</Text>
            <Divider style={{ borderColor: colors.bg.card }} />
            <Text style={{ color: colors.text.muted }}>备注：</Text>
            <Text style={{ color: colors.text.primary, display: 'block', marginTop: 4 }}>{detail.comment || '无'}</Text>
          </div>
        )}
      </Modal>
    </div>
  )
}
