import React from 'react'
import { CheckCircleOutlined, CloseCircleOutlined, InboxOutlined, SearchOutlined } from '@ant-design/icons'
import { colors } from '../styles/theme'

/**
 * 统一空状态组件
 * @param {string} type - 场景类型: 'list' | 'search' | 'error' | 'success' | 'custom'
 * @param {string} title - 主标题
 * @param {string} description - 描述文案
 * @param {ReactNode} action - 操作按钮
 * @param {ReactNode} icon - 自定义图标
 * @param {object} style - 容器样式
 */
export default function EmptyState({ type = 'list', title, description, action, icon, emoji, style }) {
  const presets = {
    list: { icon: <InboxOutlined />, title: '暂无数据', description: '暂无相关记录' },
    search: { icon: <SearchOutlined />, title: '未找到结果', description: '换个关键词试试' },
    error: { icon: <CloseCircleOutlined />, title: '加载失败', description: '请稍后重试' },
    success: { icon: <CheckCircleOutlined />, title: '操作成功', description: '' },
  }
  const config = presets[type] || presets.list

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: colors.text.muted,
        ...style,
      }}
    >
      <div style={{ color: colors.accent, fontSize: 42, lineHeight: 1, marginBottom: 16 }}>
        {icon || emoji || config.icon}
      </div>
      <div
        style={{
          color: colors.text.secondary,
          fontSize: 15,
          fontWeight: 600,
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
