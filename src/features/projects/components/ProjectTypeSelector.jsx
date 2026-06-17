import React from 'react'
import { Empty, Radio, Space, Tag, Typography } from 'antd'

const { Text, Title } = Typography

export default function ProjectTypeSelector({ projectTypes, value, onChange }) {
  if (!projectTypes.length) return <Empty description="暂无项目类型" />

  return (
    <Radio.Group value={value} onChange={event => onChange(event.target.value)} style={{ width: '100%' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {projectTypes.map(type => {
          const active = type.code === value
          return (
            <div
              key={type.code}
              onClick={() => onChange(type.code)}
              style={{
                cursor: 'pointer',
                border: '1px solid',
                borderRadius: 8,
                borderColor: active ? '#115cb9' : '#e5e7eb',
                background: active ? '#f0f6ff' : '#ffffff',
                padding: 12,
              }}
            >
              <Space align="start">
                <Radio value={type.code} />
                <div>
                  <Space size={8}>
                    <Title level={5} style={{ margin: 0 }}>
                      {type.name}
                    </Title>
                    {active && <Tag color="blue">当前</Tag>}
                  </Space>
                  <Text type="secondary">{type.description}</Text>
                </div>
              </Space>
            </div>
          )
        })}
      </Space>
    </Radio.Group>
  )
}
