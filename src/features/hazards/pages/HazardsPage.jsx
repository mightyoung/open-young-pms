import React, { useState } from 'react'
import {
  Card,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Row,
  Col,
  Typography,
  Avatar,
  Divider,
  Timeline,
} from 'antd'
import {
  PlusOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  SendOutlined,
  DeleteOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useHazards, STATUS_MAP, TYPE_MAP, LEVEL_MAP, AUTO_DISPATCH_RULES } from '../hooks/useHazards'

const { Title, Text } = Typography
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
    visible: { opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3 } },
  }
}

function StatCard({ title, value, color }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 18px', flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: D.textMuted, marginTop: 4 }}>{title}</div>
    </div>
  )
}

function PhotoCard({ onRemove }) {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: `1px solid ${D.border}` }}>
      <div style={{ width: '100%', height: '100%', background: `${D.textMuted}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PictureOutlined style={{ fontSize: 24, color: D.textMuted }} />
      </div>
      <Button type="text" size="small" icon={<DeleteOutlined />} onClick={onRemove}
        style={{ position: 'absolute', top: 2, right: 2, color: D.danger, background: 'rgba(255,255,255,0.9)', borderRadius: 6, width: 22, height: 22, minWidth: 22 }} />
    </div>
  )
}

export default function HazardsPage() {
  const { filtered, stats, tab, setTab } = useHazards()
  const [reportOpen, setReportOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form] = Form.useForm()
  const [photos, setPhotos] = useState([])
  const [gps, setGps] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dispatchResult, setDispatchResult] = useState(null)

  const getGps = () => {
    setGpsLoading(true)
    if (!navigator.geolocation) {
      message.error('浏览器不支持定位')
      setGpsLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps(`${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`)
        setGpsLoading(false)
        message.success('定位成功')
      },
      () => {
        setGps('31.2304°N, 121.4737°E（默认）')
        setGpsLoading(false)
        message.warning('定位失败，使用默认位置')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const autoDispatch = (type, level) => {
    const rule = AUTO_DISPATCH_RULES.find(r => r.type === type && r.level === level)
    setDispatchResult(rule || null)
    return rule || null
  }

  const handleReport = async () => {
    try {
      const vals = await form.validateFields()
      setSubmitting(true)
      await new Promise(r => setTimeout(r, 1200))
      const rule = autoDispatch(vals.type, vals.level)
      message.success(
        `上报成功${rule ? `，已自动派发给 ${rule.assignee}（${rule.dept}），SLA ${rule.sla}` : '，请手动指派整改人'}`
      )
      setReportOpen(false)
      setSubmitting(false)
      form.resetFields()
      setPhotos([])
      setGps(null)
      setDispatchResult(null)
    } catch {
      setSubmitting(false)
    }
  }

  const handleRemovePhoto = idx => setPhotos(prev => prev.filter((_, i) => i !== idx))

  return (
    <div>
      <motion.div variants={va(0)} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
        <Title level={3} style={{ color: D.text, margin: 0 }}>随手拍·隐患管理</Title>
        <Text style={{ color: D.textMuted, fontSize: 13 }}>隐患上报 · GPS定位 · 自动派发 · 整改闭环</Text>
      </motion.div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {[
          { title: '全部隐患', value: stats.total, color: D.text },
          { title: '待处理', value: stats.pending, color: D.warning },
          { title: '整改中', value: stats.rectifying, color: D.danger },
          { title: '已关闭', value: stats.closed, color: D.success },
        ].map((s, i) => (
          <Col xs={12} sm={6} key={s.title}>
            <motion.div variants={va(i)} initial="hidden" animate="visible">
              <StatCard {...s} />
            </motion.div>
          </Col>
        ))}
      </Row>

      <Card style={{ border: `1px solid ${D.border}`, borderRadius: 14 }}
        headStyle={{ borderBottom: `1px solid ${D.border}`, padding: '12px 20px' }}
        bodyStyle={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <Space size={6} wrap>
            {[['all', '全部', D.text], ...Object.entries(STATUS_MAP).map(([k, v]) => [k, v.label, v.color])].map(([k, label, color]) => (
              <Button key={k} onClick={() => setTab(k)} type={tab === k ? 'primary' : 'text'} size="small"
                style={tab === k ? { background: D.primary, borderRadius: 8, border: 'none' } : { color, borderRadius: 8 }}>
                {label}
              </Button>
            ))}
          </Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 10, background: D.primary }}
            onClick={() => { form.resetFields(); setPhotos([]); setGps(null); setDispatchResult(null); setReportOpen(true) }}>
            上报隐患
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {filtered.map((item, i) => {
              const typeC = TYPE_MAP[item.type]
              const statusC = STATUS_MAP[item.status]
              const levelC = LEVEL_MAP[item.level]
              return (
                <motion.div
                  key={item.id}
                  variants={va(i)}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={() => { setSelected(item); setDetailOpen(true) }}
                  style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', borderLeft: `4px solid ${typeC.color}`, transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <Tag style={{ background: typeC.bg, color: typeC.color, border: 'none', fontWeight: 600, fontSize: 12 }}>{typeC.label}</Tag>
                        <Tag style={{ background: levelC.bg, color: levelC.color, border: 'none', fontWeight: 600, fontSize: 12 }}>{levelC.label}</Tag>
                        <Tag style={{ background: statusC.bg, color: statusC.color, border: 'none', fontWeight: 600, fontSize: 12 }}>{statusC.label}</Tag>
                        {item.photos > 0 && (
                          <Tag style={{ background: `${D.primary}15`, color: D.primary, border: 'none', fontSize: 12 }}>
                            <CameraOutlined /> {item.photos}张
                          </Tag>
                        )}
                      </div>
                      <Text style={{ fontWeight: 600, fontSize: 14, color: D.text, display: 'block', marginBottom: 6 }}>{item.title}</Text>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Text style={{ color: D.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EnvironmentOutlined /> {item.location}
                        </Text>
                        <Text style={{ color: D.textMuted, fontSize: 12 }}>{item.gps}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 16, flexShrink: 0 }}>
                      <Avatar style={{ background: D.primary, fontSize: 11, marginBottom: 4, display: 'block' }}>{item.reporter?.[0]}</Avatar>
                      <Text style={{ color: D.textMuted, fontSize: 11, display: 'block' }}>{item.createTime}</Text>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: D.textMuted }}>暂无数据</div>
          )}
        </div>
      </Card>

      <Modal title={<Text style={{ fontWeight: 700, fontSize: 16 }}>上报隐患</Text>} open={reportOpen}
        onCancel={() => setReportOpen(false)} footer={null} width={620}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        <Form form={form} layout="vertical" style={{ padding: '20px 24px' }}
          onValuesChange={c => {
            if (c.type || c.level) {
              const t = form.getFieldValue('type')
              const l = form.getFieldValue('level')
              if (t && l) autoDispatch(t, l)
            }
          }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label={<Text style={{ fontSize: 13 }}>问题类型</Text>} rules={[{ required: true }]}>
                <Select placeholder="选择类型"
                  options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                  style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="level" label={<Text style={{ fontSize: 13 }}>紧急程度</Text>} rules={[{ required: true }]}>
                <Select placeholder="选择程度"
                  options={Object.entries(LEVEL_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                  style={{ borderRadius: 10 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="title" label={<Text style={{ fontSize: 13 }}>问题标题</Text>} rules={[{ required: true, message: '请输入问题标题' }]}>
            <Input placeholder="简要描述问题" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="location" label={<Text style={{ fontSize: 13 }}>问题位置</Text>} rules={[{ required: true }]}>
            <Input placeholder="如：3号车间-A区配电房" style={{ borderRadius: 10 }} addonBefore={<EnvironmentOutlined style={{ color: D.primary }} />} />
          </Form.Item>
          <Form.Item name="description" label={<Text style={{ fontSize: 13 }}>问题描述</Text>}>
            <TextArea rows={3} placeholder="详细描述问题情况..." style={{ borderRadius: 10 }} />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: D.textSec, display: 'block', marginBottom: 8 }}>现场照片（{photos.length}/9）</Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {photos.map((_, i) => <PhotoCard key={i} onRemove={() => handleRemovePhoto(i)} />)}
              {photos.length < 9 && (
                <Upload showUploadList={false} beforeUpload={() => { if (photos.length < 9) setPhotos(p => [...p, Date.now()]); return false }}>
                  <div style={{ width: 80, height: 80, border: `2px dashed ${D.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4 }}>
                    <CameraOutlined style={{ fontSize: 20, color: D.textMuted }} />
                    <Text style={{ fontSize: 10, color: D.textMuted }}>添加照片</Text>
                  </div>
                </Upload>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: D.textSec, display: 'block', marginBottom: 8 }}>GPS定位</Text>
            <Button onClick={getGps} loading={gpsLoading} icon={<EnvironmentOutlined />} style={{ borderRadius: 10 }}>
              {gps ? gps : '点击获取当前位置'}
            </Button>
          </div>

          {dispatchResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: `${D.success}12`, border: `1px solid ${D.success}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircleOutlined style={{ color: D.success }} />
                <Text style={{ fontWeight: 700, color: D.success }}>自动派发规则匹配成功</Text>
              </div>
              <Text style={{ color: D.textSec, fontSize: 13 }}>
                派发给：<Text style={{ fontWeight: 600, color: D.text }}>{dispatchResult.assignee}</Text>（{dispatchResult.dept}），SLA：{dispatchResult.sla}
              </Text>
            </motion.div>
          )}

          <Button type="primary" block size="large" icon={<SendOutlined />} loading={submitting} onClick={handleReport}
            style={{ borderRadius: 12, background: D.primary, height: 48, fontSize: 15 }}>
            提交上报
          </Button>
        </Form>
      </Modal>

      <Modal title={<Text style={{ fontWeight: 700 }}>隐患详情</Text>} open={detailOpen}
        onCancel={() => setDetailOpen(false)} footer={null} width={640}
        styles={{ content: { borderRadius: 16, padding: 0 }, header: { borderBottom: `1px solid ${D.border}`, padding: '16px 24px', margin: 0 } }}>
        {selected && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <Tag style={{ background: TYPE_MAP[selected.type]?.bg, color: TYPE_MAP[selected.type]?.color, border: 'none', fontWeight: 600 }}>{TYPE_MAP[selected.type]?.label}</Tag>
              <Tag style={{ background: LEVEL_MAP[selected.level]?.bg, color: LEVEL_MAP[selected.level]?.color, border: 'none', fontWeight: 600 }}>{LEVEL_MAP[selected.level]?.label}</Tag>
              <Tag style={{ background: STATUS_MAP[selected.status]?.bg, color: STATUS_MAP[selected.status]?.color, border: 'none', fontWeight: 600 }}>{STATUS_MAP[selected.status]?.label}</Tag>
            </div>
            <Title level={4} style={{ color: D.text, margin: '0 0 12px 0' }}>{selected.title}</Title>
            <div style={{ display: 'flex', gap: 16, color: D.textMuted, fontSize: 13, marginBottom: 16, flexWrap: 'wrap' }}>
              <span>{selected.location}</span>
              <span>{selected.gps}</span>
            </div>
            <div style={{ background: D.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <Text style={{ color: D.textSec, fontSize: 13, lineHeight: 1.7 }}>{selected.desc}</Text>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <Title level={5} style={{ color: D.text, marginBottom: 12 }}>整改进度</Title>
            <Timeline items={[
              { color: D.success, children: <><Text style={{ fontWeight: 600 }}>{selected.reporter}</Text> <Text style={{ color: D.textMuted, fontSize: 12 }}>上报了此隐患</Text></> },
              { color: D.primary, children: <><Text style={{ fontWeight: 600 }}>{selected.assignee}</Text> <Text style={{ color: D.textMuted, fontSize: 12 }}>接单处理</Text></> },
              selected.status === 'rectifying' ? { color: D.warning, children: <><Text style={{ fontWeight: 600 }}>{selected.assignee}</Text> <Text style={{ color: D.textMuted, fontSize: 12 }}>整改中... 截止 {selected.deadline}</Text></> } : null,
              selected.status === 'closed' ? { color: D.success, children: <><Text style={{ fontWeight: 600 }}>验收通过</Text> <Text style={{ color: D.textMuted, fontSize: 12 }}>已关闭</Text></> } : null,
            ].filter(Boolean)} />
          </div>
        )}
      </Modal>
    </div>
  )
}
