import React, { useState, useMemo } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Divider,
  Alert,
  List,
  Tabs,
  Collapse,
} from 'antd'
import {
  Plus,
  Edit2,
  Database,
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  Eye,
  FolderOpen,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { getQualityLevel, SECURITY_LEVELS, DEFAULT_DATA_ASSETS } from '../utils/dataQuality'

const { Title, Text } = Typography
const { Search } = Input
const { Collapse: C } = Collapse

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

const CATEGORIES = ['项目数据', '安全数据', '任务数据', '人员数据', '设备数据', '文档数据']

const MOCK_DATA_DICTIONARY = [
  {
    id: 1,
    tableName: 'project_info',
    fieldName: 'project_id',
    fieldType: 'VARCHAR(36)',
    description: '项目唯一标识',
    owner: '项目管理部',
    quality: 95,
    isKey: true,
  },
  {
    id: 2,
    tableName: 'project_info',
    fieldName: 'project_name',
    fieldType: 'VARCHAR(200)',
    description: '项目名称',
    owner: '项目管理部',
    quality: 90,
    isKey: false,
  },
  {
    id: 3,
    tableName: 'hazard_record',
    fieldName: 'hazard_id',
    fieldType: 'VARCHAR(36)',
    description: '隐患记录ID',
    owner: '安全部',
    quality: 88,
    isKey: true,
  },
  {
    id: 4,
    tableName: 'hazard_record',
    fieldName: 'hazard_type',
    fieldType: 'VARCHAR(20)',
    description: '隐患类型：safety/quality/equipment/process/environment',
    owner: '安全部',
    quality: 85,
    isKey: false,
  },
  {
    id: 5,
    tableName: 'task_info',
    fieldName: 'task_id',
    fieldType: 'VARCHAR(36)',
    description: '任务唯一标识',
    owner: '调度室',
    quality: 92,
    isKey: true,
  },
  {
    id: 6,
    tableName: 'task_info',
    fieldName: 'assignee',
    fieldType: 'VARCHAR(100)',
    description: '任务负责人',
    owner: '调度室',
    quality: 78,
    isKey: false,
  },
  {
    id: 7,
    tableName: 'user_org',
    fieldName: 'user_id',
    fieldType: 'VARCHAR(36)',
    description: '用户ID',
    owner: '人力资源部',
    quality: 96,
    isKey: true,
  },
  {
    id: 8,
    tableName: 'user_org',
    fieldName: 'dept_id',
    fieldType: 'VARCHAR(36)',
    description: '部门ID',
    owner: '人力资源部',
    quality: 94,
    isKey: false,
  },
]

const ASSET_STATS = (() => {
  const assets = DEFAULT_DATA_ASSETS
  return {
    total: assets.length,
    avgQuality: Math.round(assets.reduce((acc, a) => acc + a.quality, 0) / assets.length),
    internal: assets.filter(a => a.security === 'internal').length,
    confidential: assets.filter(a => a.security === 'confidential').length,
  }
})()

const RADAR_DATA = [
  { subject: '完整性', score: 82 },
  { subject: '准确性', score: 75 },
  { subject: '及时性', score: 70 },
  { subject: '一致性', score: 78 },
  { subject: '唯一性', score: 85 },
]

export default function DataGovernanceV2() {
  const [activeTab, setActiveTab] = useState('assets')
  const [assets] = useState(DEFAULT_DATA_ASSETS)
  const [dictionary] = useState(MOCK_DATA_DICTIONARY)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showDictModal, setShowDictModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [searchText, setSearchText] = useState('')

  const filteredAssets = useMemo(
    () => assets.filter(a => a.name.includes(searchText) || a.category.includes(searchText)),
    [assets, searchText]
  )

  const assetColumns = [
    {
      title: '数据资产',
      dataIndex: 'name',
      render: (v, _r) => (
        <Space>
          <FolderOpen size={14} color={COLORS.primary} />
          {v}
        </Space>
      ),
    },
    { title: '分类', dataIndex: 'category', width: 100, render: v => <Tag>{v}</Tag> },
    { title: '责任部门', dataIndex: 'owner', width: 120 },
    {
      title: '质量评分',
      dataIndex: 'quality',
      width: 140,
      render: v => {
        const { _level, color } = getQualityLevel(v)
        return (
          <Space>
            <Progress percent={v} size="small" style={{ width: 70 }} strokeColor={color} />
            {v}分
          </Space>
        )
      },
    },
    {
      title: '安全级别',
      dataIndex: 'security',
      width: 90,
      render: v => {
        const sec = SECURITY_LEVELS.find(s => s.value === v)
        return <Tag color={sec?.color}>{sec?.label}</Tag>
      },
    },
    {
      title: '操作',
      width: 120,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={12} />}
            onClick={() => {
              setSelectedAsset(r)
              setShowAssetModal(true)
            }}
          >
            详情
          </Button>
          <Button size="small" icon={<Settings size={12} />}>
            配置
          </Button>
        </Space>
      ),
    },
  ]

  const dictColumns = [
    {
      title: '表名',
      dataIndex: 'tableName',
      width: 140,
      render: v => <Tag color={COLORS.primary}>{v}</Tag>,
    },
    {
      title: '字段名',
      dataIndex: 'fieldName',
      width: 140,
      render: (v, _r) => (
        <Space>
          {v}
          {_r.isKey && <Key size={12} color={COLORS.warning} />}
        </Space>
      ),
    },
    { title: '类型', dataIndex: 'fieldType', width: 140 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '责任部门', dataIndex: 'owner', width: 120 },
    {
      title: '质量',
      dataIndex: 'quality',
      width: 100,
      render: v => {
        const color = v >= 90 ? COLORS.success : v >= 75 ? COLORS.warning : COLORS.danger
        return <Tag color={color}>{v}分</Tag>
      },
    },
    {
      title: '操作',
      width: 100,
      render: () => (
        <Button size="small" icon={<Edit2 size={12} />}>
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 28px' }}>
      <Card
        title={
          <Space>
            <Database size={16} color={COLORS.primary} />
            <span>数据基座 2.0</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<Plus size={14} />} onClick={() => setShowAssetModal(true)}>
              新增资产
            </Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setShowDictModal(true)}>
              新增字段
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[
            {
              label: '数据资产',
              value: ASSET_STATS.total,
              icon: <Database size={20} />,
              color: COLORS.primary,
            },
            {
              label: '平均质量',
              value: `${ASSET_STATS.avgQuality}分`,
              icon: <BarChart3 size={20} />,
              color: ASSET_STATS.avgQuality >= 75 ? COLORS.success : COLORS.danger,
            },
            {
              label: '内部资产',
              value: ASSET_STATS.internal,
              icon: <Unlock size={20} />,
              color: COLORS.primary,
            },
            {
              label: '机密资产',
              value: ASSET_STATS.confidential,
              icon: <Lock size={20} />,
              color: COLORS.warning,
            },
          ].map(s => (
            <Col span={6} key={s.label}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'assets',
              label: (
                <Space>
                  <FolderOpen size={14} />
                  数据资产目录
                </Space>
              ),
            },
            {
              key: 'dict',
              label: (
                <Space>
                  <FileText size={14} />
                  数据字典
                </Space>
              ),
            },
            {
              key: 'quality',
              label: (
                <Space>
                  <BarChart3 size={14} />
                  质量雷达
                </Space>
              ),
            },
            {
              key: 'security',
              label: (
                <Space>
                  <Shield size={14} />
                  安全分级
                </Space>
              ),
            },
          ]}
        />

        {activeTab === 'assets' && (
          <div>
            <Search
              placeholder="搜索数据资产..."
              style={{ width: 300, marginBottom: 16 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Table
              dataSource={filteredAssets}
              columns={assetColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}

        {activeTab === 'dict' && (
          <div>
            <C>
              {CATEGORIES.map(cat => (
                <C.Panel
                  key={cat}
                  header={
                    <Space>
                      <FolderOpen size={14} />
                      <Text strong>{cat}</Text>
                      <Badge
                        count={
                          dictionary.filter(d => d.owner.includes(cat.replace('数据', ''))).length
                        }
                        style={{ background: COLORS.primary }}
                      />
                    </Space>
                  }
                >
                  <Table
                    dataSource={dictionary.filter(
                      d =>
                        d.owner.includes(cat.replace('数据', '')) ||
                        (cat === '项目数据' && d.tableName === 'project_info')
                    )}
                    columns={dictColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </C.Panel>
              ))}
            </C>
          </div>
        )}

        {activeTab === 'quality' && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="数据质量雷达">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke={COLORS.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <Radar
                      name="质量"
                      dataKey="score"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="质量分布">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={[
                      { range: '90-100', count: 3, color: COLORS.success },
                      { range: '75-89', count: 2, color: COLORS.primary },
                      { range: '60-74', count: 1, color: COLORS.warning },
                      { range: '<60', count: 0, color: COLORS.danger },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Bar dataKey="count">
                      {[0, 1, 2, 3].map(i => (
                        <Cell
                          key={i}
                          fill={[COLORS.success, COLORS.primary, COLORS.warning, COLORS.danger][i]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={24}>
              <Card size="small" title="质量不达标资产" style={{ marginTop: 16 }}>
                <List
                  dataSource={assets.filter(a => a.quality < 75)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AlertTriangle size={16} color={COLORS.danger} />}
                        title={
                          <Space>
                            {item.name}
                            <Tag color="error">质量 {item.quality}分</Tag>
                          </Space>
                        }
                        description={item.owner}
                      />
                      <Button size="small" type="primary">
                        优化建议
                      </Button>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'security' && (
          <div>
            <Alert
              message="安全分级配置"
              description="数据资产按敏感程度分为公开、内部、机密、绝密四个级别，不同级别对应不同的访问权限和使用规范。"
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Row gutter={16}>
              {SECURITY_LEVELS.map(sec => (
                <Col span={6} key={sec.value}>
                  <Card
                    size="small"
                    style={{ textAlign: 'center', borderTop: `3px solid ${sec.color}` }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 700, color: sec.color }}>
                      {assets.filter(a => a.security === sec.value).length}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{sec.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                      {sec.desc}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Tag color={sec.color}>
                        {assets.filter(a => a.security === sec.value).length} 个资产
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Card size="small" title="资产安全级别列表" style={{ marginTop: 16 }}>
              <Table
                dataSource={assets}
                columns={[
                  { title: '资产名称', dataIndex: 'name' },
                  { title: '分类', dataIndex: 'category' },
                  { title: '责任部门', dataIndex: 'owner' },
                  {
                    title: '安全级别',
                    dataIndex: 'security',
                    render: v => {
                      const sec = SECURITY_LEVELS.find(s => s.value === v)
                      return <Tag color={sec?.color}>{sec?.label}</Tag>
                    },
                  },
                  {
                    title: '操作',
                    render: () => (
                      <Button size="small" icon={<Edit2 size={12} />}>
                        调整
                      </Button>
                    ),
                  },
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        )}
      </Card>

      <Modal
        title="数据资产详情"
        open={showAssetModal}
        onCancel={() => setShowAssetModal(false)}
        footer={<Button onClick={() => setShowAssetModal(false)}>关闭</Button>}
        width={600}
      >
        {selectedAsset && (
          <div>
            <Row gutter={[12, 12]}>
              {[
                { label: '资产名称', value: selectedAsset.name },
                { label: '数据分类', value: selectedAsset.category },
                { label: '责任部门', value: selectedAsset.owner },
                {
                  label: '安全级别',
                  value: SECURITY_LEVELS.find(s => s.value === selectedAsset.security)?.label,
                },
              ].map(item => (
                <Col span={12} key={item.label}>
                  <div style={{ background: COLORS.bg, borderRadius: 8, padding: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.label}
                    </Text>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{item.value}</div>
                  </div>
                </Col>
              ))}
            </Row>
            <Divider />
            <Title level={5}>质量评分</Title>
            <Row gutter={[8, 8]}>
              {[
                { label: '完整性', value: selectedAsset.completeness },
                { label: '准确性', value: selectedAsset.accuracy },
                { label: '及时性', value: selectedAsset.timeliness },
                { label: '一致性', value: selectedAsset.consistency },
                { label: '唯一性', value: selectedAsset.uniqueness },
              ].map(item => (
                <Col span={8} key={item.label}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress
                      type="circle"
                      percent={item.value}
                      size={60}
                      strokeColor={
                        item.value >= 80
                          ? COLORS.success
                          : item.value >= 60
                            ? COLORS.warning
                            : COLORS.danger
                      }
                    />
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                      {item.label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      <Modal
        title="新增数据字段"
        open={showDictModal}
        onCancel={() => setShowDictModal(false)}
        footer={
          <Space>
            <Button onClick={() => setShowDictModal(false)}>取消</Button>
            <Button type="primary">保存</Button>
          </Space>
        }
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="所属表">
            <Select placeholder="选择数据表">
              {['project_info', 'hazard_record', 'task_info', 'user_org'].map(t => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="字段名称">
            <Input placeholder="输入字段名称" />
          </Form.Item>
          <Form.Item label="字段类型">
            <Select placeholder="选择字段类型">
              {['VARCHAR(36)', 'VARCHAR(100)', 'VARCHAR(200)', 'INT', 'DATETIME', 'TEXT'].map(t => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="字段描述">
            <Input.TextArea rows={2} placeholder="描述字段含义" />
          </Form.Item>
          <Form.Item label="责任部门">
            <Select placeholder="选择责任部门">
              {CATEGORIES.map(c => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
