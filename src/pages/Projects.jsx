import React, { useState, useEffect, useMemo } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, InputNumber, Modal, Space, message, Row, Col, Avatar, Tooltip, Divider, Typography, Progress, DatePicker, Tabs, List } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, TeamOutlined, SettingOutlined, BuildOutlined, SafetyOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text } = Typography
const { TextArea } = Input

const D = {
  primary: '#115cb9', primaryLight: '#d7e2ff', bg: '#f5f7fa', card: '#ffffff',
  border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c',
  success: '#52c41a', warning: '#faad14', danger: '#ff4d4f',
}

const PROJ_STATUS = {
  planning: { label: '规划中', bg: '#dbeafe', color: '#1e40af' },
  bidding: { label: '招投标', bg: '#fef3c7', color: '#92400e' },
  executing: { label: '执行中', bg: '#dcfce7', color: '#166534' },
  suspended: { label: '已暂停', bg: '#f3f4f6', color: '#6b7280' },
  completed: { label: '已完成', bg: '#dcfce7', color: '#166534' },
  closed: { label: '已关闭', bg: '#f3f4f6', color: '#6b7280' },
}

const PARTY_TYPE = {
  party_a: { label: '甲方', bg: '#dbeafe', color: '#1e40af' },
  party_b: { label: '乙方', bg: '#dcfce7', color: '#166534' },
}

const MOCK_PROJECTS = [
  { id: 1, name: 'J-2X高精线联调项目', code: 'PRJ-2026-001', status: 'executing', progress: 78, party_a: 'XX装备集团', party_b: '我公司', leader: '张经理', dept: '工程部', start: '2026-01-01', end: '2026-06-30', budget: 850, spent: 623, hazards: 12, risks: 3, members: 8 },
  { id: 2, name: 'O3厂区建设项目', code: 'PRJ-2026-002', status: 'planning', progress: 25, party_a: 'XX化工集团', party_b: '我公司', leader: '李经理', dept: '工程部', start: '2026-03-01', end: '2026-12-31', budget: 1200, spent: 180, hazards: 3, risks: 5, members: 5 },
  { id: 3, name: '高压管路安装工程', code: 'PRJ-2026-003', status: 'executing', progress: 55, party_a: 'YY能源公司', party_b: '我公司', leader: '王经理', dept: '安装部', start: '2025-11-01', end: '2026-08-30', budget: 450, spent: 298, hazards: 8, risks: 2, members: 6 },
  { id: 4, name: '软件系统集成项目', code: 'PRJ-2026-004', status: 'bidding', progress: 10, party_a: 'ZZ科技公司', party_b: '我公司', leader: '刘经理', dept: '信息部', start: '2026-04-01', end: '2026-10-31', budget: 320, spent: 30, hazards: 0, risks: 4, members: 4 },
  { id: 5, name: '环保设备升级项目', code: 'PRJ-2025-015', status: 'completed', progress: 100, party_a: 'WW环保集团', party_b: '我公司', leader: '陈经理', dept: '工程部', start: '2025-01-01', end: '2025-12-31', budget: 600, spent: 578, hazards: 5, risks: 1, members: 7 },
]

const MOCK_MEMBERS = [
  { id: 1, name: '张经理', role: '项目经理', dept: '工程部', avatar: '张' },
  { id: 2, name: '李工', role: '技术负责人', dept: '工程部', avatar: '李' },
  { id: 3, name: '王工', role: '安全员', dept: '安环部', avatar: '王' },
  { id: 4, name: '刘工', role: '施工员', dept: '安装部', avatar: '刘' },
  { id: 5, name: '陈工', role: '质量员', dept: '质量部', avatar: '陈' },
]

function va(i = 0) {
  return { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } } }
}

function AvatarChip({ name, size = 28 }) {
  const colors = ['#115cb9', '#52c41a', '#faad14', '#ec4899', '#06b6d4']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return <Avatar size={size} style={{ background: colors[idx], fontSize: size * 0.35, fontWeight: 600 }}>{name?.[0] || '?'}</Avatar>
}

