import React, { useState, useEffect } from 'react'
import SkeletonContent from "../components/SkeletonContent";
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Select, Space, Typography, Drawer, Descriptions, Timeline, Avatar, Statistic, Row, Col, Divider, Modal, message } from 'antd'
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

const STATUS_MAP = {
  pending: { label: '待处理', color: 'orange' },
  assigned: { label: '已指派', color: 'blue' },
  rectifying: { label: '整改中', color: 'processing' },
  pending_verify: { label: '待验收', color: 'purple' },
  verified: { label: '已验收', color: 'green' },
  closed: { label: '已关闭', color: 'default' },
}

const URGENCY_MAP = {
  urgent: { label: '紧急', color: 'red' },
  important: { label: '重要', color: 'orange' },
  normal: { label: '一般', color: 'default' },
}

const TYPE_MAP = {
  safety: { label: '安全生产', color: 'red' },
  quality: { label: '质量缺陷', color: 'orange' },
  environment: { label: '环境问题', color: 'green' },
}

export default function HazardManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ status: undefined, type: undefined, urgency: undefined })
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 20 }
      if (filters.status) params.status = filters.status
      if (filters.type) params.type = filters.type
      if (filters.urgency) params.urgency = filters.urgency
      const res = await api.get('/hazards', { params })
      const items = res?.items || res?.data?.items || []
      setData(items)
      setTotal(res?.total || res?.data?.total || 0)
    } catch (e) {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters, page])

  const handleVerify = async (id) => {
    try {
      await api.post(`/hazards/${id}/verify`)
      message.success('验收成功')
      load()
      setDetail(null)
    } catch (e) {
      message.error('验收失败')
    }
  }

  const columns = [
    { title: '隐患编号', dataIndex: 'hazard_no', key: 'hazard_no', render: t => <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{t || '-'}</Text> },
    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag color={TYPE_MAP[t]?.color}>{TYPE_MAP[t]?.label || t}</Tag> },
    { title: '紧急程度', dataIndex: 'urgency', key: 'urgency', render: u => <Tag color={URGENCY_MAP[u]?.color}>{URGENCY_MAP[u]?.label || u}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag> },
    { title: '描述', dataIndex: 'description', key: 'description', render: t => <Text style={{ color: colors.text.primary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t || '-'}</Text> },
    { title: '位置', dataIndex: 'location', key: 'location', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    { title: '上报人', dataIndex: 'reporter_name', key: 'reporter_name', render: t => <Text style={{ color: colors.text.secondary }}>{t || '-'}</Text> },
    { title: '上报时间', dataIndex: 'created_at', key: 'created_at', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t ? new Date(t).toLocaleString() : '-'}</Text> },
    {
      title: '操作', key: 'action', render: (_, r) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => { setDetail(r); }}>详情</Button>
      )
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <ExclamationCircleOutlined style={{ marginRight: 8 }} />隐患管理
      </Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {Object.entries(STATUS_MAP).slice(0, 4).map(([k, v]) => (
          <Col span={6} key={k}>
            <Card size="small" style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
              <Statistic
                title={<Text style={{ color: colors.text.muted }}>{v.label}</Text>}
                value={data.filter(d => d.status === k).length}
                valueStyle={{ color: v.color === 'default' ? colors.text.muted : v.color, fontSize: 24 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 筛选 */}
      <Card size="small" style={{ background: colors.bg.page, border: '1px solid #27272a', marginBottom: 16 }}>
        <Space wrap>
          <Text style={{ color: colors.text.muted }}>筛选：</Text>
          <Select allowClear placeholder="类型" style={{ width: 120 }} onChange={v => setFilters(f => ({ ...f, type: v }))}>
            {Object.entries(TYPE_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
          <Select allowClear placeholder="紧急程度" style={{ width: 120 }} onChange={v => setFilters(f => ({ ...f, urgency: v }))}>
            {Object.entries(URGENCY_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
          <Select allowClear placeholder="状态" style={{ width: 120 }} onChange={v => setFilters(f => ({ ...f, status: v }))}>
            {Object.entries(STATUS_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
          </Select>
          <Button onClick={load}>刷新</Button>
        </Space>
      </Card>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{
          current: page, pageSize: 20, total,
          onChange: p => setPage(p),
          showTotal: t => `共 ${t} 条`
        }} />
      </Card>

      {/* 详情抽屉 */}
      <Drawer title={<Text style={{ color: colors.text.primary }}>隐患详情</Text>} width={600} open={!!detail} onClose={() => setDetail(null)}
        styles={{ body: { background: colors.bg.page, color: colors.text.primary, padding: 24 } }}>
        {detail && (
          <div>
            <Descriptions column={1} size="small" style={{ color: colors.text.secondary }}>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>编号</Text>}>{detail.hazard_no || '-'}</Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>类型</Text>}><Tag color={TYPE_MAP[detail.type]?.color}>{TYPE_MAP[detail.type]?.label || detail.type}</Tag></Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>紧急程度</Text>}><Tag color={URGENCY_MAP[detail.urgency]?.color}>{URGENCY_MAP[detail.urgency]?.label || detail.urgency}</Tag></Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>状态</Text>}><Tag color={STATUS_MAP[detail.status]?.color}>{STATUS_MAP[detail.status]?.label || detail.status}</Tag></Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>位置</Text>}>{detail.location || '-'}</Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>描述</Text>}>{detail.description || '-'}</Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>上报人</Text>}>{detail.reporter_name || '-'}</Descriptions.Item>
              <Descriptions.Item label={<Text style={{ color: colors.text.muted }}>上报时间</Text>}>{detail.created_at ? new Date(detail.created_at).toLocaleString() : '-'}</Descriptions.Item>
            </Descriptions>

            <Divider style={{ borderColor: colors.bg.card }} />

            {detail.status === 'pending_verify' && (
              <Button type="primary" icon={<CheckCircleOutlined />} block onClick={() => handleVerify(detail.id)} style={{ marginBottom: 16 }}>
                确认验收
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
