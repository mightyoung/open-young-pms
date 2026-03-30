import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, Modal, Space, message, Row, Col, Typography, Divider, Timeline, Tabs, Progress, Avatar } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined, FileTextOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const CATEGORY_MAP = { structural: { label: '结构工程', bg: '#dbeafe', color: '#1e40af' }, electrical: { label: '电气工程', bg: '#fef3c7', color: '#92400e' }, pipe: { label: '管道工程', bg: '#dcfce7', color: '#166534' }, decoration: { label: '装饰装修', bg: '#fce7f3', color: '#be185d' }, other: { label: '其他', bg: '#f3f4f6', color: '#6b7280' } }
const RESULT_MAP = { pending: { label: '待检查', bg: '#fef3c7', color: '#92400e' }, passed: { label: '合格', bg: '#dcfce7', color: '#166534' }, failed: { label: '不合格', bg: '#fee2e2', color: '#991b1b' } }

const MOCK_STANDARDS = [
  { id: 1, code: 'STD-STR-001', name: '钢结构焊接质量标准', category: 'structural', version: 'v2.1', effective: '2026-01-01', status: 'active', items: 15, desc: '适用于所有钢构件焊接施工的质量验收，涵盖焊缝外观、尺寸、无损检测要求。' },
  { id: 2, code: 'STD-ELC-001', name: '电气接线验收规范', category: 'electrical', version: 'v1.5', effective: '2025-06-01', status: 'active', items: 22, desc: '电气设备安装、接线、接地等工程的质量验收标准。' },
  { id: 3, code: 'STD-PIP-001', name: '管道安装施工规范', category: 'pipe', version: 'v3.0', effective: '2026-02-01', status: 'active', items: 18, desc: '工业管道安装施工及验收规范，含材质、焊接、试压要求。' },
  { id: 4, code: 'STD-STR-002', name: '混凝土浇筑质量标准', category: 'structural', version: 'v1.2', effective: '2025-03-01', status: 'inactive', items: 12, desc: '混凝土结构施工质量控制标准，含配合比、养护、强度要求。' },
]

const MOCK_INSPECTIONS = [
  { id: 1, code: 'INS-20260330-001', name: 'J-2X主轴基础验收', project: 'J-2X高精线联调项目', category: 'structural', result: 'passed', inspector: '陈工', checkDate: '2026-03-28', nextDate: '2026-04-15', status: 'pending' },
  { id: 2, code: 'INS-20260329-001', name: '3号车间电气布线检查', project: 'J-2X高精线联调项目', category: 'electrical', result: 'failed', inspector: '陈工', checkDate: '2026-03-29', nextDate: '—', status: 'pending', issue: '部分回路绝缘电阻不达标' },
  { id: 3, code: 'INS-20260327-001', name: '高压管路焊接探伤', project: '高压管路安装工程', category: 'pipe', result: 'pending', inspector: '张监', checkDate: '2026-03-27', nextDate: '2026-04-05', status: 'pending' },
  { id: 4, code: 'INS-20260325-001', name: '钢结构防腐涂装检查', project: 'J-2X高精线联调项目', category: 'structural', result: 'passed', inspector: '陈工', checkDate: '2026-03-25', nextDate: '2026-04-20', status: 'done' },
  { id: 5, code: 'INS-20260320-001', name: '接地系统测试', project: 'O3厂区建设项目', category: 'electrical', result: 'passed', inspector: '陈工', checkDate: '2026-03-20', nextDate: '2026-05-20', status: 'done' },
]

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

