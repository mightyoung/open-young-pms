/**
 * ActivityTimeline — unified activity log component for hazard/risk/approval details.
 * Replaces ad-hoc Timeline implementations with a consistent interface.
 *
 * @example
 * <ActivityTimeline
 *   entries={[
 *     { id: 1, actor: '李师傅', action: '上报了此隐患', time: '10:20', color: 'green' },
 *     { id: 2, actor: '王安全', action: '接单处理', time: '10:25', color: 'blue' },
 *     { id: 3, actor: '王安全', action: '整改中...截止 12:20', time: '10:30', color: 'yellow' },
 *   ]}
 *   title="整改进度"
 * />
 */
import React from 'react'
import { Timeline, Typography, Avatar, Space } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

// Color palette for timeline dots
const COLOR_MAP = {
  green: '#52c41a',
  blue: '#115cb9',
  yellow: '#faad14',
  red: '#ff4d4f',
  gray: '#8c8c8c',
}

function TimelineEntry({ entry }) {
  const color = COLOR_MAP[entry.color] || entry.color || COLOR_MAP.blue

  return (
    <Space align="start" size={12}>
      {entry.avatar ? (
        <Avatar src={entry.avatar} size={28} style={{ background: '#115cb9', flexShrink: 0 }} />
      ) : (
        <Avatar size={28} style={{ background: color, flexShrink: 0, fontSize: 12 }}>
          {(entry.actor || '?')[0]}
        </Avatar>
      )}
      <div style={{ flex: 1 }}>
        <Text style={{ fontWeight: 600, fontSize: 13 }}>{entry.actor}</Text>{' '}
        <Text style={{ color: '#5f5f61', fontSize: 13 }}>{entry.action}</Text>
        {entry.time && (
          <Text style={{ color: '#8c8c8c', fontSize: 12, display: 'block', marginTop: 2 }}>
            {entry.time}
          </Text>
        )}
        {entry.description && (
          <Text style={{ color: '#5f5f61', fontSize: 13, display: 'block', marginTop: 4 }}>
            {entry.description}
          </Text>
        )}
      </div>
    </Space>
  )
}

export default function ActivityTimeline({
  entries = [],
  title,
  colorMode = 'auto', // 'auto' | 'manual'
  emptyText = '暂无操作记录',
  style,
}) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c', ...style }}>
        <ClockCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
        <Text type="secondary" style={{ fontSize: 13 }}>
          {emptyText}
        </Text>
      </div>
    )
  }

  const items = entries.map((entry, index) => {
    const isLast = index === entries.length - 1
    let dotColor

    if (colorMode === 'auto') {
      // Auto-assign colors based on action type
      const a = (entry.action || '').toLowerCase()
      if (a.includes('完成') || a.includes('关闭') || a.includes('验收')) {
        dotColor = COLOR_MAP.green
      } else if (a.includes('整改') || a.includes('进行')) {
        dotColor = COLOR_MAP.yellow
      } else if (a.includes('驳回') || a.includes('拒绝')) {
        dotColor = COLOR_MAP.red
      } else {
        dotColor = isLast ? COLOR_MAP.blue : COLOR_MAP.gray
      }
    } else {
      dotColor = COLOR_MAP[entry.color] || entry.color || COLOR_MAP.blue
    }

    return {
      key: entry.id || index,
      color: dotColor,
      dot: entry.dot,
      children: <TimelineEntry entry={entry} />,
    }
  })

  return (
    <div style={style}>
      {title && (
        <Typography.Title level={5} style={{ color: '#323235', marginBottom: 12, fontSize: 14 }}>
          {title}
        </Typography.Title>
      )}
      <Timeline items={items} />
    </div>
  )
}
