import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, Modal, Space, message, Row, Col, Typography, Tabs, Divider, Tooltip, Descriptions } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, BookOutlined, TagOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const LEVEL_CONFIG = {
  L1: { label: 'L1 公开', bg: '#dcfce7', color: '#166534', desc: '对外公开，可传播' },
  L2: { label: 'L2 内部', bg: '#dbeafe', color: '#1e40af', desc: '公司内部使用' },
  L3: { label: 'L3 机密', bg: '#fef3c7', color: '#92400e', desc: '涉及商业秘密' },
  L4: { label: 'L4 绝密', bg: '#fee2e2', color: '#991b1b', desc: '最高保密级别' },
}

const CATEGORY_MAP = {
  project: { label: '项目主数据', bg: '#dbeafe', color: '#1e40af' },
  org: { label: '组织主数据', bg: '#dcfce7', color: '#166534' },
  user: { label: '用户主数据', bg: '#fef3c7', color: '#92400e' },
  hazard: { label: '隐患主数据', bg: '#fce7f3', color: '#be185d' },
  quality: { label: '质量主数据', bg: '#f3f4f6', color: '#6b7280' },
  equipment: { label: '设备主数据', bg: '#dbeafe', color: '#1e40af' },
  contract: { label: '合同主数据', bg: '#fef3c7', color: '#92400e' },
}

const MOCK_DICTIONARY = [
  { id: 1, code: 'PRJ-001', name: '项目编号', category: 'project', dataType: 'VARCHAR', length: 20, level: 'L2', owner: '项目管理部', status: 'active', desc: '项目唯一标识，格式：PRJ-YYYY-NNN', standard: '《项目管理手册》v2.1' },
  { id: 2, code: 'ORG-001', name: '组织机构编码', category: 'org', dataType: 'VARCHAR', length: 10, level: 'L2', owner: '综合管理部', status: 'active', desc: '公司组织架构编码规则', standard: '《组织管理规范》v1.5' },
  { id: 3, code: 'USR-001', name: '用户工号', category: 'user', dataType: 'VARCHAR', length: 8, level: 'L2', owner: '信息中心', status: 'active', desc: '员工唯一工号，6位数字', standard: '《人力资源管理规范》' },
  { id: 4, code: 'PRD-001', name: '隐患等级编码', category: 'hazard', dataType: 'VARCHAR', length: 10, level: 'L1', owner: '安全管理部', status: 'active', desc: 'URG紧急/MAJ重大/GEN一般/MNR轻微', standard: '《安全管理体系》' },
  { id: 5, code: 'QUL-001', name: '质量检查项编码', category: 'quality', dataType: 'VARCHAR', length: 15, level: 'L2', owner: '质量管理部', status: 'active', desc: '质量检查项目分类编码', standard: '《质量管理手册》' },
  { id: 6, code: 'EQP-001', name: '设备编号', category: 'equipment', dataType: 'VARCHAR', length: 12, level: 'L2', owner: '设备管理部', status: 'active', desc: '设备唯一标识，含类型+序号', standard: '《设备管理制度》' },
  { id: 7, code: 'CTR-001', name: '合同编号', category: 'contract', dataType: 'VARCHAR', length: 20, level: 'L3', owner: '法务部', status: 'active', desc: '合同编号规则，含年份+类型+序号', standard: '《合同管理规定》' },
  { id: 8, code: 'PRJ-002', name: '项目状态', category: 'project', dataType: 'VARCHAR', length: 20, level: 'L1', owner: '项目管理部', status: 'active', desc: 'PLN规划/BID招投标/EXE执行中/SUS暂停/CMP完成/CLS关闭', standard: '《项目管理手册》v2.1' },
  { id: 9, code: 'HAZ-001', name: '隐患类型编码', category: 'hazard', dataType: 'VARCHAR', length: 10, level: 'L1', owner: '安全管理部', status: 'inactive', desc: 'SAF安全隐患/QLT质量缺陷/ENV环境问题/EQP设备问题/OTH其他', standard: '《隐患管理规范》' },
]

const MOCK_ENCODING = [
  { id: 1, name: '项目编号编码规则', code: 'ENC-PRJ-001', pattern: 'PRJ-YYYY-NNNN', example: 'PRJ-2026-0001', usage: '所有项目立项时自动生成' },
  { id: 2, name: '隐患编号编码规则', code: 'ENC-HAZ-001', pattern: 'HAZ-YYYYMMDD-NNN', example: 'HAZ-20260330-001', usage: '随手拍上报时自动生成' },
  { id: 3, name: '合同编号编码规则', code: 'ENC-CTR-001', pattern: 'CTR-[TYPE]-[YYYY]-[NNN]', example: 'CTR-SUP-2026-001', usage: '合同签订时自动生成，含类型代码' },
  { id: 4, name: '报告编号编码规则', code: 'ENC-RPT-001', pattern: 'RPT-[TYPE]-[YYYYMMDD]-[NNN]', example: 'RPT-DLY-20260330-01', usage: '日/周/月报提交时自动生成' },
  { id: 5, name: '任务编号编码规则', code: 'ENC-TSK-001', pattern: 'TSK-[PRJ]-[NNN]', example: 'TSK-PRJ001-023', usage: 'WBS分解时自动生成' },
  { id: 6, name: '设备编号编码规则', code: 'ENC-EQP-001', pattern: '[TYPE]-[YYYY]-[NNN]', example: 'EQP-2026-0042', usage: '设备入库时自动生成' },
]

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

