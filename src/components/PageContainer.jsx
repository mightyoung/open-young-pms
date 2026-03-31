import React from 'react'
import { Card, Typography, Space, Spin } from 'antd'
import { colors, spacing, radius } from '../styles/theme'

const { Title, Text } = Typography

/**
 * 统一页面容器组件
 * @param {string} title - 页面标题
 * @param {string|ReactNode} description - 副标题/描述
 * @param {ReactNode} extra - 右上角操作按钮
 * @param {ReactNode} filters - 筛选区（搜索/选择器等）
 * @param {ReactNode} children - 页面内容
 * @param {boolean} loading - 加载状态
 * @param {ReactNode} empty - 空状态内容（loading=false 且 children 为空时显示）
 * @param {object} style - 自定义样式
 */
export default function PageContainer({
  title,
  description,
  extra,
  filters,
  children,
  loading = false,
  empty,
  style,
}) {
  const containerStyle = {
    padding: spacing.xl,
    minHeight: '100vh',
    background: colors.bg.base,
    ...style,
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: filters ? spacing.lg : spacing.xl,
    flexWrap: 'wrap',
    gap: spacing.md,
  }

  const titleStyle = {
    margin: 0,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.3,
  }

  if (loading) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* 页面标题区 */}
      {(title || extra) && (
        <div style={headerStyle}>
          <div>
            {title && (
              <Title level={4} style={titleStyle}>
                {title}
              </Title>
            )}
            {description && (
              <Text
                style={{ color: colors.text.muted, fontSize: 13, marginTop: 4, display: 'block' }}
              >
                {description}
              </Text>
            )}
          </div>
          {extra && <Space>{extra}</Space>}
        </div>
      )}

      {/* 筛选区 */}
      {filters && (
        <Card
          size="small"
          style={{
            background: colors.bg.page,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: radius.lg,
            marginBottom: spacing.lg,
          }}
          bodyStyle={{ padding: `${spacing.md}px ${spacing.lg}px` }}
        >
          {filters}
        </Card>
      )}

      {/* 内容区 */}
      {children ? (
        children
      ) : empty ? (
        <Card
          style={{
            background: colors.bg.card,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: radius.lg,
          }}
        >
          {empty}
        </Card>
      ) : null}
    </div>
  )
}
