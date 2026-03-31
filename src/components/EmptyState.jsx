import React from 'react'
import { colors } from '../styles/theme'

/**
 * 统一空状态组件
 * @param {string} type - 场景类型: 'list' | 'search' | 'error' | 'success' | 'custom'
 * @param {string} title - 主标题
 * @param {string} description - 描述文案
 * @param {ReactNode} action - 操作按钮
 * @param {string} emoji - 自定义 emoji 覆盖
 */
export default function EmptyState({ type = 'list', title, description, action, emoji }) {
  const presets = {
    list: { emoji: '📭', title: '暂无数据', description: '暂无相关记录' },
    search: { emoji: '🔍', title: '未找到结果', description: '换个关键词试试' },
    error: { emoji: '❌', title: '加载失败', description: '请稍后重试' },
    success: { emoji: '✅', title: '操作成功', description: '' },
  }

  const config = presets[type] || presets.list

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: colors.text.muted,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji || config.emoji}</div>
      <div
        style={{
          color: colors.text.secondary,
          fontSize: 15,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {title || config.title}
      </div>
      {(description || config.description) && (
        <div
          style={{
            color: colors.text.muted,
            fontSize: 13,
            marginBottom: action ? 20 : 0,
          }}
        >
          {description || config.description}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
