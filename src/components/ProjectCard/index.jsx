import { memo } from 'react'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, ArrowRight } from 'lucide-react'

const STATUS_COLORS = {
  normal: 'oklch(70% 0.18 145)',
  warning: 'oklch(80% 0.16 85)',
  danger: 'oklch(65% 0.2 25)',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
}

const ProgressRow = memo(function ProgressRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'oklch(42% 0.01 250)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        style={{
          height: 4,
          background: 'oklch(28% 0.01 250 / 0.4)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: value / 100 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
          style={{ transformOrigin: 'left', height: '100%', background: color, borderRadius: 2 }}
        />
      </div>
    </div>
  )
})

const MetaRow = memo(function MetaRow({ memberCount, issueCount }) {
  const hasIssues = issueCount > 0
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '8px 12px',
        background: 'oklch(22% 0.01 250)',
        borderRadius: 8,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'oklch(65% 0.01 250)' }}>
        <Users size={13} color="oklch(65% 0.01 250)" />
        {memberCount}人
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: hasIssues ? 'oklch(80% 0.16 85)' : 'oklch(65% 0.01 250)',
        }}
      >
        <AlertTriangle
          size={13}
          color={hasIssues ? 'oklch(80% 0.16 85)' : 'oklch(65% 0.01 250)'}
        />
        {issueCount}个
      </span>
    </div>
  )
})

/**
 * ProjectCard — 项目卡片
 * No card border. Left color bar only. Extracted sub-components (rerender-no-inline-components).
 * Font: Plus Jakarta Sans (headings) — not Inter.
 */
export const ProjectCard = memo(function ProjectCard({ project, onEnter, onGantt, onIssues }) {
  const statusColor = STATUS_COLORS[project.status] || STATUS_COLORS.normal

  return (
    <motion.div
      variants={item}
      whileHover={{ x: 3, transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] } }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onEnter?.(project)}
      style={{
        background: 'oklch(18% 0.01 250)',
        borderLeft: `3px solid ${statusColor}`,
        cursor: 'pointer',
        outline: 'none',
        position: 'relative',
      }}
    >
      <div style={{ padding: '16px 16px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: statusColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: 15,
              fontWeight: 700,
              color: 'oklch(92% 0.01 250)',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.name}
          </span>
        </div>

        <ProgressRow label="进度" value={project.progress} color={statusColor} />
        <ProgressRow label="预算" value={project.budgetRate} color="oklch(65% 0.13 250)" />

        <MetaRow memberCount={project.memberCount} issueCount={project.issueCount} />

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <motion.button
            whileHover={{ backgroundColor: 'oklch(60% 0.15 250)' }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => { e.stopPropagation(); onEnter?.(project) }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '7px 0',
              background: 'oklch(60% 0.15 250)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            进入项目 <ArrowRight size={13} />
          </motion.button>
          {onGantt && (
            <motion.button
              whileHover={{ backgroundColor: 'oklch(28% 0.01 250 / 0.8)' }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onGantt(project) }}
              title="甘特图"
              style={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'oklch(22% 0.01 250)',
                color: 'oklch(65% 0.01 250)',
                border: '1px solid oklch(28% 0.01 250 / 0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
                transition: 'background-color 0.15s ease',
              }}
            >
              📊
            </motion.button>
          )}
          {onIssues && (
            <motion.button
              whileHover={{ backgroundColor: 'oklch(28% 0.01 250 / 0.8)' }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onIssues(project) }}
              title="问题"
              style={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'oklch(22% 0.01 250)',
                color: 'oklch(65% 0.01 250)',
                border: '1px solid oklch(28% 0.01 250 / 0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
                transition: 'background-color 0.15s ease',
              }}
            >
              ⚠️
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
})

export { container as ProjectCardContainer, item as ProjectCardItem }
export default ProjectCard
