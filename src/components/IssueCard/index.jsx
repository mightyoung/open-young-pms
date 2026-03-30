import { memo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, User } from 'lucide-react'

const URGENCY_COLORS = {
  urgent: 'oklch(65% 0.2 25)',
  important: 'oklch(80% 0.16 85)',
  normal: 'oklch(65% 0.13 250)',
}

const URGENCY_LABELS = { urgent: '紧急', important: '重要', normal: '一般' }

const STATUS_STEPS = [
  { key: 'pending', label: '待指派', color: 'oklch(42% 0.01 250)' },
  { key: 'assigned', label: '已指派', color: 'oklch(65% 0.13 250)' },
  { key: 'fixing', label: '整改中', color: 'oklch(80% 0.16 85)' },
  { key: 'resolved', label: '已验收', color: 'oklch(70% 0.18 145)' },
]

const TYPE_DOTS = {
  safety:   { color: 'oklch(65% 0.2 25)',  label: '安全' },
  quality:   { color: 'oklch(80% 0.16 85)',  label: '质量' },
  progress:  { color: 'oklch(65% 0.13 250)', label: '进度' },
  equipment: { color: 'oklch(60% 0.15 270)', label: '设备' },
  environment: { color: 'oklch(70% 0.18 145)', label: '环境' },
  other:     { color: 'oklch(42% 0.01 250)', label: '其他' },
}

function getTrendIcon(trend) {
  return trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat'
}

/**
 * StatusStepper — extracted to module level (vercel: rerender-no-inline-components)
 * Visualizes issue lifecycle: pending → assigned → fixing → resolved
 */
const StatusStepper = memo(function StatusStepper({ currentStatusKey }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === currentStatusKey)
  const currentLabel = STATUS_STEPS[currentIdx]?.label ?? ''

  return (
    <div aria-label={`状态: ${currentLabel}`} style={{ display: 'flex', alignItems: 'center' }}>
      {STATUS_STEPS.map((step, idx) => {
        const isPast = idx < currentIdx
        const isCurrent = idx === currentIdx
        const dotColor = isPast || isCurrent ? step.color : 'oklch(28% 0.01 250 / 0.4)'
        const isLast = idx === STATUS_STEPS.length - 1

        return (
          <div
            key={step.key}
            style={{ display: 'flex', alignItems: 'center', flex: isLast ? undefined : 1 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: isCurrent ? 8 : 6,
                  height: isCurrent ? 8 : 6,
                  borderRadius: '50%',
                  background: dotColor,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  color: isCurrent ? dotColor : 'oklch(42% 0.01 250)',
                  fontWeight: isCurrent ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: isPast ? STATUS_STEPS[idx].color : 'oklch(28% 0.01 250 / 0.3)',
                  margin: '0 2px',
                  marginBottom: 14,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})

/**
 * IssueCard — 问题卡片
 * No card border. Left color bar + StatusStepper extracted to module scope.
 * Font: Plus Jakarta Sans — not Inter.
 */
export const IssueCard = memo(function IssueCard({ issue, onAssign, onView }) {
  const urgencyColor = URGENCY_COLORS[issue.urgency] || URGENCY_COLORS.normal
  const typeInfo = TYPE_DOTS[issue.type] || TYPE_DOTS.other

  return (
    <motion.div
      whileHover={{ x: 3, transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] } }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onView?.(issue)}
      style={{
        background: 'oklch(18% 0.01 250)',
        borderLeft: `3px solid ${urgencyColor}`,
        cursor: 'pointer',
        outline: 'none',
        position: 'relative',
      }}
    >
      <div style={{ padding: '16px 14px 16px 18px' }}>
        {/* Type + Urgency row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: typeInfo.color,
              fontWeight: 600,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: typeInfo.color,
                flexShrink: 0,
              }}
            />
            {typeInfo.label}
          </span>
          <span style={{ color: 'oklch(28% 0.01 250)', fontSize: 11 }}>|</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: urgencyColor,
              background: `${urgencyColor}20`,
            }}
          >
            {URGENCY_LABELS[issue.urgency] || '一般'}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: 'oklch(92% 0.01 250)',
            lineHeight: 1.4,
            marginBottom: 10,
          }}
        >
          {issue.title}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11, color: 'oklch(42% 0.01 250)' }}>项目：</span>
            <span style={{ fontSize: 12, color: 'oklch(65% 0.01 250)' }}>{issue.project}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <User size={12} color="oklch(42% 0.01 250)" />
            <span style={{ fontSize: 12, color: 'oklch(65% 0.01 250)' }}>{issue.reporter}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={12} color="oklch(42% 0.01 250)" />
            <span style={{ fontSize: 12, color: 'oklch(65% 0.01 250)' }}>{issue.location}</span>
          </div>
        </div>

        {/* Status flow — extracted component, module-level */}
        <div style={{ marginBottom: 12 }}>
          <StatusStepper currentStatusKey={issue.status} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {onAssign && issue.status === 'pending' && (
            <motion.button
              whileHover={{ backgroundColor: 'oklch(60% 0.15 250)' }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onAssign(issue) }}
              style={{
                flex: 1,
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
              指派
            </motion.button>
          )}
          {onView && (
            <motion.button
              whileHover={{ backgroundColor: 'oklch(22% 0.01 250)' }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onView(issue) }}
              style={{
                flex: 1,
                padding: '7px 0',
                background: 'oklch(22% 0.01 250)',
                color: 'oklch(92% 0.01 250)',
                border: '1px solid oklch(28% 0.01 250 / 0.3)',
                borderRadius: 8,
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              查看详情
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
})

export default IssueCard
