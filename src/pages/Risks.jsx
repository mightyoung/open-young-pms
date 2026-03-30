import React, { useState, useEffect } from 'react'
import SkeletonContent from "../components/SkeletonContent";
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Typography, Select, Space, Modal, Form, Input, Slider, message, Row, Col, Statistic } from 'antd'
import { WarningOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography
const LEVEL_MAP = { high: { label: '高', color: 'red' }, medium: { label: '中', color: 'orange' }, low: { label: '低', color: 'green' } }
const STATUS_MAP = { identified: { label: '已识别', color: 'blue' }, monitoring: { label: '监控中', color: 'orange' }, resolved: { label: '已解决', color: 'green' }, accepted: { label: '已接受', color: 'default' } }
const CAT_MAP = { safety: '安全', quality: '质量', schedule: '进度', cost: '成本', compliance: '合规', other: '其他' }

export default function Risks() {
  const [data, setData] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.level) params.level = filters.level
      if (filters.status) params.status = filters.status
      const res = await api.get('/risks', { params })
      setData(res?.items || [])
      setStats(res?.stats || {})
    } catch { setData([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/risks', vals)
      message.success('风险登记成功')
      form.resetFields()
      load()
    } catch { message.error('登记失败') }
  }

  const handleResolve = async (id) => {
    try {
      await api.patch(`/risks/${id}`, { status: 'resolved' })
      message.success('已标记为解决')
      load()
    } catch { message.error('操作失败') }
  }

  const columns = [
    { title: '风险标题', dataIndex: 'title', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '类别', dataIndex: 'category', render: c => <Tag>{CAT_MAP[c] || c}</Tag> },
    { title: '等级', dataIndex: 'level', render: l => <Tag color={LEVEL_MAP[l]?.color}>{LEVEL_MAP[l]?.label || l}</Tag> },
    { title: '概率', dataIndex: 'probability', render: p => <Text style={{ color: colors.text.secondary }}>{Math.round(p * 100)}%</Text> },
    { title: '影响', dataIndex: 'impact', render: i => <Text style={{ color: colors.text.secondary }}>{Math.round(i * 100)}%</Text> },
    { title: '状态', dataIndex: 'status', render: s => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag> },
    { title: '缓解措施', dataIndex: 'mitigation', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    {
      title: '操作', key: 'action', render: (_, r) => r.status !== 'resolved' ? (
        <Button type="link" onClick={() => handleResolve(r.id)} style={{ color: colors.success }}>解决</Button>
      ) : null
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <WarningOutlined style={{ marginRight: 8 }} />风险管理
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[{ k: 'high', label: '高风险' }, { k: 'medium', label: '中风险' }, { k: 'low', label: '低风险' }, { k: 'total', label: '总计' }].map(d => (
          <Col span={6} key={d.k}>
            <Card size="small" style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
              <Statistic title={<Text style={{ color: colors.text.muted }}>{d.label}</Text>}
                value={stats[d.k] || 0}
                valueStyle={{ color: d.k === 'high' ? colors.danger : d.k === 'medium' ? colors.warning : colors.success, fontSize: 24 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 12 }}>
        <Select allowClear placeholder="风险等级" style={{ width: 100 }} onChange={v => setFilters(f => ({ ...f, level: v }))}>
          {Object.entries(LEVEL_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
        </Select>
        <Select allowClear placeholder="状态" style={{ width: 100 }} onChange={v => setFilters(f => ({ ...f, status: v }))}>
          {Object.entries(STATUS_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
        </Select>
        <Button onClick={load}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); Modal.confirm({
          title: '登记风险', open: true, width: 480, onOk: handleCreate, okText: '登记', cancelText: '取消',
          content: <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="title" label="风险标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="project_id" label="关联项目ID" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别" rules={[{ required: true }]}>
              <Select><Select.Option value="safety">安全</Select.Option><Select.Option value="quality">质量</Select.Option><Select.Option value="schedule">进度</Select.Option><Select.Option value="cost">成本</Select.Option><Select.Option value="compliance">合规</Select.Option><Select.Option value="other">其他</Select.Option></Select>
            </Form.Item>
            <Form.Item name="level" label="等级" rules={[{ required: true }]}>
              <Select><Select.Option value="high">高</Select.Option><Select.Option value="medium">中</Select.Option><Select.Option value="low">低</Select.Option></Select>
            </Form.Item>
            <Form.Item name="probability" label="发生概率" initialValue={0.5}><Slider min={0} max={1} step={0.1} /></Form.Item>
            <Form.Item name="impact" label="影响程度" initialValue={0.5}><Slider min={0} max={1} step={0.1} /></Form.Item>
            <Form.Item name="description" label="风险描述"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="mitigation" label="缓解措施"><Input.TextArea rows={2} /></Form.Item>
          </Form>,
        })}}>登记风险</Button>
      </Space>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
