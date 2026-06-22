// PMS 设计 Token - 冷静企业运营风
// 主题色: #0f766e | 全中文排版 | 专业稳重高效

export const colors = {
  bg: {
    base: '#f4f7f7',
    page: '#f4f7f7',
    card: '#ffffff',
    elevated: '#ffffff',
    border: '#dbe3e1',
  },
  accent: '#0f766e',
  accentHover: '#0f5f59',
  accentLight: '#ccfbf1',
  success: '#52c41a',
  successBg: '#f6ffed',
  warning: '#faad14',
  warningBg: '#fffbe6',
  danger: '#ff4d4f',
  dangerBg: '#fff2f0',
  text: {
    primary: '#10201f',
    secondary: '#526361',
    muted: '#7a8a87',
    disabled: '#bfbfbf',
  },
  sidebar: {
    bg: '#ffffff',
    text: '#10201f',
    textMuted: '#7a8a87',
    active: '#ecfdf5',
    hover: '#f4f7f7',
    activeText: '#0f766e',
  },
  chart: ['#0f766e', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#15803d', '#be123c'],
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
  card: '0 1px 2px rgba(15, 32, 31, 0.04)',
  elevated: '0 8px 24px rgba(15, 32, 31, 0.08)',
  modal: '0 18px 42px rgba(15, 32, 31, 0.12)',
}

export const antdTheme = {
  token: {
    colorPrimary: colors.accent,
    colorBgContainer: colors.bg.card,
    colorBgElevated: colors.bg.elevated,
    colorBgLayout: colors.bg.base,
    colorBorder: colors.bg.border,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    borderRadius: radius.md,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Layout: {
      headerBg: colors.bg.card,
      siderBg: colors.sidebar.bg,
      bodyBg: colors.bg.base,
    },
    Menu: {
      itemBorderRadius: radius.md,
      itemSelectedBg: colors.sidebar.active,
      itemSelectedColor: colors.sidebar.activeText,
      itemHoverBg: colors.sidebar.hover,
      itemHoverColor: colors.sidebar.text,
    },
    Card: {
      borderRadiusLG: radius.lg,
    },
    Button: {
      borderRadius: radius.md,
      controlHeight: 36,
    },
  },
}

export default colors
