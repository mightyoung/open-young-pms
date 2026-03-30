import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, Modal, Space, message, Row, Col, Typography, Divider, Timeline, Tabs, Progress } from 'antd'
import { PlusOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const TYPE_MAP = { supply: { label: '供货合同', bg: '#dbeafe', color: '#1e40af' }, install: { label: '安装合同', bg: '#dcfce7', color: '#166534' }, service: { label: '服务合同', bg: '#fef3c7', color: '#92400e' }, consulting: { label: '咨询合同', bg: '#fce7f3', color: '#be185d' }, other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' } }
const STATUS_MAP = { draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' }, signing: { label: '签订中', bg: '#dbeafe', color: '#1e40af' }, executing: { label: '执行中', bg: '#dcfce7', color: '#166534' }, completed: { label: '已完成', bg: '#dcfce7', color: '#166534' }, terminated: { label: '已终止', bg: '#fee2e2', color: '#991b1b' } }

const MOCK_CONTRACTS = [
  { id: 1, code: 'CTR-SUP-2026-001', name: '高精度数控设备供货合同', type: 'supply', party_a: 'XX装备集团', party_b: '我公司', amount: 480, signedDate: '2026-01-15', startDate: '2026-01-20', endDate: '2026-06-30', status: 'executing', payment: 60, progress: 55, leader: '张经理' },
  { id: 2, code: 'CTR-INS-2026-002', name: '高压管路安装施工合同', type: 'install', party_a: 'YY能源公司', party_b: '我公司', amount: 320, signedDate: '2025-11-10', startDate: '2025-11-15', endDate: '2026-08-30', status: 'executing', payment: 45, progress: 60, leader: '王经理' },
  { id: 3, code: 'CTR-SER-2026-003', name: '项目管理咨询服务合同', type: 'service', party_a: 'ZZ咨询公司', party_b: '我公司', amount: 60, signedDate: '2026-02-01', startDate: '2026-02-01', endDate: '2026-12-31', status: 'executing', payment: 30, progress: 28, leader: '张经理' },
  { id: 4, code: 'CTR-SUP-2026-004', name: '电气控制系统采购合同', type: 'supply', party_a: 'WW电气公司', party_b: '我公司', amount: 150, signedDate: '2026-03-01', startDate: '2026-03-05', endDate: '2026-05-31', status: 'signing', payment: 0, progress: 10, leader: '刘经理' },
  { id: 5, code: 'CTR-INS-2025-005', name: '钢结构安装工程合同', type: 'install', party_a: 'VV建设集团', party_b: '我公司', amount: 280, signedDate: '2025-06-01', startDate: '2025-06-15', endDate: '2025-12-31', status: 'completed', payment: 100, progress: 100, leader: '王经理' },
  { id: 6, code: 'CTR-SUP-2025-006', name: '环保设备采购合同', type: 'supply', party_a: 'UU环保集团', party_b: '我公司', amount: 200, signedDate: '2025-02-01', startDate: '2025-02-10', endDate: '2025-08-31', status: 'terminated', payment: 40, progress: 40, leader: '陈经理' },
]

const MOCK_FLOWS = [
  { contract: 'CTR-SUP-2026-001', events: [{ time: '2026-01-15', actor: '法务部', action: '合同拟定' }, { time: '2026-01-15', actor: '张经理', action: '发起审批' }, { time: '2026-01-16', actor: '李总', action: '审批通过' }, { time: '2026-01-18', actor: '双方', action: '签章完成' }, { time: '2026-01-20', actor: '系统', action: '合同生效' }] },
]

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

export default function Contracts() {
  const [tab, setTab] = useState('list')
  const [data] = useState(MOCK_CONTRACTS)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form] = Form.useForm()

  const filtered = data.filter(c => {
    if (search && !c.name.includes(search) && !c.code.includes(search)) return false
    if (filterStatus && c.status !== filterStatus) return false
    return true
  })

  const stats = { total: data.length, executing: data.filter(c => c.status === 'executing').length, amountTotal: data.reduce((s, c) => s + c.amount, 0), amountSigned: data.filter(c => c.status !== 'draft').reduce((s, c) => s + c.amount * c.payment / 100, 0) }

  const handleCreate = async () => {
    try {
      await form.validateFields()
      message.success('合同创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const columns = [
    { title: '合同编号', dataIndex: 'code', key: 'code', render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '合同名称', dataIndex: 'name', key: 'name', render: (v, r) => (
      <div>
        <Text style={{ fontWeight: 600 }}>{v}</Text>
        <div><Text style={{ color: D.textMuted, fontSize: 11 }}>{r.party_a} ↔ {r.party_b}</Text></div>
      </div>
    )},
    { title: '类型', dataIndex: 'type', key: 'type', render: v => { const c = TYPE_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: v => <Text style={{ fontWeight: 700, color: D.text }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => { const c = STATUS_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '执行进度', dataIndex: 'progress', key: 'progress', render: v => <Progress percent={v} size="small" strokeColor={v === 100 ? D.success : D.primary} /> },
    { title: '付款进度', dataIndex: 'payment', key: 'payment', render: v => <Text style={{ fontSize: 12, color: v === 100 ? D.success : D.warning }}>{v}%</Text> },
    { title: '操作', key: 'action', render: (_, r) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ color: D.primary }}>详情</Button>
        <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} />
      </Space>
    )},
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>合同管理</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>合同列表 · 状态流转 · 付款跟踪</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[{ title: '合同总数', value: stats.total, color: D.text }, { title: '执行中', value: stats.executing, color: D.success }, { title: '合同总额（万）', value: stats.amountTotal, color: D.primary }, { title: '已收款（万）', value: Math.round(stats.amountSigned), color: D.warning }].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}><motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
          </motion.div></Col>
        ))}
      </Row>

      <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={12} wrap>
            <Input placeholder="搜索合同名称或编号" style={{ width: 220, borderRadius: 10 }} value={search} onChange={e => setSearch(e.target.value)} />
            <Select placeholder="状态筛选" allowClear style={{ width: 130 }} onChange={setFilterStatus} options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => { form.resetFields(); setModalOpen(true) }}>新建合同</Button>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
      </Card>

      <Modal title={<Text style={{ fontWeight: 700 }}>新建合同</Text>} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={handleCreate}
        okText="保存" okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }} width={600}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="name" label="合同名称" rules={[{ required: true }]}><Input placeholder="合同名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="type" label="合同类型"><Select options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="party_a" label="甲方"><Input placeholder="甲方单位" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="party_b" label="乙方"><Input placeholder="乙方单位" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="amount" label="合同金额（万）"><Input type="number" placeholder="0" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="signedDate" label="签订日期"><Input placeholder="2026-01-01" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="合同状态"><Select options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={<Text style={{ fontWeight: 700 }}>合同详情</Text>} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag style={{ background: TYPE_MAP[selected.type]?.bg, color: TYPE_MAP[selected.type]?.color, border: 'none', fontWeight: 600 }}>{TYPE_MAP[selected.type]?.label}</Tag>
              <Tag style={{ background: STATUS_MAP[selected.status]?.bg, color: STATUS_MAP[selected.status]?.color, border: 'none', fontWeight: 600 }}>{STATUS_MAP[selected.status]?.label}</Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>{selected.name}</Title>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>{selected.code}</Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[{ label: '合同金额', value: `${selected.amount} 万元` }, { label: '签订日期', value: selected.signedDate }, { label: '负责人', value: selected.leader }].map(({ label, value }) => (
                <Col span={8} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>{label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>合同执行进度</Text><Text style={{ color: D.primary, fontWeight: 700 }}>{selected.progress}%</Text>
              </div>
              <Progress percent={selected.progress} strokeColor={D.primary} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>付款进度</Text><Text style={{ color: D.warning, fontWeight: 700 }}>{selected.payment}%</Text>
              </div>
              <Progress percent={selected.payment} strokeColor={D.warning} />
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Title level={5} style={{ color: D.text, marginBottom: 12 }}>合同双方</Title>
            <Row gutter={12}>
              <Col span={12}><div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px' }}><Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>甲方</Text><Text style={{ fontWeight: 600 }}>{selected.party_a}</Text></div></Col>
              <Col span={12}><div style={{ background: D.bg, borderRadius: 10, padding: '12px 14px' }}><Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>乙方</Text><Text style={{ fontWeight: 600 }}>{selected.party_b}</Text></div></Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
