import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Typography, Select, Space, Modal, Form, Input, InputNumber, message, Row, Col, Statistic } from 'antd'
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { Title, Text } = Typography
const STATUS_MAP = {
  available: { label: '可用', color: 'green' },
  ordered: { label: '已订购', color: 'blue' },
  delivered: { label: '已到货', color: 'cyan' },
  testing: { label: '检测中', color: 'orange' },
  accepted: { label: '已验收', color: 'green' },
  rejected: { label: '不合格', color: 'red' },
}
const CAT_MAP = { equipment: '设备', material: '材料', labor: '人力', finance: '资金', other: '其他' }

export default function Resources() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category
      const res = await api.get('/resources', { params })
      setData(res?.items || [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/resources', vals)
      message.success('资源登记成功')
      form.resetFields()
      load()
    } catch { message.error('登记失败') }
  }

  const columns = [
    { title: '资源名称', dataIndex: 'name', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '类别', dataIndex: 'category', render: c => <Tag>{CAT_MAP[c] || c}</Tag> },
    { title: '规格', dataIndex: 'spec', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    { title: '数量', dataIndex: 'quantity', render: (v, r) => <Text style={{ color: colors.text.secondary }}>{v} {r.unit || ''}</Text> },
    { title: '供应商', dataIndex: 'supplier', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    { title: '状态', dataIndex: 'status', render: s => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag> },
    { title: '检测结果', dataIndex: 'test_result', render: t => <Tag color={t === 'pass' ? 'green' : t === 'fail' ? 'red' : 'default'}>{t || '-'}</Tag> },
    { title: '订购日期', dataIndex: 'order_date', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
  ]

  const statusCounts = Object.entries(STATUS_MAP).reduce((acc, [k, v]) => {
    acc[k] = data.filter(d => d.status === k).length
    return acc
  }, {})

  if (loading) return <div style={{ padding: 24 }}><SkeletonContent type='table' /></div>

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <AppstoreOutlined style={{ marginRight: 8 }} />资源调度
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {Object.entries(STATUS_MAP).slice(0, 4).map(([k, v]) => (
          <Col span={6} key={k}>
            <Card size="small" style={{ background: colors.bg.page, border: '1px solid #27272a', textAlign: 'center' }}>
              <Statistic title={<Text style={{ color: colors.text.muted }}>{v.label}</Text>} value={statusCounts[k] || 0}
                valueStyle={{ color: v.color === 'green' ? colors.success : v.color === 'red' ? colors.danger : v.color === 'blue' ? colors.accent : colors.text.muted, fontSize: 24 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 12 }}>
        <Select allowClear placeholder="类别" style={{ width: 100 }} onChange={v => setFilters(f => ({ ...f, category: v }))}>
          {Object.entries(CAT_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
        </Select>
        <Select allowClear placeholder="状态" style={{ width: 100 }} onChange={v => setFilters(f => ({ ...f, status: v }))}>
          {Object.entries(STATUS_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
        </Select>
        <Button onClick={load}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); Modal.confirm({
          title: '登记资源', open: true, width: 480, onOk: handleCreate, okText: '登记', cancelText: '取消',
          content: <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="name" label="资源名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="category" label="类别" rules={[{ required: true }]}>
              <Select><Select.Option value="equipment">设备</Select.Option><Select.Option value="material">材料</Select.Option><Select.Option value="labor">人力</Select.Option><Select.Option value="finance">资金</Select.Option><Select.Option value="other">其他</Select.Option></Select>
            </Form.Item>
            <Form.Item name="spec" label="规格型号"><Input /></Form.Item>
            <Form.Item name="quantity" label="数量" initialValue={1}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="unit" label="单位"><Input /></Form.Item>
            <Form.Item name="supplier" label="供应商"><Input /></Form.Item>
          </Form>,
        })}}>登记资源</Button>
      </Space>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
