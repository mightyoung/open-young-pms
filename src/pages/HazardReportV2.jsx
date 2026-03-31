import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  List,
  Avatar,
  Badge,
  Tooltip,
  Progress,
  Timeline,
  Alert,
  Tabs,
} from 'antd'
import {
  Camera,
  MapPin,
  Send,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  EnvironmentOutlined,
  Trophy,
  Star,
  Users,
  History,
  Lightbulb,
  CheckCircle,
  XCircle,
  PlayCircle,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarSeries,
  Radar,
} from 'recharts'
import { getCurrentPosition, isInsideGeofence, DEFAULT_GEOFENCES } from '../utils/geofence'

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
]

const URGENCY_LEVELS = [
  { value: 'urgent', label: '紧急', color: COLORS.danger, desc: '2小时内响应' },
  { value: 'important', label: '重要', color: COLORS.warning, desc: '24小时内响应' },
  { value: 'normal', label: '普通', color: COLORS.success, desc: '48小时内响应' },
]

const PROCESS_STEPS = [
  { title: '上报', icon: <Camera size={14} /> },
  { title: '分派', icon: <Users size={14} /> },
  { title: '处置', icon: <PlayCircle size={14} /> },
  { title: '核查', icon: <CheckCircle size={14} /> },
  { title: '归档', icon: <CheckCircle2 size={14} /> },
]

const MOCK_LEADERBOARD = [
  { rank: 1, name: '李师傅', dept: '生产车间', points: 2850, badges: 12 },
  { rank: 2, name: '王工', dept: '安全部', points: 2420, badges: 10 },
  { rank: 3, name: '张班长', dept: '设备科', points: 2100, badges: 8 },
  { rank: 4, name: '刘师傅', dept: '仓储部', points: 1850, badges: 7 },
  { rank: 5, name: '赵六', dept: '施工队', points: 1600, badges: 6 },
]

const MOCK_CASE_LIBRARY = [
  {
    id: 1,
    title: '高处作业未系安全带',
    type: 'safety',
    similarity: 0.95,
    solution: '立即停工整改，配置安全带防护用品，加强安全教育培训',
  },
  {
    id: 2,
    title: '配电箱接线不规范',
    type: 'equipment',
    similarity: 0.88,
    solution: '停电后重新接线，采用标准接线端子，加装漏电保护装置',
  },
  {
    id: 3,
    title: '消防通道堵塞',
    type: 'safety',
    similarity: 0.82,
    solution: '立即清理杂物，设置禁堆标识，加强日常巡查',
  },
]

