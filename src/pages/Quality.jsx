import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Table, Tag, Button, Typography, Select, Space, Modal, Form, Input, InputNumber, message } from 'antd'
import { SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { Title, Text } = Typography

const CATEGORY_MAP = {
  structural: { label: '结构工程', color: 'blue' },
  electrical: { label: '电气工程', color: 'orange' },
  pipe: { label: '管道工程', color: 'cyan' },
  other: { label: '其他', color: 'default' },
}
const RESULT_MAP = {
  pending: { label: '待检查', color: 'orange' },
  passed: { label: '合格', color: 'green' },
  failed: { label: '不合格', color: 'red' },
}

export default function Quality() {
  const [tab, setTab] = useState('standards')
  const [loading, setLoading] = useState(false)
  const [standards, setStandards] = useState([])
  const [inspections, setInspections] = useState([])
  const [form] = Form.useForm()

  const loadStandards = async () => {
    setLoading(true)
    try {
      const res = await api.get('/quality/standards')
      setStandards(res?.items || [])
    } catch { setStandards([]) }
    finally { setLoading(false) }
  }

  const loadInspections = async () => {
    setLoading(true)
    try {
      const res = await api.get('/quality/inspections')
      setInspections(res?.items || [])
    } catch { setInspections([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (tab === 'standards') loadStandards()
    else loadInspections()
  }, [tab])

  const handleCreateStandard = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/quality/standards', vals)
      message.success('标准创建成功')
      form.resetFields()
      loadStandards()
    } catch (e) { message.error('创建失败') }
  }

  const stdColumns = [
    { title: '标准编号', dataIndex: 'code', render: t => <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{t}</Text> },
    { title: '标准名称', dataIndex: 'name', render: t => <Text style={{ color: colors.text.primary }}>{t}</Text> },
    { title: '类别', dataIndex: 'category', render: c => <Tag color={CATEGORY_MAP[c]?.color}>{CATEGORY_MAP[c]?.label || c}</Tag> },
    { title: '及格分', dataIndex: 'pass_score', render: s => <Text style={{ color: colors.success }}>{s}</Text> },
    { title: '检查项', dataIndex: 'check_items', render: items => <Text style={{ color: colors.text.muted }}>{Array.isArray(items) ? items.length + '项' : '-'}</Text> },
    { title: '描述', dataIndex: 'description', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t || '-'}</Text> },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" style={{ color: colors.accent, padding: '2px 6px', height: 'auto' }}
            onClick={() => { form.setFieldsValue(r); setEditingStandard(r.id); Modal.confirm({ title: '编辑标准', okText: '保存', cancelText: '取消', content: <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="name" label="标准名称"><Input /></Form.Item>
              <Form.Item name="category" label="分类"><Select>
                <Select.Option value="structural">结构工程</Select.Option>
                <Select.Option value="electrical">电气工程</Select.Option>
                <Select.Option value="pipe">管道工程</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select></Form.Item>
              <Form.Item name="pass_score" label="及格分"><InputNumber min={0} max={100} /></Form.Item>
              <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
            </Form>, onOk: () => handleUpdateStandard(r.id) }) }}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  const inspColumns = [
    { title: '项目ID', dataIndex: 'project_id', render: t => <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{t?.slice(0, 8) || '-'}</Text> },
    { title: '标准', dataIndex: 'standard_id', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t?.slice(0, 8) || '-'}</Text> },
    { title: '得分', dataIndex: 'score', render: s => <Text style={{ color: s >= 80 ? colors.success : colors.danger }}>{s ?? '-'}</Text> },
    { title: '结果', dataIndex: 'result', render: r => <Tag color={RESULT_MAP[r]?.color}>{RESULT_MAP[r]?.label || r}</Tag> },
    { title: '时间', dataIndex: 'created_at', render: t => <Text style={{ color: colors.text.muted, fontSize: 12 }}>{t ? new Date(t).toLocaleString() : '-'}</Text> },
  ]

  if (loading) return <div style={{ padding: 24 }}><SkeletonContent type='table' /></div>

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: colors.text.primary, marginBottom: 16 }}>
        <SafetyCertificateOutlined style={{ marginRight: 8 }} />质量管理
      </Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type={tab === 'standards' ? 'primary' : 'default'} onClick={() => setTab('standards')}>质量标准库</Button>
        <Button type={tab === 'inspections' ? 'primary' : 'default'} onClick={() => setTab('inspections')}>检查记录</Button>
      </Space>

      {tab === 'standards' && (
        <div>
          <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => { form.resetFields(); Modal.confirm({
            title: '新增质量标准', open: true, onOk: handleCreateStandard,
            okText: '创建', cancelText: '取消',
            content: <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
              <Form.Item name="name" label="标准名称" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="code" label="标准编号" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="category" label="类别" rules={[{ required: true }]}>
                <Select><Select.Option value="structural">结构工程</Select.Option><Select.Option value="electrical">电气工程</Select.Option><Select.Option value="pipe">管道工程</Select.Option><Select.Option value="other">其他</Select.Option></Select>
              </Form.Item>
              <Form.Item name="pass_score" label="及格分数" initialValue={80}><InputNumber min={0} max={100} /></Form.Item>
              <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
            </Form>,
          })}}>新增标准</Button>
          <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
            <Table dataSource={standards} columns={stdColumns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </Card>
        </div>
      )}

      {tab === 'inspections' && (
        <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
          <Table dataSource={inspections} columns={inspColumns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无检查记录' }} />
        </Card>
      )}
    </div>
  )
}
