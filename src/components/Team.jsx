/**
 * Team.jsx — 团队页面
 * 包含团队统计、成员网格、工作分布图表
 */
import React, { useState } from 'react';
import { Row, Col, Avatar, Tag, Tooltip, Typography } from 'antd';
import { motion } from 'framer-motion';
import {
  Users, Wifi, Clock, CheckCircle2, Star, TrendingUp, ChevronDown
} from 'lucide-react';

const { Text } = Typography;

// ============================================================
// 设计系统 (与 App.jsx 保持一致)
// ============================================================
const DESIGN = {
  bg: '#0a0a0e',
  surface: '#13131a',
  card: '#1a1a22',
  elevated: '#22222c',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(99,102,241,0.3)',
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentGlow: 'rgba(99,102,241,0.25)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#e4e4e7',
  textSec: '#a1a1aa',
  textMuted: '#52525b',
};

// 动画变体
const va = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
    }),
  },
};

// ============================================================
// 模拟数据
// ============================================================
const TEAM_STATS = {
  total: 4,
  online: 3,
  activeThisWeek: 4,
  completedThisWeek: 12,
};

const SKILL_COLORS = {
  React: '#61dafb',
  TypeScript: '#3178c6',
  Node: '#339933',
  Python: '#3776ab',
  Figma: '#f24e1e',
  CSS: '#1572b6',
  Git: '#f05032',
  Docker: '#2496ed',
  CI: '#22c55e',
  SQL: '#336791',
  Redux: '#764abc',
  Vue: '#4fc08d',
};

const TEAM_MEMBERS = [
  {
    id: 'zm',
    name: '张小明',
    role: '前端开发',
    color: '#6366f1',
    initials: '张',
    online: true,
    tasksCompleted: 4,
    lastActive: '刚刚',
    skills: ['React', 'TypeScript', 'CSS', 'Git'],
  },
  {
    id: 'lh',
    name: '李华',
    role: '后端开发',
    color: '#22c55e',
    initials: '李',
    online: true,
    tasksCompleted: 5,
    lastActive: '5分钟前',
    skills: ['Node', 'Python', 'SQL', 'Docker'],
  },
  {
    id: 'wf',
    name: '王芳',
    role: 'UI设计师',
    color: '#ec4899',
    initials: '王',
    online: false,
    tasksCompleted: 2,
    lastActive: '2小时前',
    skills: ['Figma', 'CSS', 'React'],
  },
  {
    id: 'zq',
    name: '赵强',
    role: '测试工程师',
    color: '#f59e0b',
    initials: '赵',
    online: true,
    tasksCompleted: 3,
    lastActive: '刚刚',
    skills: ['Git', 'CI', 'Docker', 'Node'],
  },
];

const WORK_DISTRIBUTION = [
  { name: '张小明', tasks: 8, completed: 4 },
  { name: '李华', tasks: 12, completed: 5 },
  { name: '王芳', tasks: 6, completed: 2 },
  { name: '赵强', tasks: 9, completed: 3 },
];

