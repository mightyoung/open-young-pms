import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Steps,
  Modal,
  List,
  Avatar,
  Typography,
} from 'antd'
import { FileTextOutlined, CheckOutlined, FolderOutlined } from '@ant-design/icons'
import { api } from '../api'

const { TextArea } = Input
const { Text } = Typography

export default function ReportWrite() {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(0)
  const [projects, setProjects] = useState([])
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectKeyword, setProjectKeyword] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    loadProjects('')
  }, [])

  const loadProjects = async (keyword = '') => {
    setProjectLoading(true)
    try {
      const res = await api.get('/projects')
      const items = res?.items || res || []
      const filtered = keyword
        ? items.filter(
            p =>
              (p.project_name || '').includes(keyword) || (p.project_code || '').includes(keyword)
          )
        : items
      setProjects(filtered)
    } catch {
      setProjects([])
    } finally {
      setProjectLoading(false)
    }
  }

  const handleSubmit = async (as_draft = false) => {
    try {
      const vals = await form.validateFields()
      setSubmitting(true)

      const period_start = new Date().toISOString().split('T')[0]
      const period_end = new Date().toISOString().split('T')[0]

      const payload = {
        type: vals.report_type, // backend uses 'type', not 'report_type'
        project_id: vals.project_id,
        period_start,
        period_end,
        content: {
          completed: vals.content?.completed || '',
          next_plan: vals.content?.next_plan || '',
          issues: vals.content?.issues || '',
          remarks: vals.content?.remarks || '',
          summary: vals.content?.summary || '',
        },
      }

      const res = await api.post('/reports', payload)
      if (as_draft) {
        message.success('草稿已保存')
      } else {
        // auto-submit after create
        const reportId = res?.id || res?.data?.id
        if (reportId) {
          await api.post(`/reports/${reportId}/submit`)
          message.success('报告已提交')
        } else {
          message.success('报告已创建')
        }
      }
      form.resetFields()
      setSelectedProject(null)
      setStep(0)
    } catch (e) {
      message.error('提交失败: ' + (e.message || '未知错误'))
    } finally {
      setSubmitting(false)
    }
  }

  const projectOptions = projects.map(p => ({
    value: p.id,
    label: `${p.project_name || p.name} (${p.project_code || p.code || '无编号'})`,
  }))

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ color: colors.text.primary, marginBottom: 24 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        撰写报告
      </h2>

      <Steps
        current={step}
        items={[{ title: '选择类型' }, { title: '填写内容' }, { title: '提交' }]}
        style={{ marginBottom: 24 }}
      />

      <Card style={{ background: colors.bg.card, border: '1px solid #e5e7eb' }}>
        <Form
          form={form}
          layout="vertical"
          size="large"
          initialValues={{
            report_type: 'daily',
            content: { completed: '', next_plan: '', issues: '', remarks: '', summary: '' },
          }}
        >
          <Form.Item
            name="report_type"
            label="报告类型"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select
              placeholder="请选择报告类型"
              options={[
                { value: 'daily', label: '📅 日报' },
                { value: 'weekly', label: '📆 周报' },
                { value: 'monthly', label: '📆 月报' },
              ]}
              onChange={() => setStep(1)}
            />
          </Form.Item>

          <Form.Item
            name="project_id"
            label="所属项目"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select
              placeholder="点击选择项目..."
              showSearch
              allowClear
              options={projectOptions}
              onSearch={v => {
                setProjectKeyword(v)
                loadProjects(v)
              }}
              onOpenChange={open => {
                if (open) loadProjects('')
              }}
              filterOption={false}
              notFoundContent={null}
              onChange={val => {
                const p = projects.find(x => x.id === val)
                setSelectedProject(p || null)
              }}
              dropdownRender={menu => (
                <>
                  {menu}
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb' }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<FolderOutlined />}
                      onClick={() => setProjectModalOpen(true)}
                      style={{ color: colors.accent, width: '100%', textAlign: 'left' }}
                    >
                      项目库中选择...
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>

          {selectedProject && (
            <div
              style={{
                padding: '10px 14px',
                background: colors.bg.card,
                borderRadius: 8,
                border: '1px solid #3b82f630',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Avatar icon={<FolderOutlined />} style={{ background: colors.accent }} />
              <div>
                <Text style={{ color: colors.text.primary, display: 'block', fontWeight: 600 }}>
                  {selectedProject.project_name || selectedProject.name}
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  编号: {selectedProject.project_code || '—'} | 状态:{' '}
                  {selectedProject.status || '—'}
                </Text>
              </div>
            </div>
          )}

          {/* 日报模板 */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.report_type !== curr.report_type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('report_type')
              return (
                <>
                  {type === 'daily' && (
                    <>
                      <Form.Item
                        label="今日完成工作"
                        name={['content', 'completed']}
                        rules={[{ required: true, message: '请填写今日完成工作' }]}
                      >
                        <TextArea rows={3} placeholder="请填写今日完成的工作内容..." />
                      </Form.Item>
                      <Form.Item
                        label="明日工作计划"
                        name={['content', 'next_plan']}
                        rules={[{ required: true, message: '请填写明日工作计划' }]}
                      >
                        <TextArea rows={2} placeholder="请填写明日工作计划..." />
                      </Form.Item>
                      <Form.Item label="遇到的问题" name={['content', 'issues']}>
                        <TextArea
                          rows={2}
                          placeholder="请填写工作中遇到的问题（如无则填'无'）..."
                        />
                      </Form.Item>
                      <Form.Item label="备注/心得" name={['content', 'remarks']}>
                        <TextArea rows={2} placeholder="其他需要记录的事项..." />
                      </Form.Item>
                    </>
                  )}
                  {type !== 'daily' && (
                    <>
                      <Form.Item
                        label="本期完成工作"
                        name={['content', 'completed']}
                        rules={[{ required: true, message: '请填写完成工作' }]}
                      >
                        <TextArea rows={4} placeholder="列出本期完成的主要工作，每项一行..." />
                      </Form.Item>
                      <Form.Item
                        label="下期工作计划"
                        name={['content', 'next_plan']}
                        rules={[{ required: true, message: '请填写下期计划' }]}
                      >
                        <TextArea rows={4} placeholder="计划下期完成的工作，每项一行..." />
                      </Form.Item>
                      <Form.Item label="问题与建议" name={['content', 'issues']}>
                        <TextArea rows={3} placeholder="本期遇到的问题及改进建议..." />
                      </Form.Item>
                      <Form.Item label="总结" name={['content', 'summary']}>
                        <TextArea rows={2} placeholder="简要总结本期工作..." />
                      </Form.Item>
                    </>
                  )}
                </>
              )
            }}
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => handleSubmit(true)} loading={submitting}>
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleSubmit(false)}
              loading={submitting}
            >
              提交报告
            </Button>
          </div>
        </Form>
      </Card>

      {/* 项目选择弹窗 */}
      <Modal
        title={<Text style={{ color: colors.text.primary }}>选择项目</Text>}
        open={projectModalOpen}
        onCancel={() => setProjectModalOpen(false)}
        footer={null}
        width={600}
        styles={{ body: { background: colors.bg.page, maxHeight: 500, overflow: 'auto' } }}
      >
        <Input
          placeholder="搜索项目名称或编号..."
          prefix={<FolderOutlined style={{ color: colors.text.muted }} />}
          value={projectKeyword}
          onChange={e => {
            setProjectKeyword(e.target.value)
            loadProjects(e.target.value)
          }}
          style={{ marginBottom: 12, background: colors.bg.card, borderColor: colors.bg.elevated }}
        />
        <List
          loading={projectLoading}
          dataSource={projects}
          locale={{ emptyText: '暂无项目' }}
          renderItem={item => (
            <List.Item
              key={item.id}
              onClick={() => {
                form.setFieldsValue({ project_id: item.id })
                setSelectedProject(item)
                setProjectModalOpen(false)
              }}
              style={{
                cursor: 'pointer',
                padding: '10px 12px',
                borderRadius: 8,
                borderBottom: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.bg.card)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<FolderOutlined />}
                    style={{ background: '#3b82f620', color: colors.accent }}
                  />
                }
                title={
                  <Text style={{ color: colors.text.primary }}>
                    {item.project_name || item.name}
                  </Text>
                }
                description={
                  <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                    编号: {item.project_code || '—'} · 状态: {item.status || '—'}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}
