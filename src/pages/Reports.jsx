import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Space, Modal, Form, Input, Steps, message, Row, Col, Typography, Avatar, Timeline, Divider, Tabs } from 'antd'
import { PlusOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography
const { TextArea } = Input

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const REPORT_TYPES = { daily: { label: '日报', bg: '#dbeafe', color: '#1e40af' }, weekly: { label: '周报', bg: '#dcfce7', color: '#166534' }, monthly: { label: '月报', bg: '#fef3c7', color: '#92400e' } }
const STATUS_MAP = { draft: { label: '草稿', bg: '#f3f4f6', color: '#6b7280' }, pending: { label: '待审批', bg: '#fef3c7', color: '#92400e' }, approved: { label: '已通过', bg: '#dcfce7', color: '#166534' }, rejected: { label: '已驳回', bg: '#fee2e2', color: '#991b1b' } }

const MOCK_REPORTS = [
  { id: 1, type: 'daily', title: '日报 - 2026-03-30', project: 'J-2X高精线联调项目', author: '张经理', dept: '工程部', createTime: '2026-03-30 18:00', status: 'approved', progress: '主轴落位完成，遭遇尺寸偏差，等待图纸变更。', stats: { completed: 3, pending: 2, issues: 1 } },
  { id: 2, type: 'weekly', title: '周报 - 第13周', project: 'J-2X高精线联调项目', author: '张经理', dept: '工程部', createTime: '2026-03-28 17:30', status: 'approved', progress: '完成主轴安装、电气接线检查，尺寸偏差问题已联系设计院。', stats: { completed: 12, pending: 5, issues: 2 } },
  { id: 3, type: 'daily', title: '日报 - 2026-03-29', project: 'O3厂区建设项目', author: '李经理', dept: '工程部', createTime: '2026-03-29 17:45', status: 'pending', progress: '完成场地平整，正在进行基础放线。', stats: { completed: 2, pending: 4, issues: 0 } },
  { id: 4, type: 'monthly', title: '月报 - 2026年3月', project: 'J-2X高精线联调项目', author: '张经理', dept: '工程部', createTime: '2026-03-31 09:00', status: 'pending', progress: '3月完成产值约占合同额35%，进度符合预期。质量控制良好，无重大安全事件。', stats: { completed: 28, pending: 8, issues: 3 } },
  { id: 5, type: 'daily', title: '日报 - 2026-03-28', project: '高压管路安装工程', author: '王经理', dept: '安装部', createTime: '2026-03-28 17:30', status: 'rejected', progress: '管道焊接完成60%，材料已到场。', stats: { completed: 5, pending: 3, issues: 1 } },
  { id: 6, type: 'weekly', title: '周报 - 第12周', project: '高压管路安装工程', author: '王经理', dept: '安装部', createTime: '2026-03-21 17:00', status: 'approved', progress: '完成管道铺设200米，焊接完成30个点位。', stats: { completed: 18, pending: 7, issues: 2 } },
]

const AUTO_RULES = [
  { type: 'daily', trigger: '每日 18:00', recipients: '项目经理/部门领导', action: '自动创建草稿，通知填报', status: 'active' },
  { type: 'weekly', trigger: '每周五 17:00', recipients: '部门领导', action: '自动汇总本周所有日报', status: 'active' },
  { type: 'monthly', trigger: '每月最后一天', recipients: '公司领导', action: '自动汇总本月所有周报', status: 'active' },
]

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

export default function Reports() {
  const [tab, setTab] = useState('all')
  const [writeOpen, setWriteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [reports, setReports] = useState(MOCK_REPORTS)

  const filtered = tab === 'all' ? reports : reports.filter(r => r.type === tab)
  const stats = { total: reports.length, pending: reports.filter(r => r.status === 'pending').length, approved: reports.filter(r => r.status === 'approved').length }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setStep(2)
      await new Promise(r => setTimeout(r, 1000))
      message.success('报告已提交，等待审批')
      setWriteOpen(false)
      setStep(0)
      form.resetFields()
    } catch {}
  }

  const columns = [
    { title: '报告标题', dataIndex: 'title', key: 'title', render: (v, r) => (
      <div>
        <Tag style={{ background: REPORT_TYPES[r.type].bg, color: REPORT_TYPES[r.type].color, border: 'none', fontWeight: 600, fontSize: 11, marginBottom: 4 }}>{REPORT_TYPES[r.type].label}</Tag>
        <div><a onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ fontWeight: 600, color: D.primary }}>{v}</a></div>
      </div>
    )},
    { title: '项目', dataIndex: 'project', key: 'project', render: v => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '填报人', dataIndex: 'author', key: 'author', render: v => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => { const c = STATUS_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
    { title: '操作', key: 'action', render: (_, r) => <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ color: D.primary }}>查看</Button> },
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>报告中心</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>日/周/月报填写 · 阶梯自动化 · 审批流转</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[{ title: '全部报告', value: stats.total, color: D.text }, { title: '待审批', value: stats.pending, color: D.warning }, { title: '已通过', value: stats.approved, color: D.success }].map((s, i) => (
          <Col xs={12} sm={8} key={s.title}><motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
          </motion.div></Col>
        ))}
      </Row>

      <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={6}>
            {[['all', '全部'], ...Object.entries(REPORT_TYPES).map(([k, v]) => [k, v.label])].map(([k, label]) => (
              <Button key={k} onClick={() => setTab(k)} type={tab === k ? 'primary' : 'text'} size="small" style={tab === k ? { background: D.primary, border: 'none', borderRadius: 8 } : { color: D.textSec, borderRadius: 8 }}>{label}</Button>
            ))}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => { setWriteOpen(true); setStep(0); form.resetFields() }}>填写报告</Button>
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
      </Card>

      <Modal title={<Text style={{ fontWeight: 700 }}>填写报告</Text>} open={writeOpen} onCancel={() => { setWriteOpen(false); setStep(0); form.resetFields() }} footer={null} width={640}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${D.border}` }}>
          <Steps current={step} size="small" items={[{ title: '选择项目' }, { title: '填写内容' }, { title: '提交审批' }]} />
        </div>
        <div style={{ padding: '20px 24px' }}>
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Text style={{ fontWeight: 600, color: D.text, display: 'block', marginBottom: 16 }}>选择报告类型和项目</Text>
              <Form form={form} layout="vertical">
                <Form.Item name="type" label="报告类型" rules={[{ required: true }]}><Select placeholder="选择类型" options={Object.entries(REPORT_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item>
                <Form.Item name="project" label="所属项目" rules={[{ required: true }]}><Select placeholder="选择项目" options={[{ value: 'J-2X高精线联调项目', label: 'J-2X高精线联调项目' }, { value: 'O3厂区建设项目', label: 'O3厂区建设项目' }, { value: '高压管路安装工程', label: '高压管路安装工程' }]} style={{ borderRadius: 10 }} /></Form.Item>
              </Form>
              <Button type="primary" block size="large" style={{ borderRadius: 12, background: D.primary, marginTop: 8 }} onClick={() => setStep(1)}>下一步</Button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Text style={{ fontWeight: 600, color: D.text, display: 'block', marginBottom: 16 }}>填写报告内容</Text>
              <Form form={form} layout="vertical">
                <Form.Item name="progress" label="本周/日本周工作进展" rules={[{ required: true }]}><TextArea rows={4} placeholder="请详细描述工作进展..." style={{ borderRadius: 10 }} /></Form.Item>
                <Form.Item name="completed" label="完成工作项（逗号分隔）"><Input placeholder="如：主轴落位、接线检查" style={{ borderRadius: 10 }} /></Form.Item>
                <Form.Item name="pending" label="待推进事项（逗号分隔）"><Input placeholder="如：等待图纸变更" style={{ borderRadius: 10 }} /></Form.Item>
                <Form.Item name="issues" label="问题与风险"><TextArea rows={2} placeholder="如有重大问题请说明..." style={{ borderRadius: 10 }} /></Form.Item>
              </Form>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={() => setStep(0)} style={{ borderRadius: 10 }}>上一步</Button>
                <Button type="primary" style={{ borderRadius: 10, background: D.primary }} onClick={handleSubmit}><SendOutlined /> 提交报告</Button>
              </Space>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${D.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: D.success }} />
              </div>
              <Title level={4} style={{ color: D.text, margin: 0 }}>提交成功</Title>
              <Text style={{ color: D.textMuted }}>报告已提交，等待审批人审核</Text>
            </motion.div>
          )}
        </div>
      </Modal>

      <Modal title={<Text style={{ fontWeight: 700 }}>报告详情</Text>} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag style={{ background: REPORT_TYPES[selected.type].bg, color: REPORT_TYPES[selected.type].color, border: 'none', fontWeight: 600 }}>{REPORT_TYPES[selected.type].label}</Tag>
              <Tag style={{ background: STATUS_MAP[selected.status].bg, color: STATUS_MAP[selected.status].color, border: 'none', fontWeight: 600 }}>{STATUS_MAP[selected.status].label}</Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>{selected.title}</Title>
            <Text style={{ color: D.textMuted, fontSize: 12 }}>{selected.project} · {selected.author} · {selected.createTime}</Text>
            <Divider style={{ margin: '16px 0' }} />
            <Title level={5} style={{ color: D.text, marginBottom: 8 }}>报告内容</Title>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.8 }}>{selected.progress}</Text>
            </div>
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              {[{ label: '完成', value: selected.stats.completed, color: D.success }, { label: '进行中', value: selected.stats.pending, color: D.warning }, { label: '问题', value: selected.stats.issues, color: D.danger }].map(s => (
                <Col span={8} key={s.label}>
                  <div style={{ textAlign: 'center', background: D.bg, borderRadius: 10, padding: '10px 8px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <Text style={{ fontSize: 11, color: D.textMuted }}>{s.label}</Text>
                  </div>
                </Col>
              ))}
            </Row>
            {selected.status === 'pending' && (
              <div style={{ background: `${D.warning}10`, border: `1px solid ${D.warning}30`, borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
                <Text style={{ color: D.warning, fontSize: 13 }}><ClockCircleOutlined /> 等待审批中</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