// ============================================================
// 统计卡片
// ============================================================
function TeamStatCard({ title, value, icon, color, delay = 0 }) {
  return (
    <motion.div
      variants={va.fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300 } }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${DESIGN.card} 0%, ${DESIGN.elevated} 100%)`,
        border: `1px solid ${DESIGN.border}`,
        borderRadius: 16,
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.25s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = DESIGN.borderHover}
      onMouseLeave={e => e.currentTarget.style.borderColor = DESIGN.border}
      >
        {/* 装饰 */}
        <div style={{
          position: 'absolute', top: -24, right: -24,
          width: 90, height: 90, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <Text style={{ color: DESIGN.textSec, fontSize: 12, display: 'block', marginBottom: 8 }}>
              {title}
            </Text>
            <span style={{ fontSize: 30, fontWeight: 800, color: DESIGN.text, lineHeight: 1 }}>
              {value}
            </span>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
          }}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 成员卡片
// ============================================================
function MemberCard({ member, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={va.fadeUp}
      custom={delay}
      initial="hidden"
      animate="visible"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: DESIGN.card,
        border: `1px solid ${hovered ? DESIGN.borderHover : DESIGN.border}`,
        borderRadius: 18,
        padding: 24,
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 16px 48px ${DESIGN.accentGlow}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: `radial-gradient(circle at top right, ${member.color}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        {/* 头像 + 在线状态 */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Avatar
            size={72}
            style={{
              background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}aa 100%)`,
              fontSize: 26, fontWeight: 800,
              border: `3px solid ${DESIGN.card}`,
              boxShadow: `0 0 24px ${member.color}40`,
            }}
          >
            {member.initials}
          </Avatar>
          {/* 在线指示灯 */}
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 16, height: 16, borderRadius: '50%',
            background: member.online ? DESIGN.success : DESIGN.textMuted,
            border: `3px solid ${DESIGN.card}`,
            boxShadow: member.online ? `0 0 8px ${DESIGN.success}` : 'none',
          }} />
        </div>

        {/* 名字 + 角色 */}
        <Text style={{ color: DESIGN.text, fontWeight: 700, fontSize: 16, display: 'block', marginBottom: 4 }}>
          {member.name}
        </Text>
        <Text style={{ color: DESIGN.textSec, fontSize: 13, display: 'block', marginBottom: 16 }}>
          {member.role}
        </Text>

        {/* 本周完成 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: `${member.color}12`,
          border: `1px solid ${member.color}25`,
          borderRadius: 20,
          padding: '6px 14px',
          marginBottom: 16,
        }}>
          <CheckCircle2 size={14} color={member.color} />
          <span style={{ color: member.color, fontWeight: 700, fontSize: 18 }}>{member.tasksCompleted}</span>
          <span style={{ color: DESIGN.textMuted, fontSize: 12 }}>本周完成</span>
        </div>

        {/* 技能标签 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {member.skills.map(skill => {
            const sc = SKILL_COLORS[skill] || DESIGN.accent;
            return (
              <span
                key={skill}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 10px', borderRadius: 8,
                  fontSize: 11, fontWeight: 600,
                  background: `${sc}15`,
                  color: sc,
                  border: `1px solid ${sc}25`,
                }}
              >
                {skill}
              </span>
            );
          })}
        </div>

        {/* 最近活跃 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color={DESIGN.textMuted} />
          <Text style={{ color: DESIGN.textMuted, fontSize: 12 }}>
            {member.online ? (
              <span style={{ color: DESIGN.success }}>● 在线</span>
            ) : (
              `活跃 ${member.lastActive}`
            )}
          </Text>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 团队工作分布柱状图
// ============================================================
function WorkDistributionChart() {
  const maxTasks = Math.max(...WORK_DISTRIBUTION.map(d => d.tasks));
  const colors = ['#6366f1', '#22c55e', '#ec4899', '#f59e0b'];

  return (
    <div style={{
      background: DESIGN.card,
      border: `1px solid ${DESIGN.border}`,
      borderRadius: 18,
      padding: '22px 26px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: DESIGN.textSec, fontSize: 13, fontWeight: 600 }}>
          团队工作分布
        </Text>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: DESIGN.accent }} />
            <Text style={{ color: DESIGN.textMuted, fontSize: 11 }}>总任务</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: DESIGN.success }} />
            <Text style={{ color: DESIGN.textMuted, fontSize: 11 }}>已完成</Text>
          </div>
        </div>
      </div>

      {/* 柱状图 */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        gap: 16, height: 140,
        paddingBottom: 8,
      }}>
        {WORK_DISTRIBUTION.map((d, i) => {
          const totalH = (d.tasks / maxTasks) * 110;
          const doneH = (d.completed / maxTasks) * 110;
          return (
            <div key={d.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {/* 标签 */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Tooltip title={`已完成 ${d.completed}/${d.tasks}`}>
                  <span style={{ color: DESIGN.success, fontSize: 12, fontWeight: 700 }}>{d.completed}</span>
                </Tooltip>
                <span style={{ color: DESIGN.textMuted, fontSize: 11 }}>/</span>
                <Tooltip title={`总任务 ${d.tasks}`}>
                  <span style={{ color: DESIGN.textSec, fontSize: 12 }}>{d.tasks}</span>
                </Tooltip>
              </div>
              {/* 柱子组 */}
              <div style={{ width: '100%', display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'flex-end', height: 100 }}>
                {/* 背景柱子 */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: totalH }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                  style={{
                    width: 28, borderRadius: '6px 6px 0 0',
                    background: `${colors[i]}18`,
                    border: `1px solid ${colors[i]}30`,
                  }}
                />
                {/* 完成柱子 */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: doneH }}
                  transition={{ duration: 0.7, delay: i * 0.08 + 0.1, ease: 'easeOut' }}
                  style={{
                    width: 28, borderRadius: '6px 6px 0 0',
                    background: `linear-gradient(180deg, ${colors[i]} 0%, ${colors[i]}80 100%)`,
                    boxShadow: `0 0 12px ${colors[i]}40`,
                  }}
                />
              </div>
              {/* 名字 */}
              <Text style={{ color: DESIGN.textSec, fontSize: 11, fontWeight: 500, textAlign: 'center' }}>
                {d.name.slice(0, 2)}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 团队页主组件
// ============================================================
export default function Team() {
  return (
    <div>
      {/* 团队统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <TeamStatCard
            title="团队成员"
            value={TEAM_STATS.total}
            icon={<Users size={20} />}
            color={DESIGN.accent}
            delay={0}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <TeamStatCard
            title="当前在线"
            value={TEAM_STATS.online}
            icon={<Wifi size={20} />}
            color={DESIGN.success}
            delay={1}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <TeamStatCard
            title="本周活跃"
            value={TEAM_STATS.activeThisWeek}
            icon={<Clock size={20} />}
            color={DESIGN.warning}
            delay={2}
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <TeamStatCard
            title="本周完成"
            value={TEAM_STATS.completedThisWeek}
            icon={<CheckCircle2 size={20} />}
            color="#8b5cf6"
            delay={3}
          />
        </Col>
      </Row>

      {/* 成员网格 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {TEAM_MEMBERS.map((member, i) => (
          <Col key={member.id} xs={24} sm={12} md={12} lg={6}>
            <MemberCard member={member} delay={i + 4} />
          </Col>
        ))}
      </Row>

      {/* 工作分布柱状图 */}
      <WorkDistributionChart />
    </div>
  );
}
