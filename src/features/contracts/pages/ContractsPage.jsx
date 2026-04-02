import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Form,
  Input,
  Modal,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Progress,
} from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { PageHeader } from '../../../components/PMSComponents'
import { useContracts } from '../hooks/useContracts'

const { Text } = Typography

const D = {
  primary: '#115cb9',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textSec: '#5f5f61',
  textMuted: '#8c8c8c',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
}

function va(i = 0) {
  return {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } },
  }
}

export default function ContractsPage() {
  const {
    contracts,
    loading,
    total,
    loadContracts,
    createContract,
    TYPE_MAP: TM,
    STATUS_MAP: SM,
  } = useContracts()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadContracts()
  }, [loadContracts])

  const filtered = contracts.filter(c => {
    if (search && !c.name?.includes(search) && !c.code?.includes(search)) return false
    if (filterStatus && c.status !== filterStatus) return false
    return true
  })

  const stats = {
    total: contracts.length,
    executing: contracts.filter(c => c.status === 'executing').length,
    amountTotal: contracts.reduce((s, c) => s + (c.amount || 0), 0),
    amountSigned: contracts
      .filter(c => c.status !== 'draft')
      .reduce((s, c) => s + ((c.amount || 0) * (c.payment || 0)) / 100, 0),
  }

  const handleCreate = async () => {
    try {
      await form.validateFields()
      await createContract(form.getFieldsValue())
      message.success('合同创建成功')
      setModalOpen(false)
      form.resetFields()
      loadContracts()
    } catch (err) {
      if (err?.errorFields) return
      message.error('创建失败，请稍后再试')
    }
  }

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'code',
      key: 'code',
      render: v => (
        <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>
          {v || '—'}
        </Text>
      ),
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name',
      render: (v, r) => (
        <div>
          <Text style={{ fontWeight: 600 }}>{v}</Text>
          <div>
            <Text style={{ color: D.textMuted, fontSize: 11 }}>
              {r.party_a || '—'} ↔ {r.party_b || '—'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: v => {
        const c = TM[v] || TM.other
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '金额（万）',
      dataIndex: 'amount',
      key: 'amount',
      render: v => <Text style={{ fontWeight: 700, color: D.text }}>{v ?? '—'}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const c = SM[v] || { bg: '#f3f4f6', color: '#6b7280', label: v }
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '执行进度',
      dataIndex: 'progress',
      key: 'progress',
      render: v => (
        <Progress percent={v || 0} size="small" strokeColor={v === 100 ? D.success : D.primary} />
      ),
    },
    {
      title: '付款进度',
      dataIndex: 'payment',
      key: 'payment',
      render: v => (
        <Text style={{ fontSize: 12, color: v === 100 ? D.success : D.warning }}>{v || 0}%</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            onClick={() => {
              setSelected(r)
              setDetailOpen(true)
            }}
            style={{ color: D.primary }}
          >
            详情
          </Button>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24, background: D.bg, minHeight: '100vh' }}>
      <PageHeader title="合同管理" subtitle="合同列表 · 状态流转 · 付款跟踪" />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '合同总数', value: stats.total, color: D.text },
          { title: '执行中', value: stats.executing, color: D.success },
          { title: '合同总额（万）', value: stats.amountTotal, color: D.primary },
          { title: '已收款（万）', value: Math.round(stats.amountSigned), color: D.warning },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}>
            <motion.div
              variants={va(i)}
              initial="hidden"
              animate="visible"
              style={{
                background: D.card,
                border: `1px solid ${D.border}`,
                borderRadius: 12,
                padding: '14px 18px',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Card
        style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
        headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space size={12} wrap>
            <Input
              placeholder="搜索合同名称或编号"
              style={{ width: 220, borderRadius: 10 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 130 }}
              onChange={setFilterStatus}
              options={Object.entries(SM).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10, background: D.primary }}
            onClick={() => {
              form.resetFields()
              setModalOpen(true)
            }}
          >
            新建合同
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false, total }}
        />
      </Card>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>新建合同</Text>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleCreate}
        okText="保存"
        okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }}
        width={600}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="合同名称" rules={[{ required: true }]}>
                <Input placeholder="合同名称" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label="合同类型">
                <Select
                  options={Object.entries(TM).map(([k, v]) => ({ value: k, label: v.label }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="party_a" label="甲方">
                <Input placeholder="甲方单位" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="party_b" label="乙方">
                <Input placeholder="乙方单位" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="amount" label="合同金额（万）">
                <Input type="number" placeholder="0" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="signedDate" label="签订日期">
                <Input placeholder="2026-01-01" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="合同状态">
                <Select
                  options={Object.entries(SM).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>合同详情</Text>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag
                style={{
                  background: (TM[selected.type] || TM.other).bg,
                  color: (TM[selected.type] || TM.other).color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {(TM[selected.type] || TM.other).label}
              </Tag>
              <Tag
                style={{
                  background: (SM[selected.status] || {}).bg,
                  color: (SM[selected.status] || {}).color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {(SM[selected.status] || { label: selected.status }).label}
              </Tag>
            </div>
            <Typography.Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>
              {selected.name}
            </Typography.Title>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>
              {selected.code || '—'}
            </Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[
                { label: '合同金额', value: selected.amount ? `${selected.amount} 万元` : '—' },
                { label: '签订日期', value: selected.signedDate || selected.sign_date || '—' },
                { label: '负责人', value: selected.leader || '—' },
              ].map(({ label, value }) => (
                <Col span={8} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>
                      {label}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>合同执行进度</Text>
                <Text style={{ color: D.primary, fontWeight: 700 }}>{selected.progress || 0}%</Text>
              </div>
              <Progress percent={selected.progress || 0} strokeColor={D.primary} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>付款进度</Text>
                <Text style={{ color: D.warning, fontWeight: 700 }}>{selected.payment || 0}%</Text>
              </div>
              <Progress percent={selected.payment || 0} strokeColor={D.warning} />
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Typography.Title level={5} style={{ color: D.text, marginBottom: 12 }}>
              合同双方
            </Typography.Title>
            <Row gutter={12}>
              <Col span={12}>
                <div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>甲方</Text>
                  <Text style={{ fontWeight: 600 }}>{selected.party_a || '—'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px' }}>
                  <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>乙方</Text>
                  <Text style={{ fontWeight: 600 }}>{selected.party_b || '—'}</Text>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
