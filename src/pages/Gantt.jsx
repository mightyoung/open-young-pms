import React, { useState } from 'react'
import { Card, Table, Tag, Button, Select, Form, Input, Modal, Space, message, Row, Col, Typography, Progress, Tooltip, Divider, Tree } from 'antd'
import { PlusOutlined, CheckOutlined, ClockCircleOutlined, FolderOutlined, CalendarOutlined, UserOutlined, EditOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

const D = { primary: '#115cb9', bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', success: '#52c41a', warning: '#faad14', danger: '#ff4d4f' }

const MOCK_WBS = [
  { id: 'p1', name: 'J-2X高精线联调项目', start: '2026-01-01', end: '2026-06-30', progress: 78, children: [
    { id: '1.1', name: '项目准备', start: '2026-01-01', end: '2026-01-31', progress: 100, children: [
      { id: '1.1.1', name: '需求调研', start: '2026-01-01', end: '2026-01-15', progress: 100, assign: '张经理' },
      { id: '1.1.2', name: '方案设计', start: '2026-01-10', end: '2026-01-31', progress: 100, assign: '李工' },
    ]},
    { id: '1.2', name: '设备采购', start: '2026-02-01', end: '2026-03-31', progress: 100, children: [
      { id: '1.2.1', name: '供应商招标', start: '2026-02-01', end: '2026-02-28', progress: 100, assign: '王经理' },
      { id: '1.2.2', name: '合同签订', start: '2026-02-25', end: '2026-03-10', progress: 100, assign: '王经理' },
      { id: '1.2.3', name: '设备到场', start: '2026-03-10', end: '2026-03-31', progress: 100, assign: '李师傅' },
    ]},
    { id: '1.3', name: '安装调试', start: '2026-04-01', end: '2026-05-31', progress: 65, children: [
      { id: '1.3.1', name: '基础施工', start: '2026-04-01', end: '2026-04-20', progress: 100, assign: '刘工' },
      { id: '1.3.2', name: '设备安装', start: '2026-04-15', end: '2026-05-10', progress: 80, assign: '刘工' },
      { id: '1.3.3', name: '系统调试', start: '2026-05-01', end: '2026-05-31', progress: 40, assign: '李工' },
    ]},
    { id: '1.4', name: '验收交付', start: '2026-06-01', end: '2026-06-30', progress: 10, children: [
      { id: '1.4.1', name: '预验收', start: '2026-06-01', end: '2026-06-15', progress: 20, assign: '陈工' },
      { id: '1.4.2', name: '正式验收', start: '2026-06-20', end: '2026-06-30', progress: 0, assign: '张经理' },
    ]},
  ]},
]

const MOCK_TASKS = [
  { id: 1, code: 'TSK-001', name: '完成设备基础设计图', wbs: '1.3.1', status: 'done', assignee: '刘工', start: '04-01', end: '04-10', progress: 100 },
  { id: 2, code: 'TSK-002', name: '协调供应商提前发货', wbs: '1.2.3', status: 'done', assignee: '王经理', start: '03-05', end: '03-15', progress: 100 },
  { id: 3, code: 'TSK-003', name: '设备安装就位', wbs: '1.3.2', status: 'inprogress', assignee: '刘工', start: '04-18', end: '05-10', progress: 80 },
  { id: 4, code: 'TSK-004', name: '控制系统接线', wbs: '1.3.3', status: 'inprogress', assignee: '李工', start: '05-01', end: '05-20', progress: 45 },
  { id: 5, code: 'TSK-005', name: '编写调试手册', wbs: '1.3.3', status: 'pending', assignee: '李工', start: '05-10', end: '05-25', progress: 0 },
  { id: 6, code: 'TSK-006', name: '编制验收文档', wbs: '1.4.1', status: 'pending', assignee: '陈工', start: '06-01', end: '06-10', progress: 0 },
]

const GANTT_START = new Date('2026-03-01')
const GANTT_END = new Date('2026-07-01')
const TOTAL_DAYS = (GANTT_END - GANTT_START) / 86400000

function va(i = 0) { return { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } } }

function GanttBar({ task, color }) {
  const start = new Date(task.start.includes('-') && !task.start.includes('T') ? `2026-${task.start}` : task.start)
  const end = new Date(task.end.includes('-') && !task.end.includes('T') ? `2026-${task.end}` : task.end)
  const left = Math.max(0, (start - GANTT_START) / 86400000 / TOTAL_DAYS * 100)
  const width = Math.max(1, (end - start) / 86400000 / TOTAL_DAYS * 100)
  return (
    <div style={{ position: 'relative', height: 28, background: `${D.border}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}>
      <Tooltip title={`${task.name} (${task.start} ~ ${task.end})`}>
        <div style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%', background: color, borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 8px', minWidth: 20 }}>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</Text>
        </div>
      </Tooltip>
    </div>
  )
}

function GanttChart({ data }) {
  const months = []
  let cur = new Date(GANTT_START)
  while (cur < GANTT_END) {
    months.push({ label: `${cur.getMonth() + 1}月`, left: ((cur - GANTT_START) / 86400000 / TOTAL_DAYS) * 100, width: (30 / TOTAL_DAYS) * 100 })
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }
  const allTasks = []
  const flatten = (nodes, path = '') => {
    nodes.forEach(n => {
      if (n.children) { flatten(n.children, n.name) }
      else { allTasks.push(n) }
    })
  }
  flatten(data)
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 900 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${D.border}`, paddingLeft: 200, position: 'relative' }}>
          {months.map((m, i) => (
            <div key={i} style={{ position: 'absolute', left: `${m.left}%`, width: `${m.width}%`, textAlign: 'center', padding: '8px 0', borderLeft: `1px solid ${D.border}` }}>
              <Text style={{ fontSize: 11, color: D.textMuted, fontWeight: 600 }}>{m.label}</Text>
            </div>
          ))}
        </div>
        {allTasks.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 0', borderBottom: `1px solid ${D.border}20`, gap: 8 }}>
            <div style={{ width: 200, flexShrink: 0, paddingRight: 12 }}>
              <Text style={{ fontSize: 12, color: D.textSec, fontFamily: 'monospace' }}>{task.id}</Text>
              <Text style={{ fontSize: 12, color: D.text, marginLeft: 6 }}>{task.name}</Text>
            </div>
            <div style={{ flex: 1, paddingRight: 8 }}>
              <GanttBar task={task} color={task.progress === 100 ? D.success : D.primary} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Gantt() {
  const [tab, setTab] = useState('gantt')
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const STATUS_MAP = { done: { label: '已完成', bg: '#dcfce7', color: '#166534' }, inprogress: { label: '进行中', bg: '#dbeafe', color: '#1e40af' }, pending: { label: '待开始', bg: '#f3f4f6', color: '#6b7280' } }

  const taskColumns = [
    { title: '任务编码', dataIndex: 'code', key: 'code', render: v => <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>{v}</Text> },
    { title: '任务名称', dataIndex: 'name', key: 'name', render: v => <Text style={{ fontWeight: 600 }}>{v}</Text> },
    { title: 'WBS编号', dataIndex: 'wbs', key: 'wbs', render: v => <Text style={{ fontFamily: 'monospace', fontSize: 12, color: D.textSec }}>{v}</Text> },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee', render: v => <Text style={{ color: D.textSec, fontSize: 13 }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => { const c = STATUS_MAP[v]; return <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>{c.label}</Tag> } },
    { title: '计划进度', dataIndex: 'progress', key: 'progress', render: v => <Progress percent={v} size="small" strokeColor={v === 100 ? D.success : D.primary} /> },
    { title: '时间', key: 'time', render: (_, r) => <Text style={{ color: D.textMuted, fontSize: 12 }}>{r.start} ~ {r.end}</Text> },
    { title: '操作', key: 'action', render: () => <Button type="text" size="small" icon={<EditOutlined />} style={{ color: D.textMuted }} /> },
  ]

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>甘特图 / WBS分解</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>工作分解结构 · 项目进度可视化 · 任务依赖管理</Text>
      </motion.div>

      <Space style={{ marginBottom: 16 }}>
        {[['gantt', '甘特图'], ['wbs', 'WBS树'], ['tasks', '任务列表']].map(([k, label]) => (
          <Button key={k} type={tab === k ? 'primary' : 'default'} onClick={() => setTab(k)} style={{ borderRadius: 10, ...(tab === k ? { background: D.primary, border: 'none' } : {}) }}>{label}</Button>
        ))}
      </Space>

      {tab === 'gantt' && (
        <motion.div variants={va(0)} initial="hidden" animate="visible">
          <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: '16px 20px' }}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 600, color: D.text }}>J-2X高精线联调项目 — 甘特图</Text>
              <Text style={{ color: D.textMuted, fontSize: 12, marginLeft: 12 }}>2026-03-01 ~ 2026-07-01</Text>
            </div>
            <GanttChart data={MOCK_WBS} />
          </Card>
        </motion.div>
      )}

      {tab === 'wbs' && (
        <motion.div variants={va(0)} initial="hidden" animate="visible">
          <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: '16px 20px' }}>
            <Tree showLine defaultExpandAll treeData={MOCK_WBS.map(n => ({
              title: <Space><FolderOutlined style={{ color: D.primary }} /><Text style={{ fontWeight: 600 }}>{n.name}</Text><Tag style={{ marginLeft: 8, background: `${D.primary}15`, color: D.primary, border: 'none', fontSize: 11 }}>{n.progress}%</Tag></Space>,
              key: n.id,
              children: n.children?.map(c => ({
                title: <Space><FolderOutlined style={{ color: D.warning }} /><Text>{c.name}</Text><Tag style={{ marginLeft: 8, background: c.progress === 100 ? '#dcfce7' : '#dbeafe', color: c.progress === 100 ? '#166534' : '#1e40af', border: 'none', fontSize: 11 }}>{c.progress}%</Tag></Space>,
                key: c.id,
                children: c.children?.map(s => ({
                  title: <Space><ClockCircleOutlined style={{ color: D.textMuted, fontSize: 12 }} /><Text style={{ fontSize: 13 }}>{s.name}</Text><Tag style={{ background: s.progress === 100 ? '#dcfce7' : '#dbeafe', color: s.progress === 100 ? '#166534' : '#1e40af', border: 'none', fontSize: 11 }}>{s.progress}%</Tag><Text style={{ color: D.textMuted, fontSize: 11 }}>{s.assign}</Text></Space>,
                  key: s.id,
                })),
              })),
            }))} />
          </Card>
        </motion.div>
      )}

      {tab === 'tasks' && (
        <motion.div variants={va(0)} initial="hidden" animate="visible">
          <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }} headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }} bodyStyle={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }} onClick={() => setModalOpen(true)}>新建任务</Button>
            </div>
            <Table columns={taskColumns} dataSource={tasks} rowKey="id" pagination={{ pageSize: 8, showSizeChanger: false }} />
          </Card>
        </motion.div>
      )}

      <Modal title={<Text style={{ fontWeight: 700 }}>新建任务</Text>} open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} onOk={async () => { try { await form.validateFields(); message.success('任务创建成功'); setModalOpen(false); form.resetFields() } catch {} }}
        okText="创建" okButtonProps={{ style: { background: D.primary, borderRadius: 10 } }} width={560}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="任务名称" rules={[{ required: true }]}><Input placeholder="任务名称" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="assignee" label="负责人" rules={[{ required: true }]}><Input placeholder="负责人" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="wbs" label="WBS编号"><Input placeholder="如 1.3.1" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态" initialValue="pending"><Select options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="start" label="开始日期"><Input placeholder="04-01" style={{ borderRadius: 10 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="end" label="结束日期"><Input placeholder="04-10" style={{ borderRadius: 10 }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
