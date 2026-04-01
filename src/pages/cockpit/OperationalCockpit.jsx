import React, { useState } from 'react'
import { Row, Col, Card, Typography, Tag, Button, Select, Badge, Avatar, Divider } from 'antd'
import {
  Monitor,
  MessageSquare,
  FileText,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi,
  ChevronDown,
  Zap,
  Bell,
} from 'lucide-react'

const { Title, Text, Paragraph } = Typography

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

// 模拟数据
const PROJECTS = [
  { id: 1, name: 'J-2X高精线联调项目', status: 'active' },
  { id: 2, name: 'O3厂区建设项目', status: 'normal' },
  { id: 3, name: 'XX集团设备安装', status: 'normal' },
]

const MESSAGES = [
  {
    id: 1,
    user: '李师傅',
    time: '10:20',
    content: '今天到厂，发现***部件尺寸不对',
    type: 'warning',
    extracted: ['异常', '尺寸错误', 'ECO'],
  },
  { id: 2, user: '张工', time: '09:15', content: '主轴顺利落位了', type: 'normal', extracted: [] },
  { id: 3, user: '刘工', time: '08:30', content: '今天请假一天', type: 'normal', extracted: [] },
  {
    id: 4,
    user: '王师傅',
    time: '昨天',
    content: '变频器参数异常，已停机检查',
    type: 'danger',
    extracted: ['设备故障', '停机'],
  },
]

const WEEKLY_REPORT = {
  period: '4月1日 - 4月7日',
  progress: '主轴已落位，遭遇尺寸偏差图纸变更',
  risk: '新型阀门 2 件尚未到场',
  completed: ['完成主轴安装', '完成电气接线检查'],
  pending: ['等待新图纸下发', '联系供应商发货'],
}

const ECO_LIST = [
  {
    id: 1,
    code: 'ECO-001',
    title: '图纸变更001单',
    project: 'J-2X项目',
    status: 'pending',
    urgency: 'high',
  },
  {
    id: 2,
    code: 'ECO-002',
    title: '物料变更002单',
    project: 'J-2X项目',
    status: 'pending',
    urgency: 'normal',
  },
]

const MATERIAL_STATUS = [
  { name: '导航泵', status: 'notArrived', color: COLORS.danger, note: '未发货' },
  { name: '伺服阀门', status: 'partial', color: COLORS.warning, note: '部分到货' },
  { name: '控制柜', status: 'arrived', color: COLORS.success, note: '已到货' },
  { name: '电缆', status: 'arrived', color: COLORS.success, note: '已到货' },
]

// 项目切换器
const ProjectSwitcher = ({ currentProject, onChange }) => (
  <Card
    style={{
      borderRadius: 12,
      marginBottom: 16,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}dd)`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Monitor size={20} color="#fff" />
        <span style={{ color: '#fff', fontSize: 14 }}>切换项目舱段</span>
      </div>
      <Select
        value={currentProject}
        onChange={onChange}
        style={{ width: 240 }}
        dropdownStyle={{ borderRadius: 8 }}
      >
        {PROJECTS.map(p => (
          <Select.Option key={p.id} value={p.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{p.name}</span>
              {p.status === 'active' && <Badge status="processing" />}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
    <div
      style={{
        marginTop: 12,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <AlertTriangle size={14} color="#fff" />
      <span style={{ color: '#fff', fontSize: 12 }}>
        严厉警告：切走下方该框，下面的全部瀑布流将秒切，绝对禁止数据串台
      </span>
    </div>
  </Card>
)

// 一线消息流
const MessageStream = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={18} color={COLORS.primary} />
        <span>一线哨兵监听站</span>
        <Tag style={{ marginLeft: 8 }}>摆渡接收端</Tag>
      </div>
    }
    style={{ borderRadius: 12, height: '100%' }}
    bodyStyle={{ padding: 0 }}
  >
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      {MESSAGES.map(msg => (
        <div
          key={msg.id}
          style={{
            padding: 12,
            borderBottom: `1px solid ${COLORS.border}`,
            background:
              msg.type === 'danger'
                ? `${COLORS.danger}08`
                : msg.type === 'warning'
                  ? `${COLORS.warning}08`
                  : 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Avatar size={28} style={{ background: COLORS.primary, fontSize: 12 }}>
              {msg.user.substring(0, 1)}
            </Avatar>
            <span style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>{msg.user}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 11, marginLeft: 'auto' }}>
              {msg.time}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: COLORS.text,
              marginLeft: 36,
              marginBottom: msg.extracted.length > 0 ? 8 : 0,
            }}
          >
            "{msg.content}"
          </div>
          {msg.extracted.length > 0 && (
            <div style={{ marginLeft: 36, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {msg.extracted.map(tag => (
                <Tag
                  key={tag}
                  color={msg.type === 'danger' ? 'red' : 'orange'}
                  style={{ fontSize: 10 }}
                >
                  {tag}
                </Tag>
              ))}
              <Tag color="blue" style={{ fontSize: 10 }}>
                系统提取
              </Tag>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
)

// 智能周报生成
const WeeklyReportGenerator = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileText size={18} color={COLORS.primary} />
        <span>智能周报拼装操作台</span>
      </div>
    }
    extra={
      <Tag
        icon={<Zap size={12} />}
        style={{ background: `${COLORS.primary}15`, border: 'none', color: COLORS.primary }}
      >
        系统生成
      </Tag>
    }
    style={{ borderRadius: 12 }}
  >
    <div style={{ background: COLORS.bg, padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>周期</Text>
        <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>
          {WEEKLY_REPORT.period}
        </div>
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>本周进展</Text>
        <Paragraph style={{ color: COLORS.text, margin: 0 }}>{WEEKLY_REPORT.progress}</Paragraph>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ color: COLORS.danger, fontSize: 12 }}>⚠️ 风险项</Text>
        <div style={{ fontSize: 13, color: COLORS.danger }}>{WEEKLY_REPORT.risk}</div>
      </div>
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        <CheckCircle2 size={12} style={{ marginRight: 4 }} />
        已完成
      </div>
      {WEEKLY_REPORT.completed.map((item, _i) => (
        <div
          key={_i}
          style={{ fontSize: 13, color: COLORS.text, paddingLeft: 16, marginBottom: 4 }}
        >
          ✓ {item}
        </div>
      ))}
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
        <Clock size={12} style={{ marginRight: 4 }} />
        待完成
      </div>
      {WEEKLY_REPORT.pending.map((item, _i) => (
        <div
          key={_i}
          style={{ fontSize: 13, color: COLORS.textMuted, paddingLeft: 16, marginBottom: 4 }}
        >
          ○ {item}
        </div>
      ))}
    </div>

    <Button
      type="primary"
      block
      size="large"
      icon={<CheckCircle2 size={16} />}
      style={{
        borderRadius: 8,
        height: 48,
        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}dd)`,
        border: 'none',
        fontWeight: 600,
      }}
    >
      ✅ 没问题，一键核准上报周报
    </Button>
  </Card>
)

