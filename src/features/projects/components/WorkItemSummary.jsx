import React from 'react'
import { Card, Col, Empty, Row, Space, Tag, Typography } from 'antd'

const { Text } = Typography

export default function WorkItemSummary({ workItemTypes = [], metrics = [] }) {
  if (!workItemTypes.length) return <Empty description="暂无工作项类型" />

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title="工作项类型" bordered={false}>
          <Row gutter={[12, 12]}>
            {workItemTypes.map(item => (
              <Col xs={24} sm={12} key={item.code}>
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    minHeight: '100%',
                  }}
                >
                  <Space direction="vertical" size={6}>
                    <Text strong>{item.name}</Text>
                    <Text type="secondary">{item.description || item.code}</Text>
                    <Space size={4} wrap>
                      {(item.statuses || []).map(status => (
                        <Tag key={status}>{status}</Tag>
                      ))}
                    </Space>
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title="关键指标" bordered={false}>
          <Space size={8} wrap>
            {metrics.map(metric => (
              <Tag color="blue" key={metric}>
                {metric}
              </Tag>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  )
}
