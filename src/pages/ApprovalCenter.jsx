import React, { useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Select, Input, Divider, Typography, Avatar, Tabs, Badge, message, Row, Col, Steps, Timeline, Empty } from 'antd'
import { CheckOutlined, CloseOutlined, ClockCircleOutlined, SendOutlined, ExclamationCircleOutlined, SafetyOutlined, FileTextOutlined, BuildOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const TYPE_MAP = {
  hazard_rectification: { label: '隐患整改验收', bg: '#fee2e2', color: '#991b1b', icon: <SafetyOutlined /> },
  report_submit: { label: '报告提交', bg: '#dbeafe', color: '#1e40af', icon: <FileTextOutlined /> },
  project_create: { label: '项目立项', bg: '#dcfce7', color: '#166534', icon: <BuildOutlined /> },
  task_complete: { label: '任务完成', bg: '#fef3c7', color: '#92400e', icon: <CheckCircleOutlined /> },
  budget_adjust: { label: '预算调整', bg: '#fce7f3', color: '#be185d', icon: <FileTextOutlined /> },
}
const STATUS_MAP = {
  pending: { label: '待审批', bg: '#fef3c7', color: '#92400e' },
  approved: { label: '已通过', bg: '#dcfce7', color: '#166534' },
  rejected: { label: '已驳回', bg: '#fee2e2', color: '#991b1b' },
  returned: { label: '已退回', bg: '#f3f4f6', color: '#6b7280' },
}

const MOCK_TODO = [
  { id: 1, type: 'hazard_rectification', title: '3号车间配电箱隐患整改验收', project: 'J-2X高精线联调项目', applicant: '王安全', dept: '安环部', createTime: '2026-03-30 10:30', desc: '已对配电箱门进行修复，加装防误碰装置，附整改照片。' },
  { id: 2, type: 'report_submit', title: '日报 - 2026-03-29', project: 'O3厂区建设项目', applicant: '李经理', dept: '工程部', createTime: '2026-03-29 17:45', desc: '完成场地平整，正在进行基础放线，施工进度正常。' },
  { id: 3, type: 'project_create', title: '新厂区二期建设项目立项', project: '新项目', applicant: '张总', dept: '总经理室', createTime: '2026-03-28 14:00', desc: '申请启动新厂区二期建设项目，计划投资1200万元。' },
  { id: 4, type: 'budget_adjust', title: 'J-2X项目预算调整申请', project: 'J-2X高精线联调项目', applicant: '张经理', dept: '工程部', createTime: '2026-03-27 09:00', desc: '因设计变更，申请增加预算80万元。' },
]
const MOCK_DONE = [
  { id: 5, type: 'hazard_rectification', title: '脚手架扣件松动整改验收', project: '高压管路安装工程', applicant: '李师傅', dept: '安装部', createTime: '2026-03-25 14:30', result: 'approved', approveTime: '2026-03-25 16:00', approver: '王经理' },
  { id: 6, type: 'report_submit', title: '周报 - 第12周', project: 'J-2X高精线联调项目', applicant: '张经理', dept: '工程部', createTime: '2026-03-21 17:00', result: 'approved', approveTime: '2026-03-22 09:30', approver: '李总' },
  { id: 7, type: 'project_create', title: '软件系统集成项目立项', project: '软件系统集成项目', applicant: '刘经理', dept: '信息部', createTime: '2026-03-20 10:00', result: 'approved', approveTime: '2026-03-20 15:00', approver: '张总' },
  { id: 8, type: 'report_submit', title: '月报 - 2026年2月', project: 'J-2X高精线联调项目', applicant: '张经理', dept: '工程部', createTime: '2026-02-28 18:00', result: 'rejected', rejectTime: '2026-03-01 09:00', approver: '李总', reason: '进度描述过于简略，请补充具体数据和问题分析。' },
]

const WORKFLOW_TEMPLATES = [
  { id: 'hazard', name: '隐患整改验收流', steps: ['项目负责人初审', '科室负责人复核', '部门领导终审'], types: ['hazard_rectification'] },
  { id: 'report', name: '报告审批流', steps: ['项目经理确认', '部门领导审批'], types: ['report_submit'] },
  { id: 'project', name: '项目立项审批流', steps: ['部门领导初审', '公司领导复审', '总经理终审'], types: ['project_create'] },
  { id: 'budget', name: '预算调整审批流', steps: ['项目经理申请', '财务审核', '分管领导审批', '总经理终审'], types: ['budget_adjust'] },
]

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

function AvatarChip({ name, size = 32 }) {
  const colors = ['#115cb9', '#52c41a', '#faad14', '#ec4899', '#06b6d4']
  return <Avatar size={size} style={{ background: colors[(name?.charCodeAt(0) || 0) % colors.length], fontSize: size * 0.35, fontWeight: 600 }}>{name?.[0]}</Avatar>
}

export default function ApprovalCenter() {
  const [tab, setTab] = useState('todo')
  const [detailOpen, setDetailOpen] = useState(false)
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = (item) => {
    Modal.confirm({ title: '确认通过', content: `确认通过「${item.title}」？`, okText: '确认通过', okButtonProps: { style: { background: D.success, borderRadius: 10 } }, onOk: () => { message.success('已审批通过'); setDetailOpen(false) } })
  }
  const handleReject = (item) => {
    Modal.confirm({
      title: '确认驳回', content: <div><Text style={{ color: D.textSec }}>请输入驳回原因：</Text><Input.TextArea rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="请输入驳回原因..." style={{ marginTop: 8, borderRadius: 10 }} /></div>,
      okText: '确认驳回', okButtonProps: { style: { background: D.danger, borderRadius: 10 } }, onOk: () => { message.success('已驳回'); setDetailOpen(false); setRejectReason('') }
    })
  }

  const todoCols = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 130, render: v => { const c = TYPE_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600, fontSize: 11 }}>{c.label}</Tag> } },
    { title: '标题', dataIndex: 'title', key: 'title', render: (v, r) => <a onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ fontWeight: 600, color: D.primary }}>{v}</a> },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', render: v => <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AvatarChip name={v} size={24} /><Text style={{ fontSize: 13 }}>{v}</Text></div> },
    { title: '项目', dataIndex: 'project', key: 'project', render: v => <Text style={{ color: D.textSec, fontSize: 12 }}>{v}</Text> },
    { title: '时间', dataIndex: 'createTime', key: 'createTime', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text> },
    { title: '操作', key: 'action', render: (_, r) => (
      <Space size={4}>
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(r)} style={{ background: D.success, border: 'none', borderRadius: 8 }}>通过</Button>
        <Button size="small" icon={<CloseOutlined />} onClick={() => handleReject(r)} style={{ borderRadius: 8, color: D.danger }}>驳回</Button>
        <Button type="text" size="small" onClick={() => { setSelected(r); setDetailOpen(true) }} style={{ color: D.textMuted }}>详情</Button>
      </Space>
    )},
  ]

  const doneCols = [
    { title: '类型', dataIndex: 'type', key: 'type', width: 130, render: v => { const c = TYPE_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600, fontSize: 11 }}>{c.label}</Tag> } },
    { title: '标题', dataIndex: 'title', key: 'title', render: v => <Text style={{ fontWeight: 600 }}>{v}</Text> },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', render: v => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: '审批结果', dataIndex: 'result', key: 'result', render: v => { const c = STATUS_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '审批人', dataIndex: 'approver', key: 'approver', render: v => <Text style={{ color: D.textSec, fontSize: 13 }}>{v}</Text> },
    { title: '审批时间', dataIndex: 'approveTime', key: 'approveTime', render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v || '—'}</Text> },
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>审批中心</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>可配置审批流 · 多级会签 · 批量审批</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[{ title: '待我审批', value: MOCK_TODO.length, color: D.warning }, { title: '已通过', value: MOCK_DONE.filter(d => d.result === 'approved').length, color: D.success }, { title: '已驳回', value: MOCK_DONE.filter(d => d.result === 'rejected').length, color: D.danger }, { title: '审批流模板', value: WORKFLOW_TEMPLATES.length, color: D.primary }].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}><motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{s.title}</div>
          </motion.div></Col>
        ))}
      </Row>

      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: 'todo', label: <Badge count={MOCK_TODO.length} size="small" offset={[8, -2]}><span>待我审批</span></Badge> },
        { key: 'done', label: '我发起的' },
        { key: 'workflow', label: '审批流配置' },
      ]} style={{ marginBottom: 16 }} />

      {tab === 'todo' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} bodyStyle={{ padding: 0 }}>
          <Table columns={todoCols} dataSource={MOCK_TODO} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
        </Card>
      )}

      {tab === 'done' && (
        <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} bodyStyle={{ padding: 0 }}>
          <Table columns={doneCols} dataSource={MOCK_DONE} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
        </Card>
      )}

      {tab === 'workflow' && (
        <Row gutter={[16, 16]}>
          {WORKFLOW_TEMPLATES.map((wf, i) => (
            <Col xs={24} sm={12} key={wf.id}>
              <motion.div variants={va(i)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Title level={5} style={{ color: D.text, margin: 0 }}>{wf.name}</Title>
                  <Button type="primary" ghost size="small" style={{ borderRadius: 8, color: D.primary, borderColor: D.primary }}>编辑</Button>
                </div>
                <Timeline items={wf.steps.map((step, si) => ({ color: si < wf.steps.length - 1 ? D.primary : D.success, children: <Text style={{ color: D.textSec, fontSize: 13 }}>{step}</Text> }))} />
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      <Modal title={<Text style={{ fontWeight: 700 }}>审批详情</Text>} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={600}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag style={{ background: TYPE_MAP[selected.type]?.bg, color: TYPE_MAP[selected.type]?.color, border: 'none', fontWeight: 600 }}>{TYPE_MAP[selected.type]?.label}</Tag>
              <Tag style={{ background: STATUS_MAP.pending.bg, color: STATUS_MAP.pending.color, border: 'none', fontWeight: 600 }}>{STATUS_MAP.pending.label}</Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 4px 0' }}>{selected.title}</Title>
            <div style={{ display: 'flex', gap: 16, color: D.textMuted, fontSize: 12, marginBottom: 16 }}>
              <span>{selected.project}</span><span>·</span><span>{selected.applicant}</span><span>·</span><span>{selected.createTime}</span>
            </div>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(selected)} style={{ flex: 1, background: D.success, border: 'none', borderRadius: 10, height: 42 }}>通过</Button>
              <Button icon={<CloseOutlined />} onClick={() => handleReject(selected)} style={{ flex: 1, borderRadius: 10, height: 42, color: D.danger }}>驳回</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
