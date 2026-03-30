import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const StatCard = ({ title, value, trend, icon: Icon, delay = 0 }) => {
  const isPositive = trend > 0
  const isNegative = trend < 0
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -2, transition: { duration: 0.25 } }}
      style={{
        background: 'rgba(26, 26, 34, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 20,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 8,
            fontWeight: 500,
          }}>
            {title}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {value}
          </div>
        </div>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={22} color="#115cb9" />
        </div>
      </div>

      {trend !== 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 12,
          fontSize: 13,
          color: isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'rgba(255,255,255,0.5)',
        }}>
          <TrendIcon size={14} />
          <span>{Math.abs(trend)}%</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>较上周</span>
        </div>
      )}
    </motion.div>
  )
}
