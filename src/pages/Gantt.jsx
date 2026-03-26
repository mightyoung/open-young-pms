import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Timeline, Tag, Empty, Spin, Button, Modal, Form, Input, message } from 'antd'
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { api } from '../api'

export default function Gantt() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const loadTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks')
      const items = res?.items || res?.data?.items || []
      setTasks(items)
    } catch (e) {
      message.error('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [])

  const handleCreate = async () => {
    try {
      const vals = await form.validateFields()
      await api.post('/tasks', { ...vals, status: 'todo' })
      message.success('任务已创建')
      setModalOpen(false)
      form.resetFields()
      loadTasks()
    } catch (e) {
      message.error('创建失败')
    }
  }

  const PRIORITY_MAP = { low: { label: '低', color: 'green' }, medium: { label: '中', color: 'orange' }, high: { label: '高', color: 'red' } }
  const STATUS_MAP = { todo: 'gray', in_progress: 'blue', done: 'green' }

  const timeRange = (t) => {
    if (!t) return null
    const start = new Date(t.start_date || t.created_at)
    const end = new Date(t.due_date || t.updated_at || t.created_at)
    const days = Math.ceil((end - start) / 86400000) + 1
    return `${start.getMonth()+1}/${start.getDate()} - ${end.getMonth()+1}/${end.getDate()} (${days}天)`
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: colors.text.primary, margin: 0 }}>甘特图</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建任务</Button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div> :
       tasks.length === 0 ? <Empty description="暂无任务，请创建" style={{ marginTop: 80 }} /> : (
        <Card style={{ background: colors.bg.card, border: '1px solid #3f3f46' }}>
          <Timeline
            items={tasks.map(task => ({
              color: STATUS_MAP[task.status] || 'gray',
              children: (
                <div>
                  <div style={{ color: colors.text.primary, fontWeight: 600 }}>{task.summary || task.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Tag color={PRIORITY_MAP[task.priority]?.color}>{PRIORITY_MAP[task.priority]?.label || '普通'}</Tag>
                    <span style={{ color: colors.text.muted, fontSize: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {timeRange(task)}
                    </span>
                  </div>
                </div>
              )
            }))}
          />
        </Card>
      )}

      <Modal title="新建任务" open={modalOpen} onOk={handleCreate} onCancel={() => setModalOpen(false)} okText="创建" cancelText="取消">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="summary" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Input placeholder="low / medium / high" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="任务描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
