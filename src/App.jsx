import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Layout, Menu, Avatar, Badge, Tabs, Tag, Button, Modal, Input, Progress, Tooltip, List, Row, Col, Typography, Divider } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChartComponent, BarChartComponent, DonutChartComponent } from './components/Charts';
import Team from './components/Team';
import Documents from './components/Documents';
import { LogoIcon } from './components/Icons';
import { LayoutDashboard, Kanban, Users, FileText, Bell, Plus, Search, ChevronRight, Clock, CheckCircle2, MessageSquare, Paperclip, Star, MoreHorizontal, Filter, RefreshCw, Calendar, X, Send } from 'lucide-react';
import Hazards from './pages/Hazards';
import Login from './pages/Login';

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;

const D = {
  bg: '#0a0a0e', surface: '#13131a', card: '#1a1a22', elevated: '#22222c',
  border: 'rgba(255,255,255,0.06)',
  accent: '#6366f1', accent2: '#818cf8',
  success: '#22c55e', warning: '#f59e0b', danger: '#ef4444',
  text: '#e4e4e7', textSec: '#a1a1aa', textMuted: '#52525b',
};

const theme = {
  token: {
    colorPrimary: D.accent, colorBgBase: D.bg, colorBgContainer: D.surface,
    colorBgElevated: D.elevated, colorBorder: D.border, colorText: D.text,
    colorTextSecondary: D.textSec, colorTextTertiary: D.textMuted,
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
};

const va = {
  fadeUp: (i = 0) => ({ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } } }),
  slideIn: (i = 0) => ({ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { delay: i * 0.07 } } }),
  scaleIn: (i = 0) => ({ hidden: { opacity: 0, scale: 0.93 }, visible: { opacity: 1, scale: 1, transition: { delay: i * 0.07, type: 'spring', bounce: 0.3 } } }),
};

const USERS = [
  { name: '张小明', role: '前端开发', color: '#6366f1', initials: '张' },
  { name: '李华', role: '后端开发', color: '#22c55e', initials: '李' },
  { name: '王芳', role: 'UI设计', color: '#ec4899', initials: '王' },
  { name: '赵强', role: '测试', color: '#f59e0b', initials: '赵' },
];

const TASKS = {
  backlog: [
    { id: 1, title: '设计权限管理模块 RBAC', assignee: USERS[0], tag: '安全', priority: 'high', date: '03-28', comment: 3, attachment: 1, story: 8, progress: undefined },
    { id: 2, title: '集成飞书单点登录 SSO', assignee: USERS[1], tag: '认证', priority: 'medium', date: '03-30', comment: 1, attachment: 0, story: 12, progress: undefined },
    { id: 3, title: '移动端适配检查与优化', assignee: USERS[2], tag: 'UI', priority: 'low', date: '04-02', comment: 0, attachment: 2, story: 5, progress: undefined },
    { id: 4, title: '性能压测报告整理', assignee: USERS[3], tag: '测试', priority: 'medium', date: '04-05', comment: 2, attachment: 3, story: 7, progress: undefined },
  ],
  inprogress: [
    { id: 5, title: '仪表盘图表开发', assignee: USERS[0], tag: '前端', priority: 'high', date: '03-27', comment: 5, attachment: 0, story: 15, progress: 65 },
    { id: 6, title: '任务评论功能实现', assignee: USERS[1], tag: '功能', priority: 'medium', date: '03-26', comment: 8, attachment: 1, story: 10, progress: 40 },
    { id: 7, title: '通知中心后端服务', assignee: USERS[3], tag: '后端', priority: 'high', date: '03-28', comment: 2, attachment: 0, story: 9, progress: 80 },
  ],
  review: [
    { id: 8, title: 'API 接口文档编写', assignee: USERS[2], tag: '文档', priority: 'medium', date: '03-26', comment: 6, attachment: 4, story: 6, progress: undefined },
    { id: 9, title: '登录页动画优化', assignee: USERS[0], tag: 'UI', priority: 'low', date: '03-27', comment: 3, attachment: 1, story: 11, progress: 90 },
  ],
  done: [
    { id: 10, title: '用户认证模块开发', assignee: USERS[1], tag: '安全', priority: 'high', date: '03-25', comment: 4, attachment: 2, story: 14, progress: 100 },
    { id: 11, title: '数据库设计与实现', assignee: USERS[3], tag: '架构', priority: 'high', date: '03-24', comment: 2, attachment: 5, story: 13, progress: 100 },
    { id: 12, title: '原型评审与定稿', assignee: USERS[2], tag: 'UI', priority: 'medium', date: '03-23', comment: 7, attachment: 3, story: 8, progress: 100 },
    { id: 13, title: '技术选型评估报告', assignee: USERS[0], tag: '架构', priority: 'high', date: '03-22', comment: 5, attachment: 1, story: 10, progress: 100 },
    { id: 14, title: '项目脚手架初始化', assignee: USERS[1], tag: '工程', priority: 'medium', date: '03-20', comment: 1, attachment: 0, story: 5, progress: 100 },
  ],
};

