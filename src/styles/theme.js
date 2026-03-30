// PMS 设计 Token — 国企标准蓝白风
// 主题色: #115cb9 | 全中文排版 | 专业稳重高效

export const colors = {
  // 背景层级
  bg: {
    base: '#f5f7fa',      // 页面背景
    page: '#f5f7fa',      // 卡片容器背景
    card: '#ffffff',      // 卡片背景
    elevated: '#ffffff',  // 悬浮元素
    border: '#e5e7eb',    // 边框
  },
  // 主色
  accent: '#115cb9',
  accentHover: '#3377cc',
  accentLight: '#d7e2ff',
  // 语义色
  success: '#52c41a',
  successBg: '#f6ffed',
  warning: '#faad14',
  warningBg: '#fffbe6',
  danger: '#ff4d4f',
  dangerBg: '#fff2f0',
  // 文字
  text: {
    primary: '#1a1a2e',
    secondary: '#5f5f61',
    muted: '#8c8c8c',
    disabled: '#bfbfbf',
  },
  // 侧边栏
  sidebar: {
    bg: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#8c8c8c',
    active: '#eef3ff',
    hover: '#f5f7fa',
    activeText: '#115cb9',
  },
  // 图表配色
  chart: ['#115cb9', '#52c41a', '#faad14', '#ff4d4f', '#1890ff', '#722ed1', '#ec4899', '#14b8a6'],
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
  md: 8,
  lg: 12,
  xl: 16,
}

export const shadows = {
  card: '0 1px 2px rgba(0,0,0,0.04)',
  elevated: '0 4px 12px rgba(0,0,0,0.08)',
  modal: '0 8px 32px rgba(0,0,0,0.12)',
}

// antd 组件蓝白主题覆盖
export const antdTheme = {
  token: {
    colorPrimary: colors.accent,
    colorBgContainer: colors.bg.card,
    colorBgElevated: colors.bg.elevated,
    colorBorder: colors.bg.border,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    borderRadius: radius.md,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
}

export default colors
