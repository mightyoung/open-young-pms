/**
 * NotificationSettingsPage — notification subscription preferences.
 * Migrated from src/pages/NotificationSettings.jsx and enhanced with
 * project/role/keyword subscription rules.
 */
import React, { useState, useEffect } from 'react'
import { Card, Switch, Select, Button, message, Space, Typography, Input } from 'antd'
import {
  BellOutlined,
  MailOutlined,
  WechatOutlined,
  MessageOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../../components/PMSComponents'
import { notificationsFeatureApi } from '../api'

const { Text } = Typography

const TYPE_ITEMS = [
  { key: 'hazard_enabled', label: '隐患通知', desc: '随手拍问题上报/整改/验收时通知', icon: '⚠️' },
  { key: 'report_enabled', label: '报告通知', desc: '报告提交/审批结果通知', icon: '📄' },
  { key: 'approval_enabled', label: '审批通知', desc: '待审批任务/审批结果通知', icon: '✅' },
  { key: 'task_enabled', label: '任务通知', desc: '任务分配/完成/逾期通知', icon: '📋' },
]

// Mock project list — replace with real API
const MOCK_PROJECTS = [
  { id: 'p1', name: '产线自动化改造项目' },
  { id: 'p2', name: '设备升级项目' },
  { id: 'p3', name: '安全检查项目' },
]

// Mock role list
const ROLE_OPTIONS = [
  { value: 'project_manager', label: '项目经理' },
  { value: 'dept_leader', label: '部门领导' },
  { value: 'field_staff', label: '现场人员' },
]

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: '应用内通知' },
  { value: 'email', label: '邮件通知' },
  { value: 'wechat', label: '微信通知' },
]

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: '实时通知' },
  { value: 'daily', label: '每日汇总' },
  { value: 'weekly', label: '每周汇总' },
]

function SubscriptionRule({ rule, onChange, onRemove }) {
  const [type, setType] = useState(rule.type || 'project')
  const [value, setValue] = useState(rule.value || '')

  const handleTypeChange = t => {
    setType(t)
    setValue('')
    onChange({ ...rule, type: t, value: '' })
  }

  const handleValueChange = v => {
    setValue(v)
    onChange({ ...rule, value: v })
  }

  return (
    <div style={styles.ruleRow}>
      <Select
        value={type}
        onChange={handleTypeChange}
        style={{ width: 120 }}
        options={[
          { value: 'project', label: '按项目' },
          { value: 'role', label: '按角色' },
          { value: 'keyword', label: '按关键字' },
        ]}
      />
      {type === 'keyword' ? (
        <Input
          value={value}
          onChange={e => handleValueChange(e.target.value)}
          placeholder="输入通知关键字"
          style={{ flex: 1 }}
        />
      ) : (
        <Select
          value={value}
          onChange={handleValueChange}
          style={{ flex: 1 }}
          placeholder={type === 'project' ? '选择项目' : '选择角色'}
          showSearch
          filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
          options={
            type === 'project'
              ? MOCK_PROJECTS.map(p => ({ value: p.id, label: p.name }))
              : ROLE_OPTIONS
          }
        />
      )}
      <Button type="text" danger onClick={onRemove} style={{ flexShrink: 0 }}>
        删除
      </Button>
    </div>
  )
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({
    channel: 'in_app',
    hazard_enabled: true,
    report_enabled: true,
    approval_enabled: true,
    task_enabled: true,
    frequency: 'realtime',
    // Enhanced: project/role/keyword subscription rules
    rules: [],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    notificationsFeatureApi.settings
      .get()
      .then(res => {
        const data = res?.data || res || {}
        setSettings(prev => ({
          ...prev,
          ...data,
          // Ensure rules is always an array
          rules: Array.isArray(data.rules) ? data.rules : [],
        }))
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationsFeatureApi.settings.update(settings)
      message.success('设置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const addRule = () =>
    setSettings(prev => ({
      ...prev,
      rules: [...prev.rules, { type: 'project', value: '' }],
    }))

  const updateRule = (index, updated) =>
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === index ? updated : r)),
    }))

  const removeRule = index =>
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))

  return (
    <div style={styles.page}>
      <PageHeader
        title="通知设置"
        icon={<BellOutlined style={{ color: 'var(--color-primary)' }} />}
      />

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>通知渠道</Text>
        <Select
          value={settings.channel}
          onChange={v => updateSetting('channel', v)}
          style={{ width: 180, marginTop: 8 }}
        >
          {CHANNEL_OPTIONS.map(o => (
            <Select.Option key={o.value} value={o.value}>
              {o.value === 'in_app' ? (
                <MessageOutlined />
              ) : o.value === 'email' ? (
                <MailOutlined />
              ) : (
                <WechatOutlined />
              )}{' '}
              {o.label}
            </Select.Option>
          ))}
        </Select>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>通知频率</Text>
        <Select
          value={settings.frequency}
          onChange={v => updateSetting('frequency', v)}
          style={{ width: 180, marginTop: 8 }}
        >
          {FREQUENCY_OPTIONS.map(o => (
            <Select.Option key={o.value} value={o.value}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>通知类型</Text>
        <div style={{ marginTop: 12 }}>
          {TYPE_ITEMS.map((item, index) => (
            <div
              key={item.key}
              style={{
                ...styles.typeRow,
                borderBottom:
                  index < TYPE_ITEMS.length - 1 ? '1px solid var(--color-outline-variant)' : 'none',
              }}
            >
              <div>
                <Text style={{ fontSize: 14 }}>
                  {item.icon} {item.label}
                </Text>
                <div style={{ marginTop: 2 }}>
                  <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                    {item.desc}
                  </Text>
                </div>
              </div>
              <Switch checked={settings[item.key]} onChange={v => updateSetting(item.key, v)} />
            </div>
          ))}
        </div>
      </Card>

      <Card style={styles.card}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <Text style={styles.sectionLabel}>订阅规则</Text>
            <div style={{ marginTop: 4 }}>
              <Text style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                按项目/角色/关键字精准订阅，告别无关打扰
              </Text>
            </div>
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={addRule}
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            添加规则
          </Button>
        </div>

        {settings.rules.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            <div style={{ fontSize: 13 }}>暂无订阅规则</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              点击上方按钮添加，按项目、角色或关键字精准接收通知
            </div>
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {settings.rules.map((rule, index) => (
              <SubscriptionRule
                key={index}
                rule={rule}
                onChange={updated => updateRule(index, updated)}
                onRemove={() => removeRule(index)}
              />
            ))}
          </Space>
        )}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="primary" onClick={handleSave} loading={saving}>
          保存设置
        </Button>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100vh' },
  card: {
    background: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-soft)',
    marginBottom: 16,
  },
  sectionLabel: {
    color: 'var(--color-on-surface-variant)',
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  typeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  ruleRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
}
