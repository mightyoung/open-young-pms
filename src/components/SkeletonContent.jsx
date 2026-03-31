import React from 'react'
import { Skeleton, Card, Table } from 'antd'
import { colors } from '../styles/theme'

function SkeletonCard({ count = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: colors.bg.card,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <Skeleton active paragraph={{ rows: 1 }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <Table
      dataSource={Array.from({ length: rows }).map((_, i) => ({ key: i }))}
      loading
      rowKey="key"
      pagination={false}
      columns={Array.from({ length: cols }).map((_, i) => ({
        title: <Skeleton.Input active size="small" style={{ width: 60 }} />,
        render: () => <Skeleton.Input active size="small" style={{ width: '80%' }} />,
      }))}
    />
  )
}

function SkeletonForm({ fields = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 8 }} />
          <Skeleton.Input active size="large" style={{ width: '100%', height: 32 }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonList({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: colors.bg.card,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Skeleton.Avatar active size="small" />
          <div style={{ flex: 1 }}>
            <Skeleton.Input active size="small" style={{ width: '60%' }} />
          </div>
          <Skeleton.Button active size="small" style={{ width: 60 }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonKPIGrid({ count = 4 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: colors.bg.card,
            border: `1px solid ${colors.bg.border}`,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <Skeleton active paragraph={{ rows: 1 }} />
        </div>
      ))}
    </div>
  )
}

function SkeletonChart({ height = 200 }) {
  return (
    <Card style={{ background: colors.bg.card, border: `1px solid ${colors.bg.border}` }}>
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          padding: 16,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: `${30 + ((i * 37) % 70)}%`,
              background: colors.bg.elevated,
              borderRadius: 4,
            }}
          />
        ))}
      </div>
    </Card>
  )
}

export default function SkeletonContent({ type = 'table', ...props }) {
  switch (type) {
    case 'table':
      return <SkeletonTable {...props} />
    case 'cards':
      return <SkeletonCard {...props} />
    case 'form':
      return <SkeletonForm {...props} />
    case 'list':
      return <SkeletonList {...props} />
    case 'kpi':
      return <SkeletonKPIGrid {...props} />
    case 'chart':
      return <SkeletonChart {...props} />
    case 'dashboard':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SkeletonKPIGrid count={4} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            <SkeletonChart height={200} />
            <SkeletonChart height={200} />
          </div>
        </div>
      )
    case 'detail':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton active paragraph={{ rows: 3 }} />
          <SkeletonForm fields={3} />
        </div>
      )
    default:
      return <Skeleton active />
  }
}
