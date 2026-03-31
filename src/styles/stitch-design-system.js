/**
 * PMS 设计系统 - 基于 Stitch Azure Ethos 主题
 * 生成时间: 2026-03-30
 * 设计来源: Google Stitch AI
 */

export const STITCH_DESIGN_SYSTEM = {
  // 设计系统元数据
  name: 'PMS Azure Ethos',
  version: '1.0.0',
  source: 'Google Stitch AI',
  projectId: '8004525097705286938',

  // 字体
  fonts: {
    headline: 'Manrope',
    body: 'Inter',
    label: 'Inter',
  },

  // 圆角
  roundness: 'ROUND_FOUR',

  // 颜色模式
  colorMode: 'LIGHT',

  // 主色调
  customColor: '#0056b3',

  // 颜色表
  colors: {
    // 主色系
    primary: '#115cb9',
    primaryContainer: '#d7e2ff',
    primaryDim: '#0050a7',
    primaryFixed: '#d7e2ff',
    primaryFixedDim: '#c2d5ff',
    onPrimary: '#f7f7ff',
    onPrimaryContainer: '#004fa6',
    onPrimaryFixed: '#003d83',
    onPrimaryFixedVariant: '#0959b6',

    // 次要色系
    secondary: '#5d5f65',
    secondaryContainer: '#e2e2e9',
    secondaryDim: '#515359',
    secondaryFixed: '#e2e2e9',
    secondaryFixedDim: '#d4d4db',
    onSecondary: '#f9f8ff',
    onSecondaryContainer: '#505157',
    onSecondaryFixed: '#3d3f45',
    onSecondaryFixedVariant: '#5a5b61',

    // 第三色系
    tertiary: '#5e5c78',
    tertiaryContainer: '#d5d1f2',
    tertiaryDim: '#52506b',
    tertiaryFixed: '#d5d1f2',
    tertiaryFixedDim: '#c7c3e3',
    onTertiary: '#fcf7ff',
    onTertiaryContainer: '#484661',
    onTertiaryFixed: '#35334d',
    onTertiaryFixedVariant: '#52506b',

    // 表面色系
    background: '#fcf8f9',
    surface: '#fcf8f9',
    surfaceBright: '#fcf8f9',
    surfaceDim: '#dbd9dd',
    surfaceContainer: '#f0edef',
    surfaceContainerHigh: '#eae7ea',
    surfaceContainerHighest: '#e4e2e5',
    surfaceContainerLow: '#f6f3f4',
    surfaceContainerLowest: '#ffffff',
    surfaceVariant: '#e4e2e5',
    surfaceTint: '#115cb9',
    onBackground: '#323235',
    onSurface: '#323235',
    onSurfaceVariant: '#5f5f61',

    // 错误色系
    error: '#9f403d',
    errorContainer: '#fe8983',
    errorDim: '#4e0309',
    onError: '#fff7f6',
    onErrorContainer: '#752121',

    // 轮廓色
    outline: '#7b7a7d',
    outlineVariant: '#b3b1b4',

    // 反色
    inverseOnSurface: '#9e9c9d',
    inversePrimary: '#659dfe',
    inverseSurface: '#0e0e0f',
  },

  // 角色颜色（与 permissions.js 保持一致）
  roleColors: {
    super_admin: '#ff4d4f',
    company_leader: '#1890ff',
    dept_leader: '#722ed1',
    section_chief: '#faad14',
    project_manager: '#52c41a',
    field_staff: '#13c2c2',
  },

  // 状态颜色
  statusColors: {
    active: '#52c41a',
    planning: '#1890ff',
    completed: '#8c8c8c',
    pending: '#faad14',
    inProgress: '#1890ff',
    resolved: '#52c41a',
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
    idle: '#52c41a',
    in_use: '#1890ff',
    maintenance: '#faad14',
  },

  // 阴影
  shadows: {
    // 柔和阴影（用于卡片）
    soft: '0 2px 8px rgba(14, 14, 15, 0.04)',
    // 标准阴影（用于浮动元素）
    standard: '0 4px 16px rgba(14, 14, 15, 0.08)',
    // 环境阴影（用于模态框）
    ambient: '0 20px 40px rgba(14, 14, 15, 0.05)',
  },
}

// 导出为 CSS 变量
export const CSS_VARIABLES = `
  :root {
    /* 主色 */
    --color-primary: ${STITCH_DESIGN_SYSTEM.colors.primary};
    --color-primary-container: ${STITCH_DESIGN_SYSTEM.colors.primaryContainer};
    --color-on-primary: ${STITCH_DESIGN_SYSTEM.colors.onPrimary};
    --color-on-primary-container: ${STITCH_DESIGN_SYSTEM.colors.onPrimaryContainer};
    
    /* 次要色 */
    --color-secondary: ${STITCH_DESIGN_SYSTEM.colors.secondary};
    --color-secondary-container: ${STITCH_DESIGN_SYSTEM.colors.secondaryContainer};
    --color-on-secondary: ${STITCH_DESIGN_SYSTEM.colors.onSecondary};
    
    /* 表面色 */
    --color-background: ${STITCH_DESIGN_SYSTEM.colors.background};
    --color-surface: ${STITCH_DESIGN_SYSTEM.colors.surface};
    --color-surface-container: ${STITCH_DESIGN_SYSTEM.colors.surfaceContainer};
    --color-surface-container-high: ${STITCH_DESIGN_SYSTEM.colors.surfaceContainerHigh};
    --color-surface-container-lowest: ${STITCH_DESIGN_SYSTEM.colors.surfaceContainerLowest};
    
    /* 文字色 */
    --color-on-background: ${STITCH_DESIGN_SYSTEM.colors.onBackground};
    --color-on-surface: ${STITCH_DESIGN_SYSTEM.colors.onSurface};
    --color-on-surface-variant: ${STITCH_DESIGN_SYSTEM.colors.onSurfaceVariant};
    
    /* 轮廓色 */
    --color-outline: ${STITCH_DESIGN_SYSTEM.colors.outline};
    --color-outline-variant: ${STITCH_DESIGN_SYSTEM.colors.outlineVariant};
    
    /* 错误色 */
    --color-error: ${STITCH_DESIGN_SYSTEM.colors.error};
    --color-error-container: ${STITCH_DESIGN_SYSTEM.colors.errorContainer};
    
    /* 字体 */
    --font-headline: '${STITCH_DESIGN_SYSTEM.fonts.headline}', sans-serif;
    --font-body: '${STITCH_DESIGN_SYSTEM.fonts.body}', sans-serif;
    --font-label: '${STITCH_DESIGN_SYSTEM.fonts.label}', sans-serif;
    
    /* 圆角 */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* 阴影 */
    --shadow-soft: ${STITCH_DESIGN_SYSTEM.shadows.soft};
    --shadow-standard: ${STITCH_DESIGN_SYSTEM.shadows.standard};
    --shadow-ambient: ${STITCH_DESIGN_SYSTEM.shadows.ambient};
  }
`

export default STITCH_DESIGN_SYSTEM