const KANBAN_COLS = [
  { key: 'backlog', label: '待办', color: '#71717a', glow: 'rgba(113,113,122,0.3)' },
  { key: 'inprogress', label: '进行中', color: '#6366f1', glow: 'rgba(99,102,241,0.4)' },
  { key: 'review', label: '评审', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { key: 'done', label: '完成', color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
];

const PRIORITY = {
  high: { label: '紧急', color: '#ef4444' },
  medium: { label: '高', color: '#f59e0b' },
  low: { label: '普通', color: '#6366f1' },
};
const TAGS = {
  安全: '#ef4444', 认证: '#f59e0b', 前端: '#6366f1', 后端: '#22c55e',
  UI: '#ec4899', 文档: '#06b6d4', 测试: '#8b5cf6', 架构: '#f97316', 功能: '#14b8a6', 工程: '#71717a',
};

const COMMENTS = [
  { user: USERS[1], text: '这个模块的接口设计很清晰，点赞！', time: '10分钟前' },
  { user: USERS[2], text: 'UI 稿已经同步到 Figma，需要review一下。', time: '25分钟前' },
  { user: USERS[3], text: '测试用例已覆盖 90% 场景，边界情况还需要补充。', time: '1小时前' },
];
const SUBTASKS = [
  { id: 1, title: '完成权限模型设计', done: true },
  { id: 2, title: '编写接口文档', done: true },
  { id: 3, title: '前端权限组件开发', done: false },
  { id: 4, title: '集成测试', done: false },
];

function CountUp({ target, duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return <span>{value}</span>;
}

function AvatarChip({ user, size = 28 }) {
  return (
    <Tooltip title={`${user.name} · ${user.role}`}>
      <Avatar size={size} style={{ background: user.color, fontSize: size * 0.36, fontWeight: 700, border: `2px solid ${D.surface}`, cursor: 'pointer' }}>
        {user.initials}
      </Avatar>
    </Tooltip>
  );
}

function TagBadge({ tag }) {
  const c = TAGS[tag] || D.textMuted;
  return (
    <span style={{ display: 'inline-flex', padding: '1px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${c}15`, color: c, border: `1px solid ${c}30` }}>
      {tag}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function StatCard({ title, value, suffix, icon, color, trend, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div variants={va.scaleIn(delay)} initial="hidden" animate="visible"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}>
      <div style={{
        background: `linear-gradient(135deg, ${D.card} 0%, ${D.elevated} 100%)`,
        border: `1px solid ${hovered ? D.accent + '50' : D.border}`,
        borderRadius: 18, padding: '22px 24px', position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? `0 12px 40px ${color}20` : 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <Text style={{ color: D.textSec, fontSize: 13, display: 'block', marginBottom: 10 }}>{title}</Text>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: D.text, lineHeight: 1, letterSpacing: '-1px' }}><CountUp target={value} /></span>
              {suffix && <Text style={{ color: D.textSec, fontSize: 14 }}>{suffix}</Text>}
            </div>
            {trend !== undefined && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag color={trend >= 0 ? 'success' : 'error'} style={{ borderRadius: 8, border: 'none', fontSize: 11, background: trend >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: trend >= 0 ? D.success : D.danger }}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </Tag>
                <Text style={{ color: D.textMuted, fontSize: 11 }}>较上周</Text>
              </div>
            )}
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onClick, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const cfg = PRIORITY[task.priority];
  return (
    <motion.div variants={va.scaleIn(delay)} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: D.card, border: `1px solid ${hovered ? D.accent + '50' : D.border}`,
        borderRadius: 8, padding: '14px 16px', marginBottom: 8, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 12px 40px ${D.accent}20` : 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${cfg.color} 0%, ${cfg.color}60 100%)`, borderRadius: '14px 0 0 14px' }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, paddingLeft: 10 }}>
        <PriorityBadge priority={task.priority} />
        <TagBadge tag={task.tag} />
      </div>
      <Title level={5} style={{ fontSize: 14, fontWeight: 600, color: D.text, margin: '0 0 12px 0', lineHeight: 1.45, paddingLeft: 10 }}>
        {task.title}
      </Title>
      {task.progress !== undefined && (
        <div style={{ marginBottom: 10, paddingLeft: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={{ fontSize: 11, color: D.textMuted }}>进度</Text>
            <Text style={{ fontSize: 11, color: D.accent, fontWeight: 700 }}>{task.progress}%</Text>
          </div>
          <Progress percent={task.progress} showInfo={false} strokeColor={{ '0%': D.accent, '100%': D.accent2 }} trailColor="rgba(255,255,255,0.06)" size="small" />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {task.comment > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: D.textMuted, fontSize: 12 }}><MessageSquare size={12} /> {task.comment}</span>}
          {task.attachment > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: D.textMuted, fontSize: 12 }}><Paperclip size={12} /> {task.attachment}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: D.textMuted, fontSize: 12 }}><Star size={12} /> {task.story}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, color: D.textMuted }}>{task.date}</Text>
          <AvatarChip user={task.assignee} size={24} />
        </div>
      </div>
    </motion.div>
  );
}