const MOCK_DISPATCH = [
  {
    id: 1,
    title: '焊接质量不合格',
    type: 'quality',
    urgency: 'important',
    location: 'A区3号产线',
    reporter: '李师傅',
    time: '10:30',
    status: 'dispatched',
    assignees: ['王工', '张班长'],
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
    status: 'processing',
    assignees: ['李师傅'],
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
    status: 'closed',
    assignees: ['赵六'],
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
    assignees: [],
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

const PIE_DATA = [
  { name: '安全隐患', value: 18, color: COLORS.danger },
  { name: '质量缺陷', value: 12, color: COLORS.warning },
  { name: '设备故障', value: 8, color: COLORS.primary },
  { name: '工艺偏差', value: 5, color: '#8b5cf6' },
  { name: '环境问题', value: 3, color: COLORS.success },
]

export default function HazardReportV2() {
  const [activeTab, setActiveTab] = useState('report')
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [images, setImages] = useState([])
  const [location, setLocation] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geofenceStatus, setGeofenceStatus] = useState(null)
  const [currentUser] = useState({ name: '当前用户', dept: '项目管理部', points: 1200 })

  const handleLocation = useCallback(async () => {
    setGpsLoading(true)
    try {
      const pos = await getCurrentPosition()
      setLocation(pos)
      for (const fence of DEFAULT_GEOFENCES) {
        if (isInsideGeofence(pos.lat, pos.lng, fence.center, fence.radius)) {
          setGeofenceStatus({ inZone: true, zone: fence })
          message.success(`已进入电子围栏：${fence.name}`)
          return
        }
      }
      setGeofenceStatus({ inZone: false, zone: null })
      message.info('当前位置不在任何电子围栏内')
    } catch (e) {
      message.error(e.message || '定位失败')
    } finally {
      setGpsLoading(false)
    }
  }, [])

  const handleSubmit = () => {
    message.success('隐患上报成功！获得 +10 积分')
    setStep(0)
    form.resetFields()
    setImages([])
    setLocation(null)
  }

  const similarCases = MOCK_CASE_LIBRARY.filter(
    c => c.type === form.getFieldValue('hazard_type')
  ).slice(0, 2)

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 28px' }}>
      <Row gutter={24}>
        <Col span={16}>
          <Card
            title={
              <Space>
                <AlertTriangle size={16} color={COLORS.primary} />
                <span>随手拍 2.0</span>
              </Space>
            }
            extra={<Tag color={COLORS.primary}>GPS定位 + 电子围栏</Tag>}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'report', label: '隐患上报' },
                { key: 'dispatch', label: '协作处置' },
                { key: 'library', label: '经验库' },
                { key: 'rank', label: '积分榜' },
              ]}
            />

            {activeTab === 'report' && (
              <div>
                <Steps
                  current={step}
                  size="small"
                  items={PROCESS_STEPS.map(s => ({ title: s.title, icon: s.icon }))}
                  style={{ marginBottom: 24 }}
                />
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="title" label="隐患标题" rules={[{ required: true }]}>
                        <Input placeholder="简要描述隐患" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="hazard_type" label="隐患类型" rules={[{ required: true }]}>
                        <Select placeholder="选择类型">
                          {HAZARD_TYPES.map(t => (
                            <Select.Option key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="urgency" label="紧急程度">
                        <Select placeholder="选择紧急程度">
                          {URGENCY_LEVELS.map(u => (
                            <Select.Option key={u.value} value={u.value}>
                              <Space>
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: u.color,
                                  }}
                                />
                                {u.label} - {u.desc}
                              </Space>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="现场定位">
                        <Button
                          type={location ? 'primary' : 'default'}
                          icon={<MapPin size={14} />}
                          loading={gpsLoading}
                          onClick={handleLocation}
                          block
                        >
                          {location
                            ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                            : '获取 GPS 位置'}
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                  {geofenceStatus && (
                    <Alert
                      type={geofenceStatus.inZone ? 'success' : 'info'}
                      message={
                        geofenceStatus.inZone
                          ? `📍 当前位置在「${geofenceStatus.zone.name}」电子围栏内`
                          : '当前位置不在任何电子围栏内，建议确认是否在管控区域'
                      }
                      style={{ marginBottom: 16 }}
                    />
                  )}
                  <Form.Item name="description" label="详细描述">
                    <TextArea rows={3} placeholder="详细描述隐患情况..." />
                  </Form.Item>
                  <Form.Item label="现场照片">
                    <Upload
                      beforeUpload={() => false}
                      listType="picture-card"
                      multiple
                      onChange={({ fileList }) => setImages(fileList)}
                    >
                      <div>
                        <Camera size={20} />
                        <div style={{ marginTop: 8 }}>上传照片</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  {form.getFieldValue('hazard_type') && similarCases.length > 0 && (
                    <Card
                      size="small"
                      style={{
                        background: `${COLORS.primary}08`,
                        border: `1px solid ${COLORS.primary}20`,
                        marginBottom: 16,
                      }}
                    >
                      <Space>
                        <Lightbulb size={14} color={COLORS.primary} />
                        <Text strong>类似案例参考</Text>
                      </Space>
                      {similarCases.map(c => (
                        <div key={c.id} style={{ marginTop: 8 }}>
                          <Text>{c.title}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              处置方案：{c.solution}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<Send size={14} />}
                    size="large"
                    block
                  >
                    提交上报（+10积分）
                  </Button>
                </Form>
              </div>
            )}

            {activeTab === 'dispatch' && (
              <List
                dataSource={MOCK_DISPATCH}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background: HAZARD_TYPES.find(t => t.value === item.type)?.color,
                          }}
                        >
                          {item.reporter[0]}
                        </Avatar>
                      }
                      title={
                        <Space>
                          {item.title}
                          <Tag color={URGENCY_LEVELS.find(u => u.value === item.urgency)?.color}>
                            {URGENCY_LEVELS.find(u => u.value === item.urgency)?.label}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <MapPin size={12} />
                          <Text type="secondary">{item.location}</Text>
                          <Clock size={12} style={{ marginLeft: 12 }} />
                          <Text type="secondary">{item.time}</Text>
                        </Space>
                      }
                    />
                    <Space>
                      {item.assignees.map(a => (
                        <Avatar key={a} size="small" style={{ background: COLORS.primary }}>
                          {a[0]}
                        </Avatar>
                      ))}
                      <Tag
                        color={
                          item.status === 'closed'
                            ? 'success'
                            : item.status === 'processing'
                              ? 'processing'
                              : 'default'
                        }
                      >
                        {item.status === 'closed'
                          ? '已关闭'
                          : item.status === 'processing'
                            ? '处置中'
                            : '已分派'}
                      </Tag>
                    </Space>
                  </List.Item>
                )}
              />
            )}

            {activeTab === 'library' && (
              <List
                dataSource={MOCK_CASE_LIBRARY}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background: HAZARD_TYPES.find(t => t.value === item.type)?.color,
                          }}
                        >
                          <History size={14} />
                        </Avatar>
                      }
                      title={
                        <Space>
                          {item.title}
                          <Tag>相似度 {Math.round(item.similarity * 100)}%</Tag>
                        </Space>
                      }
                      description={<Text type="secondary">{item.solution}</Text>}
                    />
                  </List.Item>
                )}
              />
            )}

            {activeTab === 'rank' && (
              <div>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                    <Card
                      size="small"
                      style={{
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}aa)`,
                      }}
                    >
                      <Trophy size={24} color="#fff" />
                      <div style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginTop: 8 }}>
                        {currentUser.points}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>我的积分</div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Star size={24} color={COLORS.warning} />
                      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
                        {currentUser.points + 150}
                      </div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12 }}>本周排名 #3</div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <CheckCircle2 size={24} color={COLORS.success} />
                      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>28</div>
                      <div style={{ color: COLORS.textMuted, fontSize: 12 }}>累计发现隐患</div>
                    </Card>
                  </Col>
                </Row>
                <List
                  dataSource={MOCK_LEADERBOARD}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <Avatar
                          style={{
                            background:
                              item.rank <= 3
                                ? [COLORS.warning, COLORS.primary, '#8b5cf6'][item.rank - 1]
                                : COLORS.textMuted,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
                        </Avatar>
                        <div>
                          <Text strong>{item.name}</Text>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {item.dept}
                          </Text>
                        </div>
                      </Space>
                      <Space>
                        <Trophy size={14} color={COLORS.warning} />
                        <Text strong>{item.points.toLocaleString()}</Text>
                        <Badge count={item.badges} style={{ background: COLORS.primary }} />
                      </Space>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="隐患趋势" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.primary}
                  fill={`${COLORS.primary}30`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card title="隐患分布" size="small" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card title="电子围栏" size="small" style={{ borderRadius: 12, marginTop: 16 }}>
            {DEFAULT_GEOFENCES.map(f => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Space>
                  <MapPin size={12} color={COLORS.primary} />
                  <Text>{f.name}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  半径 {f.radius}m
                </Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
