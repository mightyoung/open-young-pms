import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  Modal,
  message,
  Steps,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Radio,
} from 'antd'
import {
  Camera,
  MapPin,
  Send,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ExclamationCircle,
  EnvironmentOutlined,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const COLORS = {
  primary: '#115cb9',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textMuted: '#8c8c8c',
}

const HAZARD_TYPES = [
  { value: 'safety', label: '安全隐患', color: COLORS.danger, icon: '🔴' },
  { value: 'quality', label: '质量缺陷', color: COLORS.warning, icon: '🟡' },
  { value: 'equipment', label: '设备故障', color: COLORS.primary, icon: '🔧' },
  { value: 'process', label: '工艺偏差', color: '#8b5cf6', icon: '⚙️' },
  { value: 'environment', label: '环境问题', color: COLORS.success, icon: '🌿' },
  { value: 'schedule', label: '进度异常', color: COLORS.textMuted, icon: '⏰' },
]

const URGENCY_LEVELS = [
  { value: 'urgent', label: '紧急', color: COLORS.danger, desc: '2小时内响应' },
  { value: 'important', label: '重要', color: COLORS.warning, desc: '24小时内响应' },
  { value: 'normal', label: '普通', color: COLORS.success, desc: '48小时内响应' },
]

const DISPATCH_RULES = [
  { type: 'safety+urgent', assignee: '安全主管', action: '立即处理' },
  { type: 'safety+important', assignee: '科室负责人', action: '当日处理' },
  { type: 'quality', assignee: '质量部负责人', action: '按流程处理' },
  { type: 'equipment', assignee: '设备管理科', action: '紧急维修' },
  { type: 'environment', assignee: '环保专员', action: '现场处置' },
]

const MOCK_REPORTS = [
  {
    id: 1,
    title: '焊接质量不合格',
    type: 'quality',
    urgency: 'important',
    location: 'A区3号产线',
    reporter: '李师傅',
    time: '10:30',
    status: 'pending',
    images: 2,
  },
  {
    id: 2,
    title: '高空作业未系安全带',
    type: 'safety',
    urgency: 'urgent',
    location: 'B区施工现场',
    reporter: '王工',
    time: '09:15',
    status: 'dispatched',
    images: 1,
  },
  {
    id: 3,
    title: '变频器参数异常',
    type: 'equipment',
    urgency: 'important',
    location: 'C区配电室',
    reporter: '张师傅',
    time: '昨天',
    status: 'processing',
    images: 3,
  },
  {
    id: 4,
    title: '废液排放异常',
    type: 'environment',
    urgency: 'normal',
    location: '污水处理站',
    reporter: '刘师傅',
    time: '2天前',
    status: 'closed',
    images: 1,
  },
]

const TREND_DATA = [
  { name: '周一', value: 5 },
  { name: '周二', value: 8 },
  { name: '周三', value: 6 },
  { name: '周四', value: 12 },
  { name: '周五', value: 9 },
  { name: '周六', value: 3 },
  { name: '周日', value: 2 },
]

const PIE_DATA = HAZARD_TYPES.map(t => ({
  name: t.label,
  value: MOCK_REPORTS.filter(r => r.type === t.value).length * 3 + Math.floor(Math.random() * 5),
  color: t.color,
}))

export default function HazardReportEnhanced() {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [images, setImages] = useState([])
  const [location, setLocation] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          message.success('定位成功')
        },
        () => message.error('定位失败，请检查权限')
      )
    } else {
      message.error('浏览器不支持定位')
    }
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Submit:', { ...values, images, location })
      setShowSuccess(true)
      form.resetFields()
      setImages([])
      setLocation(null)
      setStep(0)
    })
  }

  const getTypeInfo = type => HAZARD_TYPES.find(t => t.value === type) || {}
  const getUrgencyInfo = level => URGENCY_LEVELS.find(u => u.value === level) || {}

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
          随手拍上报
        </Title>
        <Text style={{ color: COLORS.textMuted }}>安全隐患 · 质量问题 · 设备故障 · 工艺偏差</Text>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <Steps
              current={step}
              onChange={setStep}
              items={[
                { title: '选择类型' },
                { title: '填写信息' },
                { title: '拍照上传' },
                { title: '确认提交' },
              ]}
            />
          </Card>

          <Card style={{ borderRadius: 12 }}>
            {step === 0 && (
              <div>
                <Title level={5}>请选择问题类型</Title>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {HAZARD_TYPES.map(t => (
                    <div
                      key={t.value}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: `2px solid ${COLORS.border}`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontWeight: 600, color: COLORS.text }}>{t.label}</div>
                    </div>
                  ))}
                </div>
                <Button
                  type="primary"
                  block
                  style={{ marginTop: 24, height: 44 }}
                  onClick={() => setStep(1)}
                >
                  下一步
                </Button>
              </div>
            )}

            {step === 1 && (
              <Form form={form} layout="vertical">
                <Form.Item name="type" label="问题类型" rules={[{ required: true }]}>
                  <Select placeholder="请选择问题类型">
                    {HAZARD_TYPES.map(t => (
                      <Select.Option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="urgency" label="紧急程度" rules={[{ required: true }]}>
                  <Radio.Group>
                    {URGENCY_LEVELS.map(u => (
                      <Radio.Button key={u.value} value={u.value}>
                        <span style={{ color: u.color }}>{u.label}</span> - {u.desc}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="title" label="问题标题" rules={[{ required: true }]}>
                  <Input placeholder="简要描述问题" />
                </Form.Item>
                <Form.Item name="description" label="详细描述">
                  <TextArea rows={3} placeholder="详细描述问题情况..." />
                </Form.Item>
                <Form.Item name="location" label="发生位置">
                  <Input
                    addonAfter={
                      <Button icon={<EnvironmentOutlined />} onClick={handleLocation}>
                        GPS定位
                      </Button>
                    }
                    placeholder="手动输入位置"
                  />
                </Form.Item>
                {location && (
                  <Tag color="green" icon={<MapPin size={12} />}>
                    已定位: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </Tag>
                )}
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button onClick={() => setStep(0)}>上一步</Button>
                    <Button type="primary" onClick={() => setStep(2)}>
                      下一步
                    </Button>
                  </Space>
                </div>
              </Form>
            )}

            {step === 2 && (
              <div>
                <Title level={5}>现场照片（最多3张）</Title>
                <Upload
                  action="/upload"
                  listType="picture-card"
                  fileList={images}
                  onChange={({ fileList }) => setImages(fileList.slice(-3))}
                  maxCount={3}
                >
                  {images.length < 3 && (
                    <div style={{ padding: 20 }}>
                      <Camera size={24} />
                      <div style={{ marginTop: 8 }}>点击拍照</div>
                    </div>
                  )}
                </Upload>
                <Paragraph type="secondary" style={{ marginTop: 12 }}>
                  <Camera size={14} /> 照片将自动压缩（最大2MB）
                </Paragraph>
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button onClick={() => setStep(1)}>上一步</Button>
                    <Button type="primary" onClick={() => setStep(3)}>
                      下一步
                    </Button>
                  </Space>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <Title level={5}>确认提交</Title>
                <Card style={{ background: COLORS.bg, marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary">问题类型</Text>
                        <div>
                          <Tag color={getTypeInfo(form.getFieldValue('type'))?.color}>
                            {getTypeInfo(form.getFieldValue('type'))?.label}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary">紧急程度</Text>
                        <div>
                          <Tag color={getUrgencyInfo(form.getFieldValue('urgency'))?.color}>
                            {getUrgencyInfo(form.getFieldValue('urgency'))?.label}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary">问题标题</Text>
                        <div style={{ fontWeight: 500 }}>{form.getFieldValue('title') || '-'}</div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <Text type="secondary">自动派发给</Text>
                        <div style={{ fontWeight: 500, color: COLORS.primary }}>安全主管</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
                <div style={{ marginTop: 24 }}>
                  <Space>
                    <Button onClick={() => setStep(2)}>上一步</Button>
                    <Button type="primary" icon={<Send size={14} />} onClick={handleSubmit}>
                      确认提交
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="自动派发规则" style={{ borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
              💡 当隐患满足条件时，自动指派给指定负责人
            </div>
            {DISPATCH_RULES.map((rule, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 8,
                  background: `${COLORS.primary}08`,
                  border: `1px solid ${COLORS.primary}20`,
                }}
              >
                <div style={{ fontSize: 12, color: COLORS.text }}>类型: {rule.type}</div>
                <div style={{ fontSize: 12, color: COLORS.primary }}>→ {rule.assignee}</div>
              </div>
            ))}
          </Card>

          <Card title="本月上报统计" style={{ borderRadius: 12, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.primary}
                  fill={`${COLORS.primary}20`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="问题类型分布" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              {PIE_DATA.map((p, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{p.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        open={showSuccess}
        onCancel={() => setShowSuccess(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setShowSuccess(false)}>
            好的
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <CheckCircle2 size={64} color={COLORS.success} />
          <Title level={4} style={{ marginTop: 16 }}>
            提交成功！
          </Title>
          <Text type="secondary">您的隐患已提交，系统将自动派发给负责人处理</Text>
        </div>
      </Modal>
    </div>
  )
}