function KanbanColumn({ column, tasks, onTaskClick }) {
  return (
    <div style={{ flex: 1, minWidth: 240, maxWidth: 300 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: column.color, boxShadow: `0 0 10px ${column.glow}` }} />
          <Text style={{ fontWeight: 600, fontSize: 13, color: D.textSec }}>{column.label}</Text>
          <div style={{ background: `${column.color}18`, color: column.color, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10, border: `1px solid ${column.color}30` }}>{tasks.length}</div>
        </div>
        <Tooltip title="添加任务">
          <Button type="text" size="small" icon={<Plus size={14} />} style={{ color: D.textMuted, borderRadius: 8, width: 28, height: 28 }} />
        </Tooltip>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.015)', borderRadius: 8, padding: '10px 8px', minHeight: 320, border: `1px dashed rgba(255,255,255,0.04)` }}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task, i) => (
            <motion.div key={task.id} layout initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} transition={{ duration: 0.35, delay: i * 0.04 }}>
              <TaskCard task={task} onClick={() => onTaskClick(task)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: D.textMuted, fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}><Plus size={24} style={{ opacity: 0.3 }} /></div>
            暂无任务
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({ task, open, onClose }) {
  const [tab, setTab] = useState('detail');
  const [comment, setComment] = useState('');
  if (!task) return null;
  const cfg = PRIORITY[task.priority];
  return (
    <Modal open={open} onCancel={onClose} footer={null} width={720} centered destroyOnClose
      closeIcon={<X size={18} color={D.textMuted} />}
      styles={{ mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.7)' }, content: { background: D.surface, border: `1px solid ${D.border}`, borderRadius: 20, padding: 0, overflow: 'hidden' }, body: { padding: 0 } }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3, type: 'spring' }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${cfg.color} 0%, ${D.accent} 100%)` }} />
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PriorityBadge priority={task.priority} />
              <TagBadge tag={task.tag} />
            </div>
            <Button type="text" icon={<X size={16} />} onClick={onClose} style={{ color: D.textMuted }} />
          </div>
          <Title level={3} style={{ color: D.text, margin: '0 0 20px 0', fontSize: 20, fontWeight: 700 }}>{task.title}</Title>
          <Tabs activeKey={tab} onChange={setTab}
            items={[{ key: 'detail', label: '详情' }, { key: 'comments', label: `评论 (${COMMENTS.length})` }, { key: 'activity', label: '活动' }]}
            style={{ marginBottom: 20 }} />
          {tab === 'detail' && (
            <Row gutter={[24, 20]}>
              <Col span={16}>
                <div style={{ marginBottom: 24 }}>
                  <Text style={{ color: D.textSec, fontSize: 12, display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>描述</Text>
                  <div style={{ background: D.card, borderRadius: 12, padding: 16, border: `1px solid ${D.border}` }}>
                    <Text style={{ color: D.textSec, fontSize: 14, lineHeight: 1.7 }}>
                      {task.tag === '安全' ? '实现基于角色的访问控制（RBAC），包括用户组、角色、权限的完整生命周期管理，支持细粒度的资源级别权限控制。' :
                       task.tag === '前端' ? '开发仪表盘页面，包含统计卡片、趋势图表、团队工作量分布等可视化组件，使用 Ant Design + Recharts 实现。' :
                       task.tag === '后端' ? '实现实时通知服务，支持 WebSocket 推送、邮件通知、站内信三种方式。' :
                       task.tag === '文档' ? '编写完整的 REST API 文档，使用 OpenAPI 3.0 规范，包含请求示例、响应格式、错误码说明。' :
                       task.tag === 'UI' ? '设计并实现登录页微交互动效，包括背景粒子动画、按钮渐变呼吸效果、输入框聚焦态反馈。' :
                       '暂无描述'}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text style={{ color: D.textSec, fontSize: 12, display: 'block', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    子任务 ({SUBTASKS.filter(s => s.done).length}/{SUBTASKS.length})
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SUBTASKS.map((st, i) => (
                      <motion.div key={st.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: D.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${D.border}` }}>
                        {st.done ? <CheckCircle2 size={18} color={D.success} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${D.textMuted}` }} />}
                        <Text style={{ color: st.done ? D.textMuted : D.text, fontSize: 13, textDecoration: st.done ? 'line-through' : 'none', flex: 1 }}>{st.title}</Text>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                {[{ label: '负责人', value: <AvatarChip user={task.assignee} size={32} /> },
                  { label: '截止日期', value: <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.textSec, fontSize: 13 }}><Calendar size={13} /> {task.date}</div> },
                  { label: '故事点', value: <span style={{ color: D.warning, fontWeight: 700, fontSize: 16 }}>{task.story}</span> }
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: D.card, borderRadius: 10, padding: '10px 14px', border: `1px solid ${D.border}`, marginBottom: 12 }}>
                    <Text style={{ color: D.textMuted, fontSize: 11, display: 'block', marginBottom: 6 }}>{label}</Text>
                    {value}
                  </div>
                ))}
                {task.progress !== undefined && (
                  <div style={{ background: D.card, borderRadius: 10, padding: 14, border: `1px solid ${D.border}` }}>
                    <Text style={{ color: D.textMuted, fontSize: 11, display: 'block', marginBottom: 10 }}>进度</Text>
                    <Progress percent={task.progress} strokeColor={{ '0%': D.accent, '100%': D.accent2 }} trailColor="rgba(255,255,255,0.06)" />
                  </div>
                )}
              </Col>
            </Row>
          )}
          {tab === 'comments' && (
            <div>
              {COMMENTS.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <AvatarChip user={c.user} size={34} />
                  <div style={{ flex: 1, background: D.card, borderRadius: 12, padding: '10px 14px', border: `1px solid ${D.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: 600, fontSize: 13, color: D.text }}>{c.user.name}</Text>
                      <Text style={{ fontSize: 11, color: D.textMuted }}>{c.time}</Text>
                    </div>
                    <Text style={{ color: D.textSec, fontSize: 13 }}>{c.text}</Text>
                  </div>
                </motion.div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <TextArea value={comment} onChange={e => setComment(e.target.value)} placeholder="写评论..." rows={2} style={{ flex: 1, borderRadius: 12, background: D.card, border: `1px solid ${D.border}`, color: D.text }} />
                <Button type="primary" icon={<Send size={14} />} style={{ borderRadius: 12, height: 'auto', alignSelf: 'flex-end' }} />
              </div>
            </div>
          )}
          {tab === 'activity' && (
            <div>
              {[['张小明', '创建了此任务', '2小时前', D.accent], ['李华', '移动到进行中', '1小时前', D.warning], ['王芳', '添加了评论', '45分钟前', D.accent2]].map(([name, action, time, color], i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${D.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <Text style={{ color: D.text, fontSize: 13, fontWeight: 600 }}>{name}</Text>
                  <Text style={{ color: D.textSec, fontSize: 13 }}>{action}</Text>
                  <Text style={{ color: D.textMuted, fontSize: 11, marginLeft: 'auto' }}>{time}</Text>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Modal>
  );
}

function DashboardCharts() {
  const areaData = useMemo(() => [
    { name: '周一', value: 12 }, { name: '周二', value: 28 }, { name: '周三', value: 45 },
    { name: '周四', value: 38 }, { name: '周五', value: 52 }, { name: '周六', value: 25 }, { name: '周日', value: 18 },
  ], []);
  const barData = useMemo(() => [
    { name: '张小明', tasks: 8 }, { name: '李华', tasks: 12 }, { name: '王芳', tasks: 6 }, { name: '赵强', tasks: 9 },
  ], []);
  const donutData = useMemo(() => [
    { name: '前端', value: 35 }, { name: '后端', value: 28 }, { name: 'UI', value: 18 }, { name: '测试', value: 12 }, { name: '文档', value: 7 },
  ], []);
  return (
    <Row gutter={[16, 16]}>
      <Col span={16}>
        <motion.div variants={va.fadeUp(0)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 18, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div><Title level={5} style={{ color: D.text, margin: 0 }}>任务趋势</Title><Text style={{ color: D.textMuted, fontSize: 12 }}>最近30天</Text></div>
            <Tabs size="small" items={[{ key: '1', label: '任务数' }, { key: '2', label: '工时' }]} style={{ minWidth: 140 }} tabBarStyle={{ marginBottom: 0 }} />
          </div>
          <div style={{ height: 200 }}><AreaChartComponent data={areaData} /></div>
        </motion.div>
      </Col>
      <Col span={8}>
        <motion.div variants={va.fadeUp(1)} initial="hidden" animate="visible" style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 18, padding: '20px 24px', height: '100%' }}>
          <Title level={5} style={{ color: D.text, margin: '0 0 4px 0' }}>团队工作量</Title>
          <Text style={{ color: D.textMuted, fontSize: 12 }}>本周任务分布</Text>
          <div style={{ height: 160 }}><BarChartComponent data={barData} /></div>
        </motion.div>
      </Col>
    </Row>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState({ ...TASKS });

  const menuItems = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: '仪表盘' },
    { key: 'kanban', icon: <Kanban size={18} />, label: '看板' },
    { key: 'hazards', icon: <CheckCircle2 size={18} />, label: '随手拍' },
    { key: 'team', icon: <Users size={18} />, label: '团队' },
    { key: 'docs', icon: <FileText size={18} />, label: '文档' },
  ];

  const statCards = [
    { title: '总任务', value: 14, suffix: '个', color: D.accent, trend: 12, icon: <CheckCircle2 size={20} /> },
    { title: '进行中', value: 3, suffix: '个', color: D.warning, trend: -5, icon: <Clock size={20} /> },
    { title: '已完成', value: 5, suffix: '个', color: D.success, trend: 25, icon: <CheckCircle2 size={20} /> },
    { title: '团队成员', value: 4, suffix: '人', color: D.accent2, icon: <Users size={20} /> },
  ];

  const openTasks = [...tasks.backlog.slice(0, 2), ...tasks.inprogress.slice(0, 2)];

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh', background: D.bg }}>
        {/* 侧边栏 */}
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240}
          style={{ background: D.bg, borderRight: `1px solid ${D.border}`, position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}
          trigger={null}>
          {/* Logo */}
          <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: collapsed ? '0 16px' : '0 20px', borderBottom: `1px solid ${D.border}`, gap: 10 }}>
            <LogoIcon size={32} />
            <AnimatePresence>
              {!collapsed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Text strong style={{ color: D.text, fontSize: 16, whiteSpace: 'nowrap' }}>ProjectX</Text></motion.div>}
            </AnimatePresence>
          </div>
          {/* 菜单 */}
          <Menu mode="inline" selectedKeys={[current]} onClick={({ key }) => setCurrent(key)} style={{ background: 'transparent', border: 'none', marginTop: 8 }}>
            {menuItems.map(item => (
              <Menu.Item key={item.key}
                icon={<span style={{ color: current === item.key ? D.accent : D.textMuted }}>{item.icon}</span>}
                style={{
                  margin: '2px 8px', borderRadius: 10,
                  background: current === item.key ? `linear-gradient(135deg, ${D.accent}15 0%, ${D.accent2}08 100%)` : 'transparent',
                  color: current === item.key ? D.text : D.textSec,
                  fontWeight: current === item.key ? 600 : 400,
                  borderLeft: current === item.key ? `2px solid ${D.accent}` : '2px solid transparent',
                }}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu>
          {/* 用户信息 */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: collapsed ? '16px 12px' : '16px 20px', borderTop: `1px solid ${D.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={34} style={{ background: `linear-gradient(135deg, ${D.accent}, ${D.accent2})`, fontSize: 13, fontWeight: 700, border: `2px solid ${D.accent}40` }}>
                项目
              </Avatar>
              {!collapsed && <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>项目经理</div>
                <div style={{ fontSize: 11, color: D.textMuted }}>管理员</div>
              </div>}
            </div>
          </div>
        </Sider>

        {/* 主内容 */}
        <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)', background: 'transparent' }}>
          {/* 顶栏 */}
          <Header style={{ background: 'transparent', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${D.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button type="text" icon={collapsed ? <ChevronRight size={18} /> : <Kanban size={18} />} onClick={() => setCollapsed(!collapsed)} style={{ color: D.textSec }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: D.surface, border: `1px solid ${D.border}`, borderRadius: 10, padding: '8px 14px', width: 260 }}>
                <Search size={14} color={D.textMuted} />
                <Input placeholder="搜索任务、成员、文档..." bordered={false} style={{ background: 'transparent', color: D.text, fontSize: 13, padding: 0, flex: 1, margin: 0 }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip title="刷新"><Button type="text" icon={<RefreshCw size={16} />} style={{ color: D.textSec, borderRadius: 10 }} /></Tooltip>
              <Tooltip title="筛选"><Button type="text" icon={<Filter size={16} />} style={{ color: D.textSec, borderRadius: 10 }} /></Tooltip>
              <Badge count={3} size="small" offset={[-2, 2]}>
                <Button type="text" icon={<Bell size={18} />} style={{ color: D.textSec, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Badge>
              <Divider type="vertical" style={{ borderColor: D.border, margin: '0 4px' }} />
              <Avatar size={32} style={{ background: `linear-gradient(135deg, ${D.accent}, ${D.accent2})`, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                项目
              </Avatar>
            </div>
          </Header>

          {/* 页面内容 */}
          <Content style={{ padding: '24px 28px', background: 'transparent' }}>
            <AnimatePresence mode="wait">
              {current === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  {/* 标题 */}
                  <motion.div variants={va.fadeUp(0)} initial="hidden" animate="visible">
                    <Title level={3} style={{ color: D.text, margin: 0 }}>仪表盘</Title>
                    <Text style={{ color: D.textSec, fontSize: 13 }}>
                      {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </Text>
                  </motion.div>
                  {/* 统计卡片 */}
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    {statCards.map((card, i) => <Col xs={12} sm={12} md={6} key={card.title}><StatCard {...card} delay={i * 0.08} /></Col>)}
                  </Row>
                  {/* 进行中任务 */}
                  <motion.div variants={va.fadeUp(4)} initial="hidden" animate="visible" style={{ marginTop: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <Text style={{ fontWeight: 600, fontSize: 15, color: D.text }}>进行中任务</Text>
                      <Button type="link" style={{ color: D.accent, fontSize: 13 }} onClick={() => setCurrent('kanban')}>查看全部 <ChevronRight size={14} /></Button>
                    </div>
                    <Row gutter={[12, 12]}>
                      {openTasks.map((task, i) => (
                        <Col xs={24} sm={12} key={task.id}>
                          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                            onClick={() => { setSelectedTask(task); setTaskModalOpen(true); }}
                            style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 8, padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}>
                            <div>
                              <Text style={{ fontSize: 13, fontWeight: 600, color: D.text, display: 'block', marginBottom: 6 }}>{task.title}</Text>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <PriorityBadge priority={task.priority} />
                                <TagBadge tag={task.tag} />
                              </div>
                            </div>
                            <AvatarChip user={task.assignee} size={30} />
                          </motion.div>
                        </Col>
                      ))}
                    </Row>
                  </motion.div>
                  {/* 图表 */}
                  <div style={{ marginTop: 28 }}><DashboardCharts /></div>
                </motion.div>
              )}

              {current === 'hazards' && (
                <motion.div key="hazards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <Hazards />
                </motion.div>
              )}

              {current === 'kanban' && (
                <motion.div key="kanban" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <motion.div variants={va.fadeUp(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ color: D.text, margin: 0 }}>看板</Title>
                    <Text style={{ color: D.textSec, fontSize: 13 }}>共 {Object.values(tasks).flat().length} 个任务</Text>
                  </motion.div>
                  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                    {KANBAN_COLS.map((col, i) => (
                      <motion.div key={col.key} variants={va.slideIn(i)} initial="hidden" animate="visible">
                        <KanbanColumn column={col} tasks={tasks[col.key] || []} onTaskClick={(task) => { setSelectedTask(task); setTaskModalOpen(true); }} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {current === 'team' && (
                <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <motion.div variants={va.fadeUp(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ color: D.text, margin: 0 }}>团队</Title>
                    <Text style={{ color: D.textSec, fontSize: 13 }}>共 4 位成员</Text>
                  </motion.div>
                  <Team />
                </motion.div>
              )}

              {current === 'docs' && (
                <motion.div key="docs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <motion.div variants={va.fadeUp(0)} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ color: D.text, margin: 0 }}>文档中心</Title>
                    <Text style={{ color: D.textSec, fontSize: 13 }}>项目文档与团队知识库</Text>
                  </motion.div>
                  <Documents />
                </motion.div>
              )}
            </AnimatePresence>
          </Content>
        </Layout>

        {/* 任务详情弹窗 */}
        <TaskModal task={selectedTask} open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      </Layout>
    </ConfigProvider>
  );
}
