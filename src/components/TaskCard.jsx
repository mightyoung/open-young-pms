import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Paperclip, Clock, MoreHorizontal } from 'lucide-react'

const priorityColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#115cb9',
}

const typeLabels = {
  feature: '功能',
  optimization: '优化',
  design: '设计',
  testing: '测试',
}

export const TaskCard = ({ task, onClick, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } }}
      onClick={() => onClick(task)}
      style={{
        background: 'rgba(26, 26, 34, 0.9)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 14,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: priorityColors[task.priority],
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 4,
          background: `${priorityColors[task.priority]}20`,
          color: priorityColors[task.priority],
        }}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </span>
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#115cb9',
        }}>
          {typeLabels[task.type]}
        </span>
      </div>

      <h4 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#fff',
        marginBottom: 12,
        lineHeight: 1.4,
      }}>
        {task.title}
      </h4>

      {task.status === 'in-progress' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
          }}>
            <span>进度</span>
            <span>{task.progress}%</span>
          </div>
          <div style={{
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #115cb9, #115cb9)',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
          }}>
            <MessageSquare size={12} />
            <span>{task.comments}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
          }}>
            <Paperclip size={12} />
            <span>{task.attachments}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
          }}>
            <Clock size={12} />
            <span>{task.storyPoints}pt</span>
          </div>
        </div>

        <div style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: task.assignee.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
        }}>
          {task.assignee.avatar}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: 6,
          border: 'none',
          background: 'rgba(255,255,255,0.05)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
        className="task-card-action"
      >
        <MoreHorizontal size={14} />
      </motion.button>
    </motion.div>
  )
}
