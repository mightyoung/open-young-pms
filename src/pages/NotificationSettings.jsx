import React, { useState, useEffect } from 'react'
import { Card, Typography, Switch, Select, Button, message } from 'antd'
import { BellOutlined, MailOutlined, WechatOutlined, MessageOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    channel: 'in_app',
    hazard_enabled: true,
    report_enabled: true,
    approval_enabled: true,
    task_enabled: true,
    frequency: 'realtime',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/notification-settings')
      .then(res => {
        const data = res?.data || res || {}
        setSettings(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/notification-settings', settings)
      message.success('设置已保存')
    } catch (e) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const items = [
    {
      key: 'hazard_enabled',
      label: '隐患通知',
      desc: '随手拍问题上报/整改/验收时通知',
      icon: '⚠️',
    },
    { key: 'report_enabled', label: '报告通知', desc: '报告提交/审批结果通知', icon: '📄' },
    { key: 'approval_enabled', label: '审批通知', desc: '待审批任务/审批结果通知', icon: '✅' },
    { key: 'task_enabled', label: '任务通知', desc: '任务分配/完成/逾期通知', icon: '📋' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ color: '#e4e4e7', marginBottom: 16 }}>
        <BellOutlined style={{ marginRight: 8 }} />
        通知设置
      </Title>

      <Card style={{ background: '#ffffff', border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <Text style={{ color: '#a1a1aa', fontSize: 13 }}>通知渠道</Text>
        <div style={{ marginTop: 8 }}>
          <Select
            value={settings.channel}
            onChange={v => setSettings(s => ({ ...s, channel: v }))}
            style={{ width: 160 }}
          >
            <Select.Option value="in_app">
              <MessageOutlined /> 应用内通知
            </Select.Option>
            <Select.Option value="email">
              <MailOutlined /> 邮件通知
            </Select.Option>
            <Select.Option value="wechat">
              <WechatOutlined /> 微信通知
            </Select.Option>
          </Select>
        </div>
      </Card>

      <Card style={{ background: '#ffffff', border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <Text style={{ color: '#a1a1aa', fontSize: 13 }}>通知频率</Text>
        <div style={{ marginTop: 8 }}>
          <Select
            value={settings.frequency}
            onChange={v => setSettings(s => ({ ...s, frequency: v }))}
            style={{ width: 160 }}
          >
            <Select.Option value="realtime">实时通知</Select.Option>
            <Select.Option value="daily">每日汇总</Select.Option>
            <Select.Option value="weekly">每周汇总</Select.Option>
          </Select>
        </div>
      </Card>

      <Card style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
        <Text style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 16, display: 'block' }}>
          通知类型
        </Text>
        {items.map(item => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>
              <Text style={{ fontSize: 15 }}>
                {item.icon} {item.label}
              </Text>
              <div style={{ marginTop: 2 }}>
                <Text style={{ color: '#71717a', fontSize: 12 }}>{item.desc}</Text>
              </div>
            </div>
            <Switch
              checked={settings[item.key]}
              onChange={v => setSettings(s => ({ ...s, [item.key]: v }))}
            />
          </div>
        ))}
        <Button type="primary" style={{ marginTop: 16 }} onClick={handleSave} loading={saving}>
          保存设置
        </Button>
      </Card>
    </div>
  )
}
