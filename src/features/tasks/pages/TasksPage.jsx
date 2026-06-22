import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Row,
  Col,
  Typography,
  Progress,
  Badge,
  Tree,
  Alert,
  Avatar,
  Tabs,
  Popconfirm,
  message,
} from 'antd'
import {
  Plus,
  CheckCircle2,
  User,
  Calendar,
  FolderTree,
  AlertTriangle,
  Link2,
  Zap,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useTasks } from '../hooks/useTasks'

const { Text } = Typography

const COLORS = {
  primary: '#115cb9',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textMuted: '#8c8c8c',
}

export default function TasksPage() {
  const { tasks, loading, error, criticalIds, criticalTasks, conflicts, wbsTreeData, resourceData } =
    useTasks()
  const [activeTab, setActiveTab] = useState('wbs')
  const [showConflict, setShowConflict] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }

  const batchAssign = () => {
    if (selectedRowKeys.length === 0) return
    message.warning('批量指派接口未接入，未提交变更')
  }

  const batchDelete = () => {
    if (selectedRowKeys.length === 0) return
    message.warning('批量删除接口未接入，未提交变更')
  }

  const batchExport = () => {
    if (selectedRowKeys.length === 0) return
    message.warning('批量导出接口未接入，未生成文件')
  }

  const columns = [
    {
      title: 'WBS',
      dataIndex: 'wbs',
      width: 70,
      render: (v, r) => <Tag color={r.critical ? COLORS.danger : COLORS.primary}>{v}</Tag>,
    },
    {
      title: '任务名称',
      dataIndex: 'title',
      render: (v, r) => (
        <Space>
          {v}
          {r.critical && <Zap size={12} color={COLORS.danger} />}
        </Space>
      ),
    },
    { title: '负责人', dataIndex: 'assignee', width: 80 },
    { title: '工期', dataIndex: 'duration', width: 60, render: v => `${v}天` },
    { title: '开始日期', dataIndex: 'startDate', width: 100 },
    { title: '结束日期', dataIndex: 'endDate', width: 100 },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      render: v => <Progress percent={v} size="small" strokeColor={COLORS.primary} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: v => (
        <Tag color={v === 'done' ? 'success' : v === 'inprogress' ? 'processing' : 'default'}>
          {v === 'done' ? '已完成' : v === 'inprogress' ? '进行中' : '待开始'}
        </Tag>
      ),
    },
    {
      title: '前置任务',
      dataIndex: 'depends',
      width: 100,
      render: deps =>
        deps.length > 0 ? (
          <Space>
            <Link2 size={12} />
            {deps.map(d => tasks.find(t => t.id === d)?.wbs).join(', ')}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ]

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 28px' }}>
      <Card
        title={
          <Space>
            <FolderTree size={16} color={COLORS.primary} />
            <span>任务管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<Zap size={14} />} onClick={() => setShowConflict(true)}>
              资源冲突
              {conflicts.length > 0 && (
                <Badge count={conflicts.length} style={{ background: COLORS.danger }} />
              )}
            </Button>
            <Button type="primary" icon={<Plus size={14} />}>
              新建任务
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        {error && (
          <Alert
            message="任务列表加载失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'wbs',
              label: (
                <Space>
                  <FolderTree size={14} />
                  WBS分解
                </Space>
              ),
            },
            {
              key: 'critical',
              label: (
                <Space>
                  <Zap size={14} />
                  关键路径 ({criticalTasks.length})
                </Space>
              ),
            },
            {
              key: 'gantt',
              label: (
                <Space>
                  <Calendar size={14} />
                  甘特图
                </Space>
              ),
            },
            {
              key: 'resource',
              label: (
                <Space>
                  <User size={14} />
                  资源负载
                </Space>
              ),
            },
          ]}
        />

        {activeTab === 'wbs' && (
          <Row gutter={24}>
            <Col span={14}>
              <Tree
                treeData={wbsTreeData}
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                titleRender={node => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <Text>{node.title}</Text>
                    {node.progress !== undefined && (
                      <Progress
                        percent={node.progress}
                        size="small"
                        style={{ width: 80 }}
                        strokeColor={COLORS.primary}
                      />
                    )}
                  </div>
                )}
              />
            </Col>
            <Col span={10}>
              <Card size="small" title="任务统计" style={{ background: COLORS.bg }}>
                <Row gutter={[8, 8]}>
                  {[
                    { label: '总任务', value: tasks.length, color: COLORS.primary },
                    {
                      label: '进行中',
                      value: tasks.filter(t => t.status === 'inprogress').length,
                      color: COLORS.warning,
                    },
                    {
                      label: '已完成',
                      value: tasks.filter(t => t.status === 'done').length,
                      color: COLORS.success,
                    },
                    { label: '关键任务', value: criticalTasks.length, color: COLORS.danger },
                  ].map(s => (
                    <Col span={12} key={s.label}>
                      <div
                        style={{
                          background: COLORS.card,
                          borderRadius: 8,
                          padding: 12,
                          textAlign: 'center',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
              <Card size="small" title="关键路径任务" style={{ marginTop: 16 }}>
                {criticalTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      padding: '6px 0',
                      borderBottom: `1px solid ${COLORS.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Space>
                      <Tag color={COLORS.danger}>{t.wbs}</Tag>
                      <Text>{t.title}</Text>
                    </Space>
                    <Text type="secondary">{t.duration}天</Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'critical' && (
          <div>
            <Alert
              message={
                <Space>
                  <Zap size={14} color={COLORS.danger} />
                  <Text>关键路径分析</Text>
                </Space>
              }
              description={`当前项目有 ${criticalTasks.length} 个关键任务，关键路径上的任务延迟将直接影响项目整体工期。`}
              type="error"
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={criticalTasks}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </div>
        )}

        {activeTab === 'gantt' && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{ width: 12, height: 12, background: COLORS.danger, borderRadius: 2 }}
                  />
                  <Text>关键任务</Text>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{ width: 12, height: 12, background: COLORS.primary, borderRadius: 2 }}
                  />
                  <Text>非关键任务</Text>
                </div>
              </Col>
            </Row>
            {selectedRowKeys.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  background: `${COLORS.primary}0a`,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                  已选择 {selectedRowKeys.length} 项
                </Text>
                <Button size="small" onClick={batchAssign}>
                  批量指派
                </Button>
                <Button size="small" onClick={batchExport}>
                  批量导出
                </Button>
                <Popconfirm title="确认删除？" onConfirm={batchDelete}>
                  <Button size="small" danger>
                    批量删除
                  </Button>
                </Popconfirm>
                <Button size="small" type="text" onClick={() => setSelectedRowKeys([])}>
                  取消
                </Button>
              </div>
            )}
            <Table
              dataSource={tasks}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              rowSelection={rowSelection}
              rowClassName={r => (criticalIds.includes(r.id) ? 'critical-row' : '')}
            />
            <style>{`.critical-row { background: ${COLORS.danger}10 !important; }`}</style>
          </div>
        )}

        {activeTab === 'resource' && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="人员工作负载">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={resourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="inProgress" stackId="a" fill={COLORS.warning} name="进行中" />
                    <Bar dataKey="done" stackId="a" fill={COLORS.success} name="已完成" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="资源冲突检测">
                {conflicts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: COLORS.textMuted }}>
                    <CheckCircle2 size={24} color={COLORS.success} />
                    <div style={{ marginTop: 8 }}>暂无资源冲突</div>
                  </div>
                ) : (
                  conflicts.map((c, i) => (
                    <Alert
                      key={i}
                      type="warning"
                      message={
                        <Space>
                          <AlertTriangle size={14} />
                          <Text>{c.resource}</Text>
                          <Text type="secondary">
                            在 {c.task.wbs} {c.task.title} 与
                            {c.overlapped.map(o => o.wbs).join(', ')} 存在时间冲突
                          </Text>
                        </Space>
                      }
                      style={{ marginBottom: 8 }}
                    />
                  ))
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      <Modal
        title={
          <Space>
            <AlertTriangle size={16} color={COLORS.danger} />
            资源冲突详情
          </Space>
        }
        open={showConflict}
        onCancel={() => setShowConflict(false)}
        footer={<Button onClick={() => setShowConflict(false)}>关闭</Button>}
        width={600}
      >
        {conflicts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <CheckCircle2 size={48} color={COLORS.success} />
            <div style={{ marginTop: 16, fontSize: 16 }}>恭喜！暂无资源冲突</div>
          </div>
        ) : (
          conflicts.map((c, i) => (
            <Card key={i} size="small" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar style={{ background: COLORS.primary }}>{c.resource[0]}</Avatar>
                <Text strong>{c.resource}</Text>
                <Badge
                  count={`${c.overlapped.length} 项冲突`}
                  style={{ background: COLORS.danger }}
                />
              </div>
              {c.overlapped.map((t, j) => (
                <Tag key={j} color={COLORS.danger}>
                  {t.wbs} {t.title}
                </Tag>
              ))}
            </Card>
          ))
        )}
      </Modal>
    </div>
  )
}
