import React, { useState } from 'react'
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Avatar,
  Divider,
  Tabs,
  Statistic,
  message,
  Steps,
} from 'antd'
import {
  CheckCircle2,
  Clock,
  XCircle,
  User,
  FileText,
  AlertTriangle,
  Send,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { TimelineChart, Timeline } from '@ant-design/charts'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

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

const PENDING_APPROVALS = [
  {
    id: 1,
    title: '产线自动化改造项目 - 第12周周报',
    type: 'report',
    applicant: '张经理',
    dept: '技术研发部',
    submitTime: '2026-03-28 17:00',
    priority: 'normal',
  },
  {
    id: 2,
    title: '设备采购合同变更申请',
    type: 'contract',
    applicant: '李经理',
    dept: '采购部',
    submitTime: '2026-03-29 09:30',
    priority: 'high',
  },
  {
    id: 3,
    title: '项目预算调整申请 - 新厂房建设',
    type: 'budget',
    applicant: '王经理',
    dept: '工程建设部',
    submitTime: '2026-03-29 14:00',
    priority: 'urgent',
  },
  {
    id: 4,
    title: 'XX集团设备安装工程 - 进度变更',
    type: 'schedule',
    applicant: '赵经理',
    dept: '技术研发部',
    submitTime: '2026-03-30 10:00',
    priority: 'normal',
  },
]

const APPROVED = [
  {
    id: 5,
    title: '研发中心升级项目 - 3月月报',
    type: 'report',
    applicant: '陈经理',
    dept: '技术研发部',
    approveTime: '2026-03-26 18:00',
    approver: '公司领导',
  },
  {
    id: 6,
    title: '检测设备采购合同',
    type: 'contract',
    applicant: '刘经理',
    dept: '采购部',
    approveTime: '2026-03-25 16:00',
    approver: '部门领导',
  },
]

const REJECTED = [
  {
    id: 7,
    title: '检测设备采购项目 - 第12周周报',
    type: 'report',
    applicant: '刘经理',
    dept: '采购部',
    rejectTime: '2026-03-29 11:00',
    rejector: '部门领导',
    reason: '进度数据与实际不符',
  },
]

const STATISTICS = {
  pending: 12,
  approvedToday: 5,
  rejectedToday: 1,
  avgTime: '4.5h',
}

const TYPE_MAP = {
  report: { label: '报告', color: COLORS.primary },
  contract: { label: '合同', color: COLORS.success },
  budget: { label: '预算', color: COLORS.warning },
  schedule: { label: '进度', color: '#8b5cf6' },
}

const PRIORITY_MAP = {
  normal: { label: '普通', color: 'default' },
  high: { label: '紧急', color: 'orange' },
  urgent: { label: '加急', color: 'red' },
}

export default function ApprovalCenterEnhanced() {
  const [activeTab, setActiveTab] = useState('pending')
  const [detailModal, setDetailModal] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState(null)

  const handleApprove = id => {
    message.success('审批通过')
  }

  const handleReject = id => {
    message.success('已驳回')
  }

  const pendingColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <Space>
          <Tag color={TYPE_MAP[record.type]?.color}>{TYPE_MAP[record.type]?.label}</Tag>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 100 },
    { title: '部门', dataIndex: 'dept', key: 'dept', width: 120 },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: 150 },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: v => <Tag color={PRIORITY_MAP[v]?.color}>{PRIORITY_MAP[v]?.label}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => {
              setSelectedApproval(record)
              setDetailModal(true)
            }}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<CheckCircle2 size={14} />}
            style={{ color: COLORS.success }}
            onClick={() => handleApprove(record.id)}
          >
            通过
          </Button>
          <Button
            type="text"
            size="small"
            icon={<XCircle size={14} />}
            style={{ color: COLORS.danger }}
            onClick={() => handleReject(record.id)}
          >
            驳回
          </Button>
        </Space>
      ),
    },
  ]

  const approvedColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Tag color={TYPE_MAP[record.type]?.color}>{TYPE_MAP[record.type]?.label}</Tag>
          <span>{text}</span>
        </Space>
      ),
    },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '审批时间', dataIndex: 'approveTime', key: 'approveTime' },
    { title: '审批人', dataIndex: 'approver', key: 'approver' },
  ]

  const rejectedColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Tag color={TYPE_MAP[record.type]?.color}>{TYPE_MAP[record.type]?.label}</Tag>
          <span>{text}</span>
        </Space>
      ),
    },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant' },
    { title: '驳回时间', dataIndex: 'rejectTime', key: 'rejectTime' },
    { title: '驳回人', dataIndex: 'rejector', key: 'rejector' },
    { title: '驳回原因', dataIndex: 'reason', key: 'reason', ellipsis: true },
  ]

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
          审批中心
        </Title>
        <Text style={{ color: COLORS.textMuted }}>报告审批 · 合同审批 · 预算审批 · 进度变更</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="待审批"
              value={STATISTICS.pending}
              valueStyle={{ color: COLORS.warning }}
              suffix="项"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="今日通过"
              value={STATISTICS.approvedToday}
              valueStyle={{ color: COLORS.success }}
              suffix="项"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="今日驳回"
              value={STATISTICS.rejectedToday}
              valueStyle={{ color: COLORS.danger }}
              suffix="项"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <Statistic
              title="平均审批时长"
              value={STATISTICS.avgTime}
              valueStyle={{ color: COLORS.primary }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <Clock size={14} /> 待我审批 ({PENDING_APPROVALS.length})
                </span>
              ),
            },
            {
              key: 'approved',
              label: (
                <span>
                  <CheckCircle2 size={14} /> 已通过 ({APPROVED.length})
                </span>
              ),
            },
            {
              key: 'rejected',
              label: (
                <span>
                  <XCircle size={14} /> 已驳回 ({REJECTED.length})
                </span>
              ),
            },
          ]}
        />

        {activeTab === 'pending' && (
          <Table
            columns={pendingColumns}
            dataSource={PENDING_APPROVALS}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
        {activeTab === 'approved' && (
          <Table
            columns={approvedColumns}
            dataSource={APPROVED}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
        {activeTab === 'rejected' && (
          <Table
            columns={rejectedColumns}
            dataSource={REJECTED}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="审批详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={
          activeTab === 'pending' ? (
            <Space>
              <Button onClick={() => setDetailModal(false)}>取消</Button>
              <Button
                style={{ color: COLORS.danger }}
                icon={<XCircle size={14} />}
                onClick={() => {
                  handleReject(selectedApproval?.id)
                  setDetailModal(false)
                }}
              >
                驳回
              </Button>
              <Button
                type="primary"
                icon={<CheckCircle2 size={14} />}
                onClick={() => {
                  handleApprove(selectedApproval?.id)
                  setDetailModal(false)
                }}
              >
                通过
              </Button>
            </Space>
          ) : null
        }
        width={700}
      >
        {selectedApproval && (
          <div>
            <Card style={{ background: COLORS.bg, marginBottom: 16 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>申请标题</div>
                  <div style={{ fontWeight: 500 }}>{selectedApproval.title}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>申请人</div>
                  <div style={{ fontWeight: 500 }}>{selectedApproval.applicant}</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>部门</div>
                  <div style={{ fontWeight: 500 }}>{selectedApproval.dept}</div>
                </Col>
              </Row>
            </Card>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                审批流程
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar style={{ background: COLORS.success }} icon={<User size={14} />} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>申请人</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>
                    {selectedApproval.applicant}
                  </div>
                </div>
                <ArrowRight size={16} color={COLORS.textMuted} />
                <div style={{ textAlign: 'center' }}>
                  <Avatar style={{ background: COLORS.primary }} icon={<Clock size={14} />} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>待审批</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>当前节点</div>
                </div>
                <ArrowRight size={16} color={COLORS.textMuted} />
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                  <Avatar style={{ background: COLORS.border }} icon={<CheckCircle2 size={14} />} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>完成</div>
                </div>
              </div>
            </div>

            {activeTab === 'pending' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  审批意见
                </Text>
                <TextArea rows={3} placeholder="请输入审批意见..." />
              </div>
            )}

            {activeTab === 'rejected' && selectedApproval.reason && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: `${COLORS.danger}10`,
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 12, color: COLORS.danger, marginBottom: 4 }}>驳回原因</div>
                <div style={{ fontSize: 13 }}>{selectedApproval.reason}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