export default function DataDictionary() {
  const [tab, setTab] = useState('dict')
  const [data, setData] = useState(MOCK_DICTIONARY)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const filtered = data.filter(d => {
    if (search && !d.name.includes(search) && !d.code.includes(search)) return false
    if (filterCat && d.category !== filterCat) return false
    return true
  })

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      setData(prev => [...prev, { ...vals, id: Date.now(), status: 'active' }])
      message.success('字典项创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const dictColumns = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 100, render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '名称', dataIndex: 'name', key: 'name', render: v => <Text style={{ fontWeight: 600 }}>{v}</Text> },
    { title: '分类', dataIndex: 'category', key: 'category', render: v => { const c = CATEGORY_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '数据类型', dataIndex: 'dataType', key: 'dataType', render: v => <Text style={{ color: D.textSec, fontSize: 12 }}>{v}</Text> },
    { title: '数据等级', dataIndex: 'level', key: 'level', render: v => { const c = LEVEL_CONFIG[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 700, fontSize: 11 }}>{c.label}</Tag> } },
    { title: '责任部门', dataIndex: 'owner', key: 'owner', render: v => <Text style={{ color: D.textSec, fontSize: 13 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => <Tag style={{ background: v === 'active' ? '#dcfce7' : '#f3f4f6', color: v === 'active' ? '#166534' : '#6b7280', border: 'none', fontWeight: 600 }}>{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 100, render: (_, r) => (
      <Space size={4}>
        <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setSelected(r); form.setFieldsValue(r); setModalOpen(true) }} style={{ color: D.textMuted }} /></Tooltip>
        <Tooltip title="删除"><Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => { setData(p => p.filter(x => x.id !== r.id)); message.success('已删除') }} style={{ color: D.danger }} /></Tooltip>
      </Space>
    )},
  ]

  const encColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name', render: v => <Text style={{ fontWeight: 600 }}>{v}</Text> },
    { title: '规则编码', dataIndex: 'code', key: 'code', render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '编码格式', dataIndex: 'pattern', key: 'pattern', render: v => <Text style={{ fontFamily: 'monospace', color: D.textSec, background: `${D.primary}10`, padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{v}</Text> },
    { title: '示例', dataIndex: 'example', key: 'example', render: v => <Text style={{ color: D.success, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '用途', dataIndex: 'usage', key: 'usage', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>数据字典</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>数据分级标签 · 主数据编码规范 · 统一数据标准</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {Object.entries(LEVEL_CONFIG).map(([k, v], i) => (
          <Col xs={12} sm={6} key={k}>
            <motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <Tag style={{ background: v.bg, color: v.color, border: 'none', fontWeight: 700, fontSize: 11, marginBottom: 8 }}>{v.label}</Tag>
              <div style={{ fontSize: 11, color: D.textMuted }}>{v.desc}</div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: 'dict', label: <span><BookOutlined /> 数据字典</span> },
        { key: 'encoding', label: <span><TagOutlined /> 编码规范</span> },
      ]} style={{ marginBottom: 16 }} />

      {tab === 'dict' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space size={12} wrap>
              <Input prefix={<SearchOutlined style={{ color: D.textMuted }} />} placeholder="搜索名称或编码" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, borderRadius: 10 }} allowClear />
              <Select placeholder="分类筛选" allowClear style={{ width: 140 }} onChange={setFilterCat} options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} />
            </Space>
            <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => { form.resetFields(); setSelected(null); setModalOpen(true) }}>新建字典项</Button>
          </div>
          <Table columns={dictColumns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
        </Card>
      )}

      {tab === 'encoding' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: '16px 20px' }}>
          <Table columns={encColumns} dataSource={MOCK_ENCODING} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: false }} />
        </Card>
      )}

      <Modal title={<Text style={{ fontWeight: 700 }}>{selected ? '编辑字典' : '新建字典项'}</Text>} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={handleCreate}
        okText="保存" okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }} width={580}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="code" label={<Text style={{ fontSize: 13 }}>编码</Text>} rules={[{ required: true }]}><Input placeholder="如 PRJ-001" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="name" label={<Text style={{ fontSize: 13 }}>名称</Text>} rules={[{ required: true }]}><Input placeholder="数据项名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="category" label={<Text style={{ fontSize: 13 }}>分类</Text>}><Select options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="level" label={<Text style={{ fontSize: 13 }}>数据等级</Text>}><Select options={Object.entries(LEVEL_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="dataType" label={<Text style={{ fontSize: 13 }}>数据类型</Text>}><Input placeholder="VARCHAR" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="length" label={<Text style={{ fontSize: 13 }}>长度</Text>}><Input placeholder="20" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Form.Item name="owner" label={<Text style={{ fontSize: 13 }}>责任部门</Text>}><Input placeholder="责任部门" style={{ borderRadius: 10 }} /></Form.Item>
          <Form.Item name="desc" label={<Text style={{ fontSize: 13 }}>说明</Text>}><Input.TextArea rows={2} placeholder="数据项说明..." style={{ borderRadius: 10 }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
