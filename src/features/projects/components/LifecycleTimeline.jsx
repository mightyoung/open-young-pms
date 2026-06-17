import React from 'react'
import { Card, Empty, List, Steps, Tag, Typography } from 'antd'

const { Text } = Typography

export default function LifecycleTimeline({ lifecycle }) {
  if (!lifecycle?.stages?.length) return <Empty description="暂无生命周期阶段" />

  const gatesByStage = new Map()
  for (const gate of lifecycle.stage_gates || []) {
    const gates = gatesByStage.get(gate.stage_code) || []
    gates.push(gate)
    gatesByStage.set(gate.stage_code, gates)
  }

  return (
    <Card title="生命周期阶段" bordered={false}>
      <Steps
        direction="vertical"
        current={0}
        items={lifecycle.stages.map(stage => ({
          title: stage.name,
          description: (
            <div>
              <Text type="secondary">{stage.description || `负责人角色：${stage.default_owner_role || '未配置'}`}</Text>
              <List
                size="small"
                dataSource={gatesByStage.get(stage.code) || []}
                locale={{ emptyText: '无阶段门' }}
                renderItem={gate => (
                  <List.Item>
                    <div>
                      <Tag color="geekblue">{gate.name}</Tag>
                      <Text type="secondary">
                        交付物：{(gate.required_artifacts || []).join('、') || '未配置'}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ),
        }))}
      />
    </Card>
  )
}
