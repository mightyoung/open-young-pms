import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Typography, Button, Select, Space, Badge, Modal, message } from 'antd'
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

// 简化日历组件（无需第三方日历库）
function CalendarView({ events = [] }) {
  const [current, setCurrent] = useState(new Date())

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // 构建事件映射 { '2026-03-15': [{type, text}] }
  const eventMap = {}
  events.forEach(e => {
    const date = e.date || (e.start_date && e.start_date.substring(0, 10))
    if (date) {
      if (!eventMap[date]) eventMap[date] = []
      eventMap[date].push(e)
    }
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={prevMonth} size="small" />
        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: 600 }}>{year}年{month + 1}月</Text>
        <Button icon={<RightOutlined />} onClick={nextMonth} size="small" />
      </div>

      {/* 星期标题 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {weekDays.map(d => (
          <div key={d} style={{ textAlign: 'center', padding: '4px 0' }}>
            <Text style={{ color: colors.text.muted, fontSize: 12 }}>{d}</Text>
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayEvents = eventMap[dateStr] || []
          return (
            <div key={day}
              style={{
                border: `1px solid ${isToday(day) ? colors.accent : colors.bg.card}`,
                borderRadius: 6,
                padding: '4px 6px',
                minHeight: 52,
                background: isToday(day) ? '#6366f110' : colors.bg.page,
                cursor: dayEvents.length > 0 ? 'pointer' : 'default',
              }}>
              <Text style={{ color: isToday(day) ? colors.accent : colors.text.primary, fontSize: 13, fontWeight: isToday(day) ? 700 : 400 }}>
                {day}
              </Text>
              <div style={{ marginTop: 2 }}>
                {dayEvents.slice(0, 2).map((e, i) => (
                  <div key={i} style={{
                    background: e.type === 'milestone' ? '#eab30820' : '#3b82f620',
                    borderRadius: 3,
                    padding: '1px 4px',
                    marginBottom: 2,
                    overflow: 'hidden',
                  }}>
                    <Text style={{ color: e.type === 'milestone' ? colors.warning : colors.accent, fontSize: 10 }}>
                      {e.text}
                    </Text>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <Text style={{ color: colors.text.muted, fontSize: 10 }}>+{dayEvents.length - 2}更多</Text>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [projectId, setProjectId] = useState(null)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/projects').then(d => {
      const items = d?.items || d || []
      setProjects(items)
      if (items.length > 0) setProjectId(items[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!projectId) return
    Promise.all([
      api.get(`/projects/${projectId}`).catch(() => null),
      api.get(`/projects/${projectId}/phases`).catch(() => null),
      api.get(`/tasks`).catch(() => null),
    ]).then(([proj, phases, tasks]) => {
      const evts = []
      // 里程碑
      ;(proj?.milestones || []).forEach(m => {
        if (m.date) evts.push({ date: m.date.substring(0, 10), text: m.name, type: 'milestone' })
      })
      // 阶段
      ;(phases || []).forEach(p => {
        if (p.start_date) evts.push({ date: p.start_date.substring(0, 10), text: p.name, type: 'phase' })
        if (p.end_date) evts.push({ date: p.end_date.substring(0, 10), text: p.name + '截止', type: 'phase' })
      })
      // 任务
      ;(tasks || []).forEach(t => {
        if (t.start_date) evts.push({ date: t.start_date.substring(0, 10), text: t.name || t.title, type: 'task' })
      })
      setEvents(evts)
    }).catch(() => {})
  }, [projectId])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ color: colors.text.primary, margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />日历视图
        </Title>
        <Select value={projectId} onChange={setProjectId} style={{ width: 200 }} placeholder="选择项目">
          {projects.map(p => <Select.Option key={p.id} value={p.id}>{p.name || p.project_name}</Select.Option>)}
        </Select>
      </div>
      <Card style={{ background: colors.bg.page, border: '1px solid #27272a' }}>
        <CalendarView events={events} />
      </Card>
    </div>
  )
}
