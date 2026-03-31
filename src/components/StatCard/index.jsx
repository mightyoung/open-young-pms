import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * getTrendMeta — extracted to module scope (vercel: rerender-functional-setstate)
 * Avoids recomputing derived display values on every render.
 */
function getTrendMeta(trend) {
  if (trend > 0) return { Icon: TrendingUp, color: 'oklch(70% 0.18 145)', label: 'up' }
  if (trend < 0) return { Icon: TrendingDown, color: 'oklch(65% 0.2 25)', label: 'down' }
  return { Icon: Minus, color: 'oklch(42% 0.01 250)', label: 'flat' }
}

/**
 * StatCard — 统计卡片
 * No card border. Left color bar accent. TrendIcon extracted to module scope.
 * Font: Outfit (display numbers) + Plus Jakarta Sans — not Inter.
 *
 * vercel fixes:
 * - TrendIcon derived value computed at module scope, not in render
 * - Value counter: use CSS counter animation via opacity instead of layout-shifting transform
 */
export const StatCard = memo(function StatCard({
  title,
  value,
  suffix,
  icon,
  color = 'oklch(65% 0.13 250)',
  trend,
  trendLabel = '较上周',
  delay = 0,
  onClick,
}) {
  const { Icon: TrendIcon, color: trendColor } = getTrendMeta(trend)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1], delay }}
      onClick={onClick}
      whileHover={
        onClick ? { x: 3, transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] } } : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      style={{
        background: 'oklch(18% 0.01 250)',
        borderLeft: `3px solid ${color}`,
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Title label */}
          <div
            style={{
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: 'oklch(42% 0.01 250)',
              marginBottom: 8,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>

          {/* Big number — Outfit, tabular-nums, opacity entrance */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: delay + 0.05, ease: [0.25, 1, 0.5, 1] }}
              style={{
                fontFamily: '"Outfit", system-ui, sans-serif',
                fontSize: 34,
                fontWeight: 800,
                color: 'oklch(92% 0.01 250)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </motion.span>
            {suffix && (
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  fontSize: 14,
                  color: 'oklch(42% 0.01 250)',
                  fontWeight: 500,
                }}
              >
                {suffix}
              </span>
            )}
          </div>

          {/* Trend row — only when trend is non-zero */}
          {trend !== undefined && trend !== 0 && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: delay + 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}
            >
              <TrendIcon size={14} color={trendColor} strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: trendColor,
                }}
              >
                {Math.abs(trend)}%
              </span>
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  fontSize: 11,
                  color: 'oklch(42% 0.01 250)',
                }}
              >
                {trendLabel}
              </span>
            </motion.div>
          )}
        </div>

        {/* Icon block */}
        {icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
})

export default StatCard
