import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Typography, Select, Form, Input, InputNumber, Modal, Space, message } from 'antd'
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { Title, Text } = Typography
const TYPE_MAP = { supply: '供货合同', install: '安装合同', service: '服务合同', consulting: '咨询合同', other: '其他' }
const STATUS_MAP = { draft: { label: '草稿', color: 'default' }, signing: { label: '签订中', color: 'blue' }, executing: { label: '执行中', color: 'green' }, completed: { label: '已完成', color: 'cyan' }, terminated: { label: '已终止', color: 'red' } }

export default function Contracts() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.contract_type) params.contract_type = filters.contract_type
      const res = await api.get('/contracts', { params })
      setData(res?.items || [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/contracts', vals)
      message.success('合同创建成功')
      form.resetFields()
      load()
    } catch (e) { message.error('创建失败') }
  }

  const columns = [
    { title: '合同编号', dataIndex: 'code', render: t => <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{t}</Text> },
    { title: '合同名称', dataIndex: 'name', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '类型', dataIndex: 'contract_type', render: t => <Tag>{TYPE_MAP[t] || t}</Tag> },
    { title: '甲方', dataIndex: 'party_a', render: t => <Text style={{ color: colors.text.muted }}>{t}</Text> },
    { title: '乙方', dataIndex: 'party_b', render: t => <Text style={{ color: colors.text.muted }}>{t}</Text> },
    { title: '金额(元)', dataIndex: 'amount', render: v => <Text style={{ color: colors.success }}>{v?.toLocaleString()}</Text> },
    { title: '状态', dataIndex: 'status', render: s => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag> },
    { title: '签订日期', dataIndex: 'signed_date', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
  ]

  if (loading) return <div style={{ padding: 24 }}><SkeletonContent type='table' /></div>

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />合同管理
      </Title>

      <Space style={{ marginBottom: 12 }}>
        <Select allowClear placeholder="合同类型" style={{ width: 120 }} onChange={v => setFilters(f => ({ ...f, contract_type: v }))}>
          {Object.entries(TYPE_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
        </Select>
        <Select allowClear placeholder="状态" style={{ width: 120 }} onChange={v => setFilters(f => ({ ...f, status: v }))}>
          {Object.entries(STATUS_MAP).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
        </Select>
        <Button onClick={load}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); Modal.confirm({
          title: '新增合同', open: true, onOk: handleCreate, okText: '创建', cancelText: '取消',
          content: <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="name" label="合同名称" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="code" label="合同编号" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="contract_type" label="类型" rules={[{ required: true }]}>
              <Select><Select.Option value="supply">供货合同</Select.Option><Select.Option value="install">安装合同</Select.Option><Select.Option value="service">服务合同</Select.Option><Select.Option value="consulting">咨询合同</Select.Option><Select.Option value="other">其他</Select.Option></Select>
            </Form.Item>
            <Form.Item name="party_a" label="甲方" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="party_b" label="乙方" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="amount" label="合同金额" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </Form>,
        })}}>新增合同</Button>
      </Space>

      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  )
}