// 待签字ECO
const ECOPending = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={18} color={COLORS.danger} />
        <span>待签字 ECO单</span>
      </div>
    }
    style={{ borderRadius: 12 }}
  >
    {ECO_LIST.map((eco, _i) => (
      <div
        key={_i}
        style={{
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          border: `1px solid ${eco.urgency === 'high' ? COLORS.danger : COLORS.border}`,
          background: eco.urgency === 'high' ? `${COLORS.danger}05` : COLORS.bg,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Tag color={eco.urgency === 'high' ? 'red' : 'blue'} style={{ marginRight: 0 }}>
            {eco.code}
          </Tag>
          <Badge
            status={eco.status === 'pending' ? 'processing' : 'success'}
            text={eco.status === 'pending' ? '待签字' : '已签字'}
          />
        </div>
        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500, marginBottom: 4 }}>
          {eco.title}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{eco.project}</div>
      </div>
    ))}
    <Button type="link" block style={{ color: COLORS.primary, padding: '8px 0' }}>
      查看全部 ECO单 <ChevronDown size={14} />
    </Button>
  </Card>
)

// 欠料红绿灯
const MaterialRadar = () => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={18} color={COLORS.primary} />
        <span>里程碑缺料雷达</span>
      </div>
    }
    style={{ borderRadius: 12 }}
  >
    {MATERIAL_STATUS.map((mat, _i) => (
      <div
        key={_i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          background: `${mat.color}08`,
          border: `1px solid ${mat.color}30`,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: mat.color,
            boxShadow: `0 0 8px ${mat.color}`,
          }}
        />
        <span style={{ flex: 1, fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
          {mat.name}
        </span>
        <Tag
          color={
            mat.status === 'notArrived' ? 'red' : mat.status === 'partial' ? 'orange' : 'green'
          }
          style={{ marginRight: 0 }}
        >
          {mat.note}
        </Tag>
      </div>
    ))}
    <div
      style={{
        marginTop: 12,
        padding: 8,
        background: COLORS.bg,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Wifi size={14} color={COLORS.textMuted} />
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>关联 BOM 系统 · 数据实时更新</span>
    </div>
  </Card>
)

// 快捷操作
const QuickActions = () => (
  <Card title="快捷操作台" style={{ borderRadius: 12 }}>
    <Row gutter={[8, 8]}>
      <Col span={12}>
        <Button block icon={<Bell size={14} />} style={{ borderRadius: 8, height: 40 }}>
          一键催办
        </Button>
      </Col>
      <Col span={12}>
        <Button
          block
          type="primary"
          icon={<CheckCircle2 size={14} />}
          style={{ borderRadius: 8, height: 40 }}
        >
          即刻同意ECO
        </Button>
      </Col>
      <Col span={12}>
        <Button block icon={<MessageSquare size={14} />} style={{ borderRadius: 8, height: 40 }}>
          发送通知
        </Button>
      </Col>
      <Col span={12}>
        <Button block icon={<FileText size={14} />} style={{ borderRadius: 8, height: 40 }}>
          生成报告
        </Button>
      </Col>
    </Row>
  </Card>
)

export default function OperationalCockpit() {
  const [currentProject, setCurrentProject] = useState(1)

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>
          单兵作战台
        </Title>
        <Text style={{ color: COLORS.textMuted }}>项目经理专属 · 操作执行视角</Text>
      </div>

      <ProjectSwitcher currentProject={currentProject} onChange={setCurrentProject} />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <MessageStream />
        </Col>
        <Col span={12}>
          <WeeklyReportGenerator />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={8}>
          <MaterialRadar />
        </Col>
        <Col span={8}>
          <ECOPending />
        </Col>
        <Col span={8}>
          <QuickActions />
        </Col>
      </Row>
    </div>
  )
}
