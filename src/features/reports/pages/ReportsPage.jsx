import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Typography,
} from 'antd'
import { PlusOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useReports, REPORT_TYPES, STATUS_MAP } from '../hooks/useReports'
import { PageHeader } from '../../../components/PMSComponents'

const { Text } = Typography
const { TextArea } = Input

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

export default function ReportsPage() {
  const { reports, stats } = useReports()
  const [tab, setTab] = useState('all')
  const [writeOpen, setWriteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const filtered = tab === 'all' ? reports : reports.filter(r => r.type === tab)

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      message.success('报告已提交，等待审批')
      setWriteOpen(false)
      form.resetFields()
    } catch {}
  }

  const columns = [
    {
      title: '报告标题',
      dataIndex: 'title',
      key: 'title',
      render: (v, r) => (
        <div>
          <Tag
            style={{
              background: REPORT_TYPES[r.type].bg,
              color: REPORT_TYPES[r.type].color,
              border: 'none',
              fontWeight: 600,
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            {REPORT_TYPES[r.type].label}
          </Tag>
          <div>
            <a
              onClick={() => {
                setSelected(r)
                setDetailOpen(true)
              }}
              style={{ fontWeight: 600, color: D.primary }}
            >
              {v}
            </a>
          </div>
        </div>
      ),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: '填报人',
      dataIndex: 'author',
      key: 'author',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const c = STATUS_MAP[v]
        return (
          <Tag style={{ background: c.bg, color: c.color, border: 'none', fontWeight: 600 }}>
            {c.label}
          </Tag>
        )
      },
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: v => <Text style={{ color: D.textMuted, fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelected(r)
            setDetailOpen(true)
          }}
          style={{ color: D.primary }}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="报告中心"
        subtitle="日/周/月报填写 · 阶梯自动化 · 审批流转"
        icon={<FileTextOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '全部报告', value: stats.total, color: D.text },
          { title: '待审批', value: stats.pending, color: D.warning },
          { title: '已通过', value: stats.approved, color: D.success },
        ].map((s, i) => (
          <Col xs={12} sm={8} key={s.title}>
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
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space size={6}>
            {[['all', '全部'], ...Object.entries(REPORT_TYPES).map(([k, v]) => [k, v.label])].map(
              ([k, label]) => (
                <Button
                  key={k}
                  onClick={() => setTab(k)}
                  type={tab === k ? 'primary' : 'text'}
                  size="small"
                  style={
                    tab === k
                      ? { background: D.primary, border: 'none', borderRadius: 8 }
                      : { color: D.textSec, borderRadius: 8 }
                  }
                >
                  {label}
                </Button>
              )
            )}
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: 10, background: D.primary }}
            onClick={() => {
              setWriteOpen(true)
              form.resetFields()
            }}
          >
            填写报告
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>填写报告</Text>}
        open={writeOpen}
        onCancel={() => {
          setWriteOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={640}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}>
          <Form.Item name="type" label="报告类型" rules={[{ required: true }]}>
            <Space>
              {Object.entries(REPORT_TYPES).map(([k, v]) => (
                <Button
                  key={k}
                  style={
                    form.getFieldValue('type') === k
                      ? { background: v.bg, border: `1px solid ${v.color}`, color: v.color }
                      : {}
                  }
                >
                  {v.label}
                </Button>
              ))}
            </Space>
          </Form.Item>
          <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="content" label="报告内容" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入报告内容..." />
          </Form.Item>
          <Form.Item name="attach" label="附件">
            <Input placeholder="上传附件（可选）" />
          </Form.Item>
          <Button
            type="primary"
            style={{ background: D.primary, borderRadius: 10 }}
            onClick={handleSubmit}
          >
            提交报告
          </Button>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>报告详情</Text>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={600}
        styles={{
          content: { borderRadius: 16, padding: 0 },
          header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 },
        }}
      >
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <Text strong style={{ fontSize: 16, color: D.text, display: 'block' }}>
                  {selected.title}
                </Text>
                <Text style={{ color: D.textMuted, fontSize: 12 }}>
                  {selected.createTime} · {selected.author}
                </Text>
              </div>
              <Tag
                style={{
                  background: REPORT_TYPES[selected.type].bg,
                  color: REPORT_TYPES[selected.type].color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {REPORT_TYPES[selected.type].label}
              </Tag>
            </div>
            <div
              style={{ background: D.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}
            >
              <Text style={{ color: D.textMuted, fontSize: 12 }}>所属项目</Text>
              <div style={{ color: D.text, fontWeight: 600 }}>{selected.project}</div>
            </div>
            <div
              style={{ background: D.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}
            >
              <Text style={{ color: D.textMuted, fontSize: 12 }}>填报人</Text>
              <div style={{ color: D.text, fontWeight: 600 }}>
                {selected.author} · {selected.dept}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: D.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>
                报告内容
              </Text>
              <div style={{ color: D.text, lineHeight: 1.6 }}>{selected.progress}</div>
            </div>
            <Row gutter={[8, 8]}>
              {Object.entries(selected.stats).map(([k, v]) => (
                <Col span={8} key={k}>
                  <div
                    style={{
                      background: D.bg,
                      borderRadius: 10,
                      padding: '10px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 800, color: D.primary }}>{v}</div>
                    <Text style={{ fontSize: 11, color: D.textMuted }}>
                      {{ completed: '完成', pending: '进行中', issues: '问题' }[k] || k}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}