export default function Quality() {
  const [tab, setTab] = useState('standards')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const handleCreate = async () => {
    try {
      await form.validateFields()
      message.success('质量标准创建成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const stdColumns = [
    { title: '标准编号', dataIndex: 'code', key: 'code', render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '标准名称', dataIndex: 'name', key: 'name', render: v => <Text style={{ fontWeight: 600 }}>{v}</Text> },
    { title: '类别', dataIndex: 'category', key: 'category', render: v => { const c = CATEGORY_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '版本', dataIndex: 'version', key: 'version', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
    { title: '检查项', dataIndex: 'items', key: 'items', render: v => <Text style={{ fontWeight: 600, color: D.primary }}>{v} 项</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => <Tag style={{ background: v === 'active' ? '#dcfce7' : '#f3f4f6', color: v === 'active' ? '#166534' : '#6b7280', border: 'none', fontWeight: 600 }}>{v === 'active' ? '现行' : '停用'}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => (
      <Space size={4}>
        <Button type="text" size="small" icon={<FileTextOutlined />} onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ color: D.primary }}>查看</Button>
        <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} />
      </Space>
    )},
  ]

  const insColumns = [
    { title: '检查单编号', dataIndex: 'code', key: 'code', render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '检查名称', dataIndex: 'name', key: 'name', render: (v, r) => (
      <div>
        <Text style={{ fontWeight: 600 }}>{v}</Text>
        <div><Text style={{ color: D.textMuted, fontSize: 12 }}>{r.project}</Text></div>
      </div>
    )},
    { title: '类别', dataIndex: 'category', key: 'category', render: v => { const c = CATEGORY_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '结果', dataIndex: 'result', key: 'result', render: v => { const c = RESULT_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{v === 'passed' ? <CheckCircleOutlined /> : v === 'failed' ? <CloseCircleOutlined /> : null}{c.label}</Tag> } },
    { title: '检查人', dataIndex: 'inspector', key: 'inspector', render: v => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '检查日期', dataIndex: 'checkDate', key: 'checkDate', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
    { title: '操作', key: 'action', render: (_, r) => r.result === 'pending' ? (
      <Space size={4}>
        <Button type="primary" size="small" icon={<CheckOutlined />} style={{ background: D.success, border: 'none', borderRadius: 8 }}>合格</Button>
        <Button size="small" icon={<CloseCircleOutlined />} style={{ borderRadius: 8, color: D.danger }}>不合格</Button>
      </Space>
    ) : <Text style={{ color: D.textMuted, fontSize: 12 }}>—</Text> },
  ]

  const stats = { total: MOCK_INSPECTIONS.length, passed: MOCK_INSPECTIONS.filter(i => i.result === 'passed').length, failed: MOCK_INSPECTIONS.filter(i => i.result === 'failed').length, pending: MOCK_INSPECTIONS.filter(i => i.result === 'pending').length }

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>质量管理</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>质量标准库 · 检查验收 · 整改闭环</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[{ title: '检查标准', value: MOCK_STANDARDS.filter(s => s.status === 'active').length, color: D.primary }, { title: '本月检查', value: stats.total, color: D.text }, { title: '合格', value: stats.passed, color: D.success }, { title: '不合格', value: stats.failed, color: D.danger }].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}><motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
          </motion.div></Col>
        ))}
      </Row>

      <Tabs activeKey={tab} onChange={setTab} items={[{ key: 'standards', label: '质量标准库' }, { key: 'inspections', label: '检查记录' }]} style={{ marginBottom: 16 }} />

      {tab === 'standards' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => { form.resetFields(); setModalOpen(true) }}>新建标准</Button>
          </div>
          <Table columns={stdColumns} dataSource={MOCK_STANDARDS} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
        </Card>
      )}

      {tab === 'inspections' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} bodyStyle={{ padding: 0 }}>
          <Table columns={insColumns} dataSource={MOCK_INSPECTIONS} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
        </Card>
      )}

      <Modal title={<Text style={{ fontWeight: 700 }}>新建质量标准</Text>} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={handleCreate}
        okText="保存" okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }} width={580}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="标准名称" rules={[{ required: true }]}><Input placeholder="标准名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="category" label="专业类别" rules={[{ required: true }]}><Select options={Object.entries(CATEGORY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="code" label="标准编号" rules={[{ required: true }]}><Input placeholder="如 STD-STR-001" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="version" label="版本号"><Input placeholder="v1.0" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Form.Item name="desc" label="标准说明"><Input.TextArea rows={3} placeholder="请输入标准说明..." style={{ borderRadius: 10 }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={<Text style={{ fontWeight: 700 }}>标准详情</Text>} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={580}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag style={{ background: CATEGORY_MAP[selected.category]?.bg, color: CATEGORY_MAP[selected.category]?.color, border: 'none', fontWeight: 600 }}>{CATEGORY_MAP[selected.category]?.label}</Tag>
              <Tag style={{ background: selected.status === 'active' ? '#dcfce7' : '#f3f4f6', color: selected.status === 'active' ? '#166534' : '#6b7280', border: 'none', fontWeight: 600 }}>{selected.status === 'active' ? '现行' : '停用'}</Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>{selected.name}</Title>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>{selected.code}</Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[{ label: '版本', value: selected.version }, { label: '生效日期', value: selected.effective }, { label: '检查项', value: `${selected.items} 项` }].map(({ label, value }) => (
                <Col span={8} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>{label}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: D.text }}>{value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