function StatCard({ title, value, color, icon }) {
  return (
    <motion.div variants={va()} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text style={{ color: D.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>{title}</Text>
          <span style={{ fontSize: 26, fontWeight: 800, color: D.text }}>{value}</span>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [tab, setTab] = useState('list')
  const [data, setData] = useState(MOCK_PROJECTS)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => data.filter(p => {
    if (search && !p.name.includes(search) && !p.code.includes(search)) return false
    if (filterStatus && p.status !== filterStatus) return false
    return true
  }), [data, search, filterStatus])

  const stats = useMemo(() => ({
    total: data.length,
    executing: data.filter(p => p.status === 'executing').length,
    planning: data.filter(p => p.status === 'planning').length,
    budgetTotal: data.reduce((s, p) => s + p.budget, 0),
    budgetSpent: data.reduce((s, p) => s + p.spent, 0),
  }), [data])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      const newItem = { ...vals, id: Date.now(), code: `PRJ-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`, progress: 0, members: 0, hazards: 0, risks: 0 }
      setData(prev => [newItem, ...prev])
      message.success('项目创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch { }
  }

  const handleDelete = (id) => {
    Modal.confirm({ title: '确认删除', content: '删除后不可恢复，是否继续？', onOk: () => { setData(prev => prev.filter(p => p.id !== id)); message.success('已删除') } })
  }

  const openDetail = (p) => { setSelected(p); setDetailOpen(true) }
  const openMembers = (p) => { setSelected(p); setMembersOpen(true) }

  const columns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', render: (v, r) => <a onClick={() => openDetail(r)} style={{ fontWeight: 600, color: D.primary }}>{v}</a> },
    { title: '编号', dataIndex: 'code', key: 'code', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => { const c = PROJ_STATUS[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '甲方', dataIndex: 'party_a', key: 'party_a', render: v => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '负责人', dataIndex: 'leader', key: 'leader', render: v => <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AvatarChip name={v} size={24} /><Text style={{ fontSize: 13 }}>{v}</Text></div> },
    { title: '预算（万）', dataIndex: 'budget', key: 'budget', render: (v, r) => <div><Text style={{ fontSize: 13, fontWeight: 600 }}>{v}</Text><div><Text style={{ fontSize: 11, color: D.textMuted }}>已用 {r.spent}</Text></div></div> },
    { title: '进度', dataIndex: 'progress', key: 'progress', render: v => <Progress percent={v} size="small" strokeColor={D.primary} /> },
    { title: '操作', key: 'action', width: 140, render: (_, r) => (
      <Space size={4}>
        <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setSelected(r); form.setFieldsValue(r); setModalOpen(true) }} style={{ color: D.textMuted }} /></Tooltip>
        <Tooltip title="成员"><Button type="text" size="small" icon={<TeamOutlined />} onClick={() => openMembers(r)} style={{ color: D.textMuted }} /></Tooltip>
        <Tooltip title="删除"><Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} style={{ color: D.danger }} /></Tooltip>
      </Space>
    )},
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>项目管理</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>管理所有项目，含甲方/乙方属性和成员配置</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '项目总数', value: stats.total, color: D.primary, icon: <BuildOutlined /> },
          { title: '执行中', value: stats.executing, color: D.success, icon: <BuildOutlined /> },
          { title: '规划中', value: stats.planning, color: D.warning, icon: <BuildOutlined /> },
          { title: '总预算（万）', value: stats.budgetTotal, color: D.primary, icon: <SafetyOutlined /> },
        ].map((c, i) => <Col xs={12} sm={6} key={c.title}><StatCard {...c} /></Col>)}
      </Row>

      <Card
        style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
        headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={12} wrap>
            <Input prefix={<SearchOutlined style={{ color: D.textMuted }} />} placeholder="搜索项目名称或编号" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, borderRadius: 10 }} allowClear />
            <Select placeholder="状态筛选" allowClear style={{ width: 130 }} onChange={setFilterStatus} options={Object.entries(PROJ_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => { form.resetFields(); setSelected(null); setModalOpen(true) }}>新建项目</Button>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 8, showSizeChanger: false }} style={{ borderRadius: 0 }} />
      </Card>

      <Modal
        title={<Text style={{ fontWeight: 700, fontSize: 16 }}>{selected ? '编辑项目' : '新建项目'}</Text>}
        open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={handleCreate}
        okText="保存" cancelText="取消" okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }} width={640}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item name="name" label={<Text style={{ fontSize: 13 }}>项目名称</Text>} rules={[{ required: true, message: '请输入项目名称' }]}><Input placeholder="请输入项目名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="leader" label={<Text style={{ fontSize: 13 }}>项目经理</Text>} rules={[{ required: true }]}><Input placeholder="负责人姓名" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="party_a" label={<Text style={{ fontSize: 13 }}>甲方单位</Text>}><Input placeholder="甲方单位名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="party_b" label={<Text style={{ fontSize: 13 }}>乙方单位</Text>}><Input placeholder="乙方单位名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="dept" label={<Text style={{ fontSize: 13 }}>所属部门</Text>}><Input placeholder="所属部门" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label={<Text style={{ fontSize: 13 }}>项目状态</Text>}><Select placeholder="选择状态" options={Object.entries(PROJ_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="budget" label={<Text style={{ fontSize: 13 }}>预算（万元）</Text>}><InputNumber min={0} placeholder="0" style={{ width: '100%', borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="start" label={<Text style={{ fontSize: 13 }}>开始日期</Text>}><Input placeholder="2026-01-01" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="end" label={<Text style={{ fontSize: 13 }}>结束日期</Text>}><Input placeholder="2026-12-31" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label={<Text style={{ fontSize: 13 }}>项目描述</Text>}><TextArea rows={2} placeholder="简要描述项目内容..." style={{ borderRadius: 10 }} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>项目详情</Text>}
        open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null}
        width={680}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}
      >
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <Title level={4} style={{ color: D.text, margin: 0 }}>{selected.name}</Title>
                <Text style={{ color: D.textMuted, fontSize: 12 }}>{selected.code}</Text>
              </div>
              <Tag style={{ background: PROJ_STATUS[selected.status]?.bg, color: PROJ_STATUS[selected.status]?.color, border: 'none', fontWeight: 600, fontSize: 13 }}>{PROJ_STATUS[selected.status]?.label}</Tag>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              {[
                { label: '甲方单位', value: selected.party_a },
                { label: '乙方单位', value: selected.party_b },
                { label: '项目经理', value: selected.leader },
                { label: '所属部门', value: selected.dept },
                { label: '项目周期', value: `${selected.start} ~ ${selected.end}` },
                { label: '项目预算', value: `${selected.budget} 万元` },
              ].map(({ label, value }) => (
                <Col span={12} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ color: D.textMuted, fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</Text>
                    <Text style={{ color: D.text, fontSize: 14, fontWeight: 600 }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: D.textSec, fontSize: 13 }}>项目进度</Text>
                <Text style={{ color: D.primary, fontWeight: 700 }}>{selected.progress}%</Text>
              </div>
              <Progress percent={selected.progress} strokeColor={D.primary} trailColor={`${D.primary}20`} />
            </div>
            <Row gutter={[12, 12]}>
              {[{ label: '隐患数', value: selected.hazards, color: D.danger }, { label: '风险数', value: selected.risks, color: D.warning }, { label: '成员数', value: selected.members, color: D.primary }, { label: '预算执行', value: `${Math.round(selected.spent / selected.budget * 100)}%`, color: D.success }].map(({ label, value, color }) => (
                <Col span={6} key={label}>
                  <div style={{ textAlign: 'center', background: D.bg, borderRadius: 10, padding: '12px 8px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                    <Text style={{ fontSize: 11, color: D.textMuted }}>{label}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>项目成员</Text>}
        open={membersOpen} onCancel={() => setMembersOpen(false)} footer={null}
        width={500}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}
      >
        <div style={{ padding: '16px 24px' }}>
          {MOCK_MEMBERS.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < MOCK_MEMBERS.length - 1 ? `1px solid ${D.border}` : 'none' }}>
              <AvatarChip name={m.name} size={38} />
              <div style={{ flex: 1 }}>
                <Text style={{ fontWeight: 600, color: D.text, fontSize: 14 }}>{m.name}</Text>
                <div><Text style={{ color: D.textMuted, fontSize: 12 }}>{m.role} · {m.dept}</Text></div>
              </div>
              <Button type="primary" ghost size="small" style={{ borderRadius: 8, color: D.primary, borderColor: D.primary }}>移除</Button>
            </motion.div>
          ))}
          <Button type="dashed" block style={{ marginTop: 16, borderRadius: 10, color: D.primary, borderColor: D.primary }} icon={<PlusOutlined />}>添加成员</Button>
        </div>
      </Modal>
    </div>
  )
}
