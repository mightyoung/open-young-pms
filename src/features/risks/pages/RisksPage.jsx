import React, { useState } from 'react'
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
  Tabs,
} from 'antd'
import { PlusOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useRisks, LEVEL_MAP, STATUS_MAP, CAT_MAP } from '../hooks/useRisks'
import ActivityTimeline from '../../../components/ActivityTimeline'
import { PageHeader } from '../../../components/PMSComponents'

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

function RiskMatrix({ risks }) {
  const grid = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null))
  risks.forEach(r => {
    const x = Math.min(4, Math.floor((r.probability - 1) / 20))
    const y = Math.min(4, Math.floor((r.impact - 1) / 20))
    grid[y][x] = r
  })
  const getBg = (y, x) => {
    if (y < 2 && x >= 3) return '#fee2e2'
    if (y < 2 || x >= 4) return '#fef3c7'
    return '#dcfce7'
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <div
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            color: D.textMuted,
            fontSize: 11,
            width: 20,
          }}
        >
          影响程度
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex' }}>
            {[20, 40, 60, 80, 100].map(v => (
              <div
                key={v}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '4px 0',
                  fontSize: 10,
                  color: D.textMuted,
                }}
              >
                {v}%
              </div>
            ))}
          </div>
          {grid.map((row, y) => (
            <div key={y} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 20, fontSize: 10, color: D.textMuted, textAlign: 'center' }}>
                {100 - y * 20}%
              </div>
              {row.map((cell, x) => {
                const bg = getBg(y, x)
                return (
                  <div
                    key={x}
                    style={{
                      flex: 1,
                      height: 50,
                      background: bg,
                      border: `1px solid ${D.border}`,
                      borderRadius: 4,
                      margin: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      minWidth: 40,
                    }}
                  >
                    {cell && (
                      <WarningOutlined
                        style={{ color: y < 2 && x >= 3 ? '#991b1b' : '#92400e', fontSize: 12 }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <div style={{ display: 'flex', paddingLeft: 20 }}>
            {[20, 40, 60, 80, 100].map(v => (
              <div
                key={v}
                style={{ flex: 1, textAlign: 'center', fontSize: 10, color: D.textMuted }}
              >
                {v}%
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: D.textMuted }}>
            概率
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
        {[
          ['#dcfce7', '低风险'],
          ['#fef3c7', '中风险'],
          ['#fee2e2', '高风险'],
        ].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 16, height: 16, background: color, borderRadius: 4 }} />
            <Text style={{ fontSize: 11, color: D.textMuted }}>{label}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RisksPage() {
  const { data, filtered, stats, setFilterLevel, setFilterStatus } = useRisks()
  const [tab, setTab] = useState('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()

  const handleCreate = async () => {
    try {
      await form.validateFields()
      message.success('风险登记成功')
      setModalOpen(false)
      form.resetFields()
    } catch {}
  }

  const columns = [
    {
      title: '风险编号',
      dataIndex: 'code',
      key: 'code',
      render: v => (
        <Text style={{ fontFamily: 'monospace', color: D.primary, fontWeight: 600, fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: '风险描述',
      dataIndex: 'title',
      key: 'title',
      render: (v, r) => (
        <div>
          <Text style={{ fontWeight: 600 }}>{v}</Text>
          <div>
            <Text style={{ color: D.textMuted, fontSize: 11 }}>{r.project}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: v => (
        <Tag
          style={{
            background: CAT_MAP[v]?.bg,
            color: CAT_MAP[v]?.color,
            border: 'none',
            fontWeight: 600,
          }}
        >
          {CAT_MAP[v]?.label}
        </Tag>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: v => (
        <Tag
          style={{
            background: LEVEL_MAP[v]?.bg,
            color: LEVEL_MAP[v]?.color,
            border: 'none',
            fontWeight: 700,
          }}
        >
          {LEVEL_MAP[v]?.label}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: v => (
        <Tag
          style={{
            background: STATUS_MAP[v]?.bg,
            color: STATUS_MAP[v]?.color,
            border: 'none',
            fontWeight: 600,
          }}
        >
          {STATUS_MAP[v]?.label}
        </Tag>
      ),
    },
    {
      title: '风险值',
      dataIndex: 'score',
      key: 'score',
      render: v => (
        <Text
          style={{ fontWeight: 700, color: v >= 50 ? D.danger : v >= 30 ? D.warning : D.success }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: '责任人',
      dataIndex: 'owner',
      key: 'owner',
      render: v => <Text style={{ fontSize: 13 }}>{v}</Text>,
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
    <div>
      <PageHeader
        title="风险管理"
        subtitle="风险识别 · 影响评估 · 监控跟踪 · 应对措施"
        icon={<WarningOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '风险总数', value: stats.total, color: D.text },
          { title: '高风险', value: stats.high, color: D.danger },
          { title: '中风险', value: stats.medium, color: D.warning },
          { title: '监控中', value: stats.monitoring, color: D.warning },
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

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: 'list', label: '风险列表' },
          { key: 'matrix', label: '风险矩阵' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'list' && (
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
              <Select
                placeholder="等级筛选"
                allowClear
                style={{ width: 130 }}
                onChange={setFilterLevel}
                options={Object.entries(LEVEL_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Select
                placeholder="状态筛选"
                allowClear
                style={{ width: 130 }}
                onChange={setFilterStatus}
                options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
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
              登记风险
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
      )}

      {tab === 'matrix' && (
        <motion.div variants={va(0)} initial="hidden" animate="visible">
          <Card
            style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
            headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
            bodyStyle={{ padding: '20px' }}
          >
            <RiskMatrix risks={data} />
          </Card>
        </motion.div>
      )}

      <Modal
        title={<Text style={{ fontWeight: 700 }}>登记风险</Text>}
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
              <Form.Item name="title" label="风险描述" rules={[{ required: true }]}>
                <Input placeholder="简要描述风险" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="风险类别">
                <Select
                  options={Object.entries(CAT_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="level" label="风险等级">
                <Select
                  options={Object.entries(LEVEL_MAP).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="风险状态">
                <Select
                  options={Object.entries(STATUS_MAP).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                  }))}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="owner" label="责任人">
                <Input placeholder="责任人" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dueDate" label="应对期限">
                <Input placeholder="2026-04-01" style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="desc" label="风险描述">
            <Input.TextArea rows={2} placeholder="详细描述风险..." style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Text style={{ fontWeight: 700 }}>风险详情</Text>}
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
                  background: CAT_MAP[selected.category]?.bg,
                  color: CAT_MAP[selected.category]?.color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {CAT_MAP[selected.category]?.label}
              </Tag>
              <Tag
                style={{
                  background: LEVEL_MAP[selected.level]?.bg,
                  color: LEVEL_MAP[selected.level]?.color,
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                {LEVEL_MAP[selected.level]?.label}
              </Tag>
              <Tag
                style={{
                  background: STATUS_MAP[selected.status]?.bg,
                  color: STATUS_MAP[selected.status]?.color,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {STATUS_MAP[selected.status]?.label}
              </Tag>
            </div>
            <Text strong style={{ fontSize: 16, color: D.text, display: 'block', marginBottom: 4 }}>
              {selected.title}
            </Text>
            <Text style={{ fontFamily: 'monospace', color: D.primary, fontSize: 12 }}>
              {selected.code}
            </Text>
            <Row gutter={[12, 12]} style={{ margin: '16px 0' }}>
              {[
                { label: '发生概率', value: `${selected.probability}%` },
                { label: '影响程度', value: `${selected.impact}%` },
                {
                  label: '风险值',
                  value: selected.score,
                  color: selected.score >= 50 ? D.danger : D.warning,
                },
                { label: '责任人', value: selected.owner },
              ].map(({ label, value, color }) => (
                <Col span={6} key={label}>
                  <div style={{ background: D.bg, borderRadius: 10, padding: '10px 14px' }}>
                    <Text style={{ fontSize: 11, color: D.textMuted, display: 'block' }}>
                      {label}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 800, color: color || D.text }}>
                      {value}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ color: D.textSec, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <ActivityTimeline
              title="应对措施"
              entries={selected.measures.map((m, i) => ({
                id: i,
                actor: selected.owner,
                action: m,
                color: i < selected.measures.length - 1 ? 'blue' : 'green',
              }))}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
