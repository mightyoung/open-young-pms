// src/styles/theme.js
// PMS 设计 Token — 统一颜色系统和样式规范

export const colors = {
  // 背景层级（从深到浅）
  bg: {
    base: '#09090b',      // 最深背景
    page: '#18181b',      // 页面背景
    card: '#27272a',      // 卡片背景
    elevated: '#3f3f46',  // 悬浮/hover
    border: '#3f3f46',    // 边框
  },
  // 主色（靛蓝，比原来的 #3b82f6 更专业）
  accent: '#6366f1',
  accentHover: '#818cf8',
  // 语义色
  success: '#22c55e',
  successBg: '#22c55e15',
  warning: '#eab308',
  warningBg: '#eab30815',
  danger: '#ef4444',
  dangerBg: '#ef444415',
  // 文字
  text: {
    primary: '#e4e4e7',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
  },
  // 图表配色（按顺序循环使用）
  chart: ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'],
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
}

export const shadows = {
  card: '0 2px 8px rgba(0,0,0,0.3)',
  elevated: '0 4px 16px rgba(0,0,0,0.4)',
  modal: '0 8px 32px rgba(0,0,0,0.6)',
}

// 统一卡片样式
export const cardStyle = {
  background: colors.bg.card,
  border: `1px solid ${colors.bg.border}`,
  borderRadius: radius.lg,
}

// antd 组件暗色主题覆盖
export const antdTheme = {
  token: {
    colorPrimary: colors.accent,
    colorBgContainer: colors.bg.card,
    colorBgElevated: colors.bg.elevated,
    colorBorder: colors.bg.border,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.muted,
    borderRadius: radius.md,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
}

export default colors
