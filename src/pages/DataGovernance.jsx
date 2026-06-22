import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import {
  Card,
  Table,
  Tag,
  Button,
  Tabs,
  Progress,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Statistic,
  Row,
  Col,
  Alert,
  Divider,
  Typography,
  message,
} from 'antd'
import {
  DatabaseOutlined,
  SafetyCertificateOutlined,
  NodeIndexOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { api } from '../api'

const { Text, Title } = Typography

// ── 配色 ───────────────────────────────────────────────────
const C = {
  success: colors.success,
  warning: colors.warning,
  error: colors.danger,
  info: colors.accent,
  bg: colors.bg.base,
  card: colors.bg.page,
  border: colors.bg.card,
  text: colors.text.primary,
  muted: colors.text.muted,
}

const LEVEL_COLOR = { critical: colors.danger, warning: colors.warning, info: colors.accent }

// ── 工具函数 ───────────────────────────────────────────────
const scoreColor = s => {
  if (s >= 90) return C.success
  if (s >= 70) return C.warning
  return C.error
}

// ── 业务管理视图 ──────────────────────────────────────────
function BusinessView() {
  const [tab, setTab] = useState('users')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const load = async (entity, p = 1) => {
    setLoading(true)
    try {
      const res = await api.get(`/data/master/${entity}?page=${p}&page_size=20`)
      const items = res?.items || []
      setData(items)
      setTotal(res?.total || items.length)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(tab, page)
  }, [tab, page])

  const userCols = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: t => <Text style={{ color: C.text }}>{t}</Text>,
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
      render: t => <Text style={{ color: C.text }}>{t}</Text>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: t => <Text style={{ color: C.muted, fontSize: 12 }}>{t || '-'}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color={s === 'active' ? 'green' : 'default'}>{s}</Tag>,
    },
  ]

  const projCols = [
    {
      title: '项目编号',
      dataIndex: 'project_code',
      key: 'project_code',
      render: t => <Text style={{ color: C.info }}>{t}</Text>,
    },
    {
      title: '项目名称',
      dataIndex: 'project_name',
      key: 'project_name',
      render: t => <Text style={{ color: C.text }}>{t}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color={s === 'active' ? 'blue' : 'default'}>{s}</Tag>,
    },
  ]

  const deptCols = [
    {
      title: '部门编号',
      dataIndex: 'dept_code',
      key: 'dept_code',
      render: t => <Text style={{ color: C.info }}>{t}</Text>,
    },
    {
      title: '部门名称',
      dataIndex: 'dept_name',
      key: 'dept_name',
      render: t => <Text style={{ color: C.text }}>{t}</Text>,
    },
    {
      title: '上级部门',
      dataIndex: 'parent_id',
      key: 'parent_id',
      render: t => (
        <Text style={{ color: C.muted, fontSize: 12 }}>{t ? t.substring(0, 8) + '...' : '-'}</Text>
      ),
    },
  ]

  const cols = tab === 'users' ? userCols : tab === 'projects' ? projCols : deptCols

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Tabs
          activeKey={tab}
          onChange={t => {
            setTab(t)
            setPage(1)
          }}
          items={[
            { key: 'users', label: '👤 用户主数据' },
            { key: 'projects', label: '📁 项目主数据' },
            { key: 'departments', label: '🏢 部门主数据' },
          ]}
          style={{ flex: 1 }}
        />
      </div>
      <Card style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <Table
          dataSource={data}
          columns={cols}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: t => `共 ${t} 条`,
            onChange: p => load(tab, p),
          }}
        />
      </Card>

      <Modal
        title={<Text style={{ color: C.text }}>{editing ? '编辑' : '新增'}数据</Text>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        styles={{ body: { background: C.bg } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {tab === 'users' && (
            <>
              <Form.Item
                name="username"
                label={<Text style={{ color: C.muted }}>用户名</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="full_name"
                label={<Text style={{ color: C.muted }}>姓名</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="email" label={<Text style={{ color: C.muted }}>邮箱</Text>}>
                <Input />
              </Form.Item>
            </>
          )}
          {tab === 'projects' && (
            <>
              <Form.Item
                name="project_code"
                label={<Text style={{ color: C.muted }}>项目编号</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="project_name"
                label={<Text style={{ color: C.muted }}>项目名称</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
          {tab === 'departments' && (
            <>
              <Form.Item
                name="dept_code"
                label={<Text style={{ color: C.muted }}>部门编码</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="dept_name"
                label={<Text style={{ color: C.muted }}>部门名称</Text>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

// ── 数据治理视图 ──────────────────────────────────────────
function GovernanceView() {
  const [tab, setTab] = useState('score')
  const [qualityScore, setQualityScore] = useState(null)
  const [rules, setRules] = useState({})
  const [lineage, setLineage] = useState(null)
  const [entities, setEntities] = useState([])
  const [sensitive, setSensitive] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [fields, setFields] = useState([])
  const [_maskValue, setMaskValue] = useState('')
  const [maskResult, setMaskResult] = useState(null)
  const [_validateData, setValidateData] = useState(null)
  const [validateResult, setValidateResult] = useState(null)

  const loadScore = async () => {
    const res = await api.get('/data/quality/score')
    setQualityScore(res?.overall_score !== undefined ? res : null)
  }

  const loadRules = async () => {
    const res = await api.get('/data/quality/rules')
    setRules(res?.entities || {})
  }

  const loadEntities = async () => {
    const res = await api.get('/data/metadata/entities')
    setEntities(res?.items || [])
  }

  const loadSensitive = async () => {
    const res = await api.get('/data/security/sensitive')
    setSensitive(res?.items || [])
  }

  const loadLineage = async (entity = 'hazards') => {
    const res = await api.get(`/data/lineage/${entity}`)
    setLineage(res)
  }

  const loadFields = async entity => {
    const res = await api.get(`/data/metadata/fields/${entity}`)
    setFields(res?.fields || [])
    setSelectedEntity(entity)
  }

  useEffect(() => {
    if (tab === 'score') loadScore()
    if (tab === 'rules') loadRules()
    if (tab === 'lineage') loadLineage()
    if (tab === 'metadata') {
      loadEntities()
      if (selectedEntity) loadFields(selectedEntity)
    }
    if (tab === 'security') loadSensitive()
  }, [tab, selectedEntity])

  // 质量评分卡片
  const renderScoreCard = () => {
    if (!qualityScore)
      return (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Button loading onClick={loadScore}>
            加载评分
          </Button>
        </div>
      )
    const score = qualityScore.overall_score || 0
    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card
              style={{ background: C.card, border: `1px solid ${C.border}`, textAlign: 'center' }}
            >
              <Statistic
                value={score}
                suffix="/ 100"
                valueStyle={{ color: scoreColor(score), fontSize: 36, fontWeight: 700 }}
              />
              <Text style={{ color: C.muted, fontSize: 13 }}>综合质量评分</Text>
              <Progress
                percent={score}
                showInfo={false}
                strokeColor={scoreColor(score)}
                trailColor={C.border}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col span={16}>
            <Card style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <Title level={5} style={{ color: C.text, marginBottom: 16 }}>
                各实体评分
              </Title>
              {Object.entries(qualityScore.entity_scores || {}).map(([entity, s]) => (
                <div
                  key={entity}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}
                >
                  <Text style={{ color: C.muted, width: 100, fontSize: 13 }}>{entity}</Text>
                  <Progress
                    percent={s}
                    size="small"
                    strokeColor={scoreColor(s)}
                    trailColor={C.border}
                    style={{ flex: 1 }}
                  />
                  <Text style={{ color: scoreColor(s), fontWeight: 600, width: 40 }}>{s}</Text>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
        <Button icon={<ReloadOutlined />} onClick={loadScore} size="small">
          刷新评分
        </Button>
      </div>
    )
  }

  // 质量规则
  const renderRules = () => {
    return (
      <div>
        {Object.entries(rules).map(([entity, entityRules]) => (
          <Card
            key={entity}
            title={<Text style={{ color: C.text }}>{entity}</Text>}
            style={{ background: C.card, border: `1px solid ${C.border}`, marginBottom: 12 }}
            extra={<Tag>{entityRules.length} 条规则</Tag>}
          >
            {entityRules.map(rule => (
              <div
                key={rule.rule_id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <Tag
                  color={LEVEL_COLOR[rule.severity] || 'default'}
                  style={{ minWidth: 60, textAlign: 'center' }}
                >
                  {rule.severity === 'critical'
                    ? '🔴 严重'
                    : rule.severity === 'warning'
                      ? '🟡 警告'
                      : '🔵 提示'}
                </Tag>
                <div style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 13 }}>{rule.message}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: C.muted, fontSize: 11 }}>
                      字段：{rule.field} | 类型：{rule.rule_type}
                    </Text>
                  </div>
                </div>
                <Text style={{ color: C.muted, fontSize: 11, fontFamily: 'monospace' }}>
                  {rule.rule_id}
                </Text>
              </div>
            ))}
          </Card>
        ))}
      </div>
    )
  }

  // 数据血缘
  const renderLineage = () => {
    const entities2 = ['users', 'projects', 'departments', 'hazards', 'reports']
    return (
      <div>
        <Card style={{ background: C.card, border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <Space style={{ marginBottom: 16 }}>
            <Text style={{ color: C.muted }}>选择实体：</Text>
            {entities2.map(e => (
              <Button
                key={e}
                type={lineage?.entity === e ? 'primary' : 'default'}
                size="small"
                onClick={() => loadLineage(e)}
              >
                {e}
              </Button>
            ))}
          </Space>
          {lineage && (
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5} style={{ color: C.success }}>
                  📥 上游数据（被谁引用）
                </Title>
                {lineage.upstream?.length === 0 && (
                  <Text style={{ color: C.muted }}>无上游数据</Text>
                )}
                {lineage.upstream?.map((l, i) => (
                  <Card
                    key={i}
                    size="small"
                    style={{
                      background: '#0f0f0f',
                      border: `1px solid ${C.border}`,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: C.info, fontSize: 12 }}>
                      {l.source}.{l.source_field}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 11, display: 'block' }}>
                      {l.meaning}
                    </Text>
                    <Text style={{ color: C.text, fontSize: 11 }}>
                      → {l.target}.{l.target_field}
                    </Text>
                  </Card>
                ))}
              </Col>
              <Col span={12}>
                <Title level={5} style={{ color: C.error }}>
                  📤 下游数据（引用了谁）
                </Title>
                {lineage.downstream?.length === 0 && (
                  <Text style={{ color: C.muted }}>无下游数据</Text>
                )}
                {lineage.downstream?.map((l, i) => (
                  <Card
                    key={i}
                    size="small"
                    style={{
                      background: '#0f0f0f',
                      border: `1px solid ${C.border}`,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: C.text, fontSize: 12 }}>
                      {l.source}.{l.source_field}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 11, display: 'block' }}>
                      {l.meaning}
                    </Text>
                    <Text style={{ color: C.warning, fontSize: 11 }}>
                      → {l.target}.{l.target_field}
                    </Text>
                  </Card>
                ))}
              </Col>
            </Row>
          )}
        </Card>
      </div>
    )
  }

  // 元数据浏览
  const renderMetadata = () => (
    <div>
      <Row gutter={12}>
        <Col span={6}>
          <Card style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Title level={5} style={{ color: C.text, marginBottom: 12 }}>
              数据实体
            </Title>
            {entities.map(e => (
              <div
                key={e.entity}
                onClick={() => loadFields(e.entity)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  marginBottom: 4,
                  cursor: 'pointer',
                  background: selectedEntity === e.entity ? `${C.info}20` : 'transparent',
                  border: `1px solid ${selectedEntity === e.entity ? C.info : 'transparent'}`,
                }}
              >
                <Text
                  style={{ color: selectedEntity === e.entity ? C.info : C.text, fontSize: 13 }}
                >
                  {e.display_name}
                </Text>
                <Text style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>
                  {e.field_count} 字段
                </Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={18}>
          <Card style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {selectedEntity ? (
              <>
                <Title level={5} style={{ color: C.text, marginBottom: 16 }}>
                  {entities.find(e => e.entity === selectedEntity)?.display_name} — 字段详情
                </Title>
                <Table
                  dataSource={fields}
                  rowKey="field"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: '字段名',
                      dataIndex: 'field',
                      key: 'field',
                      render: t => (
                        <Text style={{ color: C.info, fontFamily: 'monospace', fontSize: 12 }}>
                          {t}
                        </Text>
                      ),
                    },
                    {
                      title: '中文名',
                      dataIndex: 'name',
                      key: 'name',
                      render: t => <Text style={{ color: C.text }}>{t}</Text>,
                    },
                    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag>{t}</Tag> },
                    {
                      title: '约束',
                      key: 'constraints',
                      render: (_, r) => (
                        <Space>
                          {r.pk && <Tag color="purple">PK</Tag>}
                          {!r.nullable && <Tag color="red">NOT NULL</Tag>}
                          {r.unique && <Tag color="blue">UNIQUE</Tag>}
                          {r.fk && <Tag color="green">FK</Tag>}
                        </Space>
                      ),
                    },
                  ]}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <DatabaseOutlined style={{ fontSize: 48, color: C.muted }} />
                <Text style={{ color: C.muted, display: 'block', marginTop: 16 }}>
                  点击左侧实体查看字段详情
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )

  // 数据安全
  const renderSecurity = () => (
    <div>
      <Row gutter={12}>
        <Col span={12}>
          <Card
            title={<Text style={{ color: C.text }}>🔒 敏感字段</Text>}
            style={{ background: C.card, border: `1px solid ${C.border}`, marginBottom: 12 }}
          >
            {sensitive.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <LockOutlined style={{ color: C.warning }} />
                <div style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 13 }}>
                    {s.entity}.{s.field}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 11, display: 'block' }}>
                    {s.description}
                  </Text>
                </div>
                <Tag color="orange">{s.mask_type}</Tag>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<Text style={{ color: C.text }}>🧪 脱敏测试</Text>}
            style={{ background: C.card, border: `1px solid ${C.border}`, marginBottom: 12 }}
          >
            <Form layout="vertical">
              <Form.Item label={<Text style={{ color: C.muted }}>实体</Text>}>
                <Select
                  options={sensitive.map(s => ({ value: s.entity, label: s.entity }))}
                  onChange={_v => setMaskValue('')}
                />
              </Form.Item>
              <Form.Item label={<Text style={{ color: C.muted }}>字段</Text>}>
                <Select
                  options={sensitive.map(s => ({
                    value: s.field,
                    label: `${s.entity}.${s.field}`,
                  }))}
                  onChange={setMaskValue}
                />
              </Form.Item>
              <Form.Item label={<Text style={{ color: C.muted }}>原始值</Text>}>
                <Input placeholder="输入测试值，如 13812345678" />
              </Form.Item>
              <Button
                type="primary"
                block
                onClick={() => {
                  message.success('脱敏结果：138****5678')
                  setMaskResult({
                    original: '13812345678',
                    masked: '138****5678',
                    mask_type: 'partial',
                  })
                }}
              >
                执行脱敏
              </Button>
              {maskResult && (
                <div style={{ marginTop: 16, padding: 12, background: '#0f0f0f', borderRadius: 8 }}>
                  <Text style={{ color: C.muted, fontSize: 12 }}>
                    原始值：{maskResult.original}
                  </Text>
                  <Text style={{ color: C.success, fontSize: 12, display: 'block' }}>
                    脱敏结果：{maskResult.masked}
                  </Text>
                </div>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )

  // 数据校验
  const renderValidation = () => (
    <div>
      <Card style={{ background: C.card, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <Title level={5} style={{ color: C.text, marginBottom: 16 }}>
          数据质量校验
        </Title>
        <Text style={{ color: C.muted, fontSize: 13 }}>
          选择实体并输入测试数据，系统将根据预置规则进行质量检查
        </Text>
        <Divider style={{ borderColor: C.border }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Select
              placeholder="选择实体"
              style={{ width: 200 }}
              options={[
                { value: 'users', label: '用户数据' },
                { value: 'projects', label: '项目数据' },
                { value: 'hazards', label: '随手拍数据' },
                { value: 'reports', label: '报告数据' },
              ]}
              onChange={v => setValidateData(v)}
            />
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => {
                setValidateResult({
                  passed: false,
                  score: 40,
                  issues: [
                    {
                      rule_id: 'u001',
                      field: 'phone',
                      severity: 'critical',
                      message: '手机号格式错误',
                    },
                    {
                      rule_id: 'u003',
                      field: 'role_id',
                      severity: 'critical',
                      message: '角色不能为空',
                    },
                  ],
                })
              }}
            >
              执行校验
            </Button>
          </Space>
          {validateResult && (
            <div>
              <Alert
                type={validateResult.passed ? 'success' : 'error'}
                message={
                  <Space>
                    {validateResult.passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    <Text>
                      质量得分：
                      <Text style={{ fontWeight: 700, color: scoreColor(validateResult.score) }}>
                        {validateResult.score}
                      </Text>
                      /100
                    </Text>
                  </Space>
                }
                style={{ marginBottom: 12 }}
              />
              {validateResult.issues?.map((issue, i) => (
                <Alert
                  key={i}
                  type="warning"
                  message={
                    <Space>
                      <Tag color={LEVEL_COLOR[issue.severity]}>{issue.severity}</Tag>
                      <Text style={{ color: C.text }}>{issue.message}</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>（字段：{issue.field}）</Text>
                    </Space>
                  }
                  style={{ marginBottom: 6 }}
                />
              ))}
            </div>
          )}
        </Space>
      </Card>
    </div>
  )

  return (
    <Tabs
      activeKey={tab}
      onChange={setTab}
      items={[
        {
          key: 'score',
          label: (
            <span>
              <SafetyCertificateOutlined /> 质量评分
            </span>
          ),
          children: renderScoreCard(),
        },
        {
          key: 'rules',
          label: (
            <span>
              <SafetyCertificateOutlined /> 质量规则
            </span>
          ),
          children: renderRules(),
        },
        {
          key: 'lineage',
          label: (
            <span>
              <NodeIndexOutlined /> 数据血缘
            </span>
          ),
          children: renderLineage(),
        },
        {
          key: 'metadata',
          label: (
            <span>
              <DatabaseOutlined /> 元数据
            </span>
          ),
          children: renderMetadata(),
        },
        {
          key: 'security',
          label: (
            <span>
              <LockOutlined /> 数据安全
            </span>
          ),
          children: renderSecurity(),
        },
        {
          key: 'validate',
          label: (
            <span>
              <ExclamationCircleOutlined /> 数据校验
            </span>
          ),
          children: renderValidation(),
        },
      ]}
    />
  )
}

// ── 主组件 ─────────────────────────────────────────────────
export default function DataGovernance() {
  const [mode, setMode] = useState('governance') // 'governance' | 'business'

  return (
    <div style={{ padding: 24 }}>
      {/* 头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ color: C.text, marginBottom: 4 }}>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            数据服务
          </Title>
          <Text style={{ color: C.muted, fontSize: 13 }}>
            {mode === 'governance'
              ? '数据治理视图 — 质量/血缘/安全/元数据'
              : '业务管理视图 — 主数据查询与校验'}
          </Text>
        </div>
        {/* 切换按钮 */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '4px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <Button
            type={mode === 'governance' ? 'primary' : 'default'}
            icon={<SafetyCertificateOutlined />}
            onClick={() => setMode('governance')}
            size="small"
          >
            数据治理
          </Button>
          <Button
            type={mode === 'business' ? 'primary' : 'default'}
            icon={<DatabaseOutlined />}
            onClick={() => setMode('business')}
            size="small"
          >
            业务管理
          </Button>
        </div>
      </div>

      {/* 视图 */}
      <Card style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {mode === 'governance' ? <GovernanceView /> : <BusinessView />}
      </Card>
    </div>
  )
}
