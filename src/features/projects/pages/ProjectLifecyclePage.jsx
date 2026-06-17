import React from 'react'
import { Button, Card, Col, Row, Skeleton, Space, Typography } from 'antd'
import { ReloadOutlined, ProjectOutlined } from '@ant-design/icons'
import { PageHeader } from '../../../components/PMSComponents'
import ProjectTypeSelector from '../components/ProjectTypeSelector'
import LifecycleTimeline from '../components/LifecycleTimeline'
import WorkItemSummary from '../components/WorkItemSummary'
import { useProjectLifecycle } from '../hooks/useProjectLifecycle'

const { Paragraph, Text, Title } = Typography

export default function ProjectLifecyclePage() {
  const {
    projectTypes,
    selectedType,
    setSelectedType,
    selectedTemplate,
    lifecycle,
    loading,
    reload,
  } = useProjectLifecycle()

  return (
    <div>
      <PageHeader
        title="项目流程模板"
        subtitle="按软件产品、集成/工程项目、软件项目三类流程查看生命周期、阶段门和工作项"
        icon={<ProjectOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="项目类型"
            extra={
              <Button type="text" icon={<ReloadOutlined />} onClick={reload} loading={loading}>
                刷新
              </Button>
            }
            bordered={false}
          >
            <ProjectTypeSelector
              projectTypes={projectTypes}
              value={selectedType}
              onChange={setSelectedType}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            {loading && !selectedTemplate ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Title level={4} style={{ marginTop: 0 }}>
                    {selectedTemplate?.name || '流程模板'}
                  </Title>
                  <Paragraph type="secondary">
                    {selectedTemplate?.description || '选择项目类型后查看默认流程模板。'}
                  </Paragraph>
                </div>
                <Row gutter={12}>
                  <Col xs={8}>
                    <Text type="secondary">阶段数</Text>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {lifecycle?.stages?.length || 0}
                    </div>
                  </Col>
                  <Col xs={8}>
                    <Text type="secondary">阶段门</Text>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {lifecycle?.stage_gates?.length || 0}
                    </div>
                  </Col>
                  <Col xs={8}>
                    <Text type="secondary">工作项类型</Text>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                      {selectedTemplate?.work_item_types?.length || 0}
                    </div>
                  </Col>
                </Row>
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <LifecycleTimeline lifecycle={lifecycle} />
      </div>

      <div style={{ marginTop: 16 }}>
        <WorkItemSummary
          workItemTypes={selectedTemplate?.work_item_types || []}
          metrics={lifecycle?.metrics || selectedTemplate?.metrics || []}
        />
      </div>
    </div>
  )
}
