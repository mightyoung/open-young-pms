import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Descriptions, Empty, Row, Space, Spin, Tabs, Tag, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import {
  AuditOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ProjectOutlined,
  SafetyOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { projectsFeatureApi } from '../api'

const { Text, Title } = Typography

const PROJECT_CONTEXT_MODULES = [
  { key: 'contracts', label: '合同', path: '/contracts', desc: '项目合同、金额、签约状态、履约节点' },
  { key: 'risks', label: '风险', path: '/risks', desc: '项目风险、概率影响、缓解措施、关闭状态' },
  { key: 'quality', label: '质量', path: '/quality', desc: '质量标准、检查记录、不合格项、整改关联' },
  { key: 'resources', label: '资源', path: '/resources', desc: '设备、材料、车辆等项目资源状态' },
  {
    key: 'lifecycle',
    label: '流程',
    path: '/projects/lifecycle',
    desc: '项目流程模板、阶段门、工作项类型',
  },
]

const MAINLINE_LINKS = [
  { key: 'tasks', label: '任务/WBS', path: '/tasks', icon: <ToolOutlined /> },
  { key: 'hazards', label: '随手拍/隐患', path: '/hazards', icon: <SafetyOutlined /> },
  { key: 'reports', label: '报告中心', path: '/reports', icon: <FileTextOutlined /> },
  { key: 'approval', label: '审批中心', path: '/approval-center', icon: <AuditOutlined /> },
]

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response
}

function normalizeProject(raw, projectId) {
  if (!raw) {
    return {
      id: projectId,
      name: `项目 ${projectId}`,
      code: projectId,
      status: 'unknown',
    }
  }

  return {
    id: raw.id ?? projectId,
    name: raw.name ?? raw.title ?? `项目 ${projectId}`,
    code: raw.code ?? raw.project_code ?? raw.id ?? projectId,
    status: raw.status ?? 'unknown',
    leader: raw.leader ?? raw.manager_name ?? raw.owner_name ?? raw.project_manager ?? '-',
    department: raw.department ?? raw.dept ?? raw.department_name ?? '-',
    startDate: raw.start_date ?? raw.startDate ?? '-',
    endDate: raw.end_date ?? raw.endDate ?? '-',
    budget: raw.budget ?? raw.amount ?? '-',
    description: raw.description ?? raw.desc ?? '-',
  }
}

function ContextCard({ module }) {
  return (
    <Card size="small" style={{ height: '100%' }}>
      <Space direction="vertical" size={8}>
        <Tag color="blue">{module.label}</Tag>
        <Text type="secondary">{module.desc}</Text>
        <Link to={module.path}>进入{module.label}</Link>
      </Space>
    </Card>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function loadProject() {
      setLoading(true)
      setError('')
      try {
        const response = await projectsFeatureApi.get(projectId)
        if (alive) setProject(normalizeProject(getPayload(response), projectId))
      } catch (err) {
        if (alive) {
          setProject(normalizeProject(null, projectId))
          setError(err?.message || '项目详情暂时不可用')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadProject()
    return () => {
      alive = false
    }
  }, [projectId])

  const overviewItems = useMemo(
    () => [
      { key: 'code', label: '项目编号', children: project?.code },
      { key: 'status', label: '状态', children: project?.status },
      { key: 'leader', label: '负责人', children: project?.leader },
      { key: 'department', label: '所属部门', children: project?.department },
      { key: 'start', label: '开始日期', children: project?.startDate },
      { key: 'end', label: '结束日期', children: project?.endDate },
      { key: 'budget', label: '预算', children: project?.budget },
      { key: 'desc', label: '说明', children: project?.description },
    ],
    [project]
  )

  return (
    <div>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space align="start" style={{ justifyContent: 'space-between', width: '100%' }}>
              <Space>
                <ProjectOutlined style={{ color: 'var(--color-primary)', fontSize: 22 }} />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {loading ? '项目详情' : project?.name}
                  </Title>
                  <Text type="secondary">围绕项目交付聚合任务、隐患、报告、审批和附属对象</Text>
                </div>
              </Space>
              <Tag icon={<CheckCircleOutlined />} color="processing">
                项目上下文
              </Tag>
            </Space>
            {error && <Alert type="warning" showIcon message={error} />}
          </Space>
        </Card>

        <Spin spinning={loading}>
          <Tabs
            defaultActiveKey="overview"
            items={[
              {
                key: 'overview',
                label: '概览',
                children: (
                  <Card>
                    {project ? (
                      <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} items={overviewItems} />
                    ) : (
                      <Empty description="暂无项目详情" />
                    )}
                  </Card>
                ),
              },
              {
                key: 'mainline',
                label: '主流程',
                children: (
                  <Row gutter={[12, 12]}>
                    {MAINLINE_LINKS.map(item => (
                      <Col xs={24} sm={12} lg={6} key={item.key}>
                        <Card>
                          <Space direction="vertical" size={10}>
                            <Space>
                              {item.icon}
                              <Text strong>{item.label}</Text>
                            </Space>
                            <Button type="link" style={{ padding: 0 }}>
                              <Link to={item.path}>进入{item.label}</Link>
                            </Button>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
              },
              {
                key: 'context',
                label: '项目附属对象',
                children: (
                  <Row gutter={[12, 12]}>
                    {PROJECT_CONTEXT_MODULES.map(module => (
                      <Col xs={24} sm={12} lg={8} key={module.key}>
                        <ContextCard module={module} />
                      </Col>
                    ))}
                  </Row>
                ),
              },
              {
                key: 'archive',
                label: '归档',
                children: (
                  <Card>
                    <Empty description="归档材料将在后续切片接入交付文档、验收记录和关闭报告" />
                  </Card>
                ),
              },
            ]}
          />
        </Spin>
      </Space>
    </div>
  )
}
