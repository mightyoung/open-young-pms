import React, { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Tabs,
  Row,
  Col,
  Switch,
  Divider,
  Space,
} from 'antd'
import { UserOutlined, LockOutlined, BellOutlined } from '@ant-design/icons'
import { useProfile } from '../hooks/useProfile'
import { ROLE_LABELS, ROLE_COLORS } from '../../../constants/permissions'
import SkeletonContent from '../../../components/SkeletonContent'

const { TabPane } = Tabs

export default function ProfilePage() {
  const {
    profile,
    loading,
    notificationSettings,
    loadProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    loadNotificationSettings,
    updateNotificationSettings,
  } = useProfile()

  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    loadProfile()
    loadNotificationSettings()
  }, [loadProfile, loadNotificationSettings])

  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      })
    }
  }, [profile, profileForm])

  const handleProfileSubmit = async () => {
    try {
      const values = await profileForm.validateFields()
      await updateProfile(values)
    } catch {
      // Validation failed
    }
  }

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields()
      if (values.new_password !== values.confirm_password) {
        message.error('两次密码输入不一致')
        return
      }
      await changePassword(values.old_password, values.new_password)
      passwordForm.resetFields()
    } catch {
      // Validation failed
    }
  }

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功')
    } else if (info.file.status === 'error') {
      message.error('头像上传失败')
    }
  }

  const handleNotificationChange = async (key, value) => {
    const newSettings = {
      ...notificationSettings,
      [key]: value,
    }
    await updateNotificationSettings(newSettings)
  }

  if (loading || !profile) {
    return (
      <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
        <SkeletonContent type="form" />
      </div>
    )
  }

  const roleLabel = ROLE_LABELS[profile.role] || profile.role
  const roleColor = ROLE_COLORS[profile.role] || '#1890ff'

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <Row gutter={24}>
        {/* 左侧个人信息卡片 */}
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Upload
                showUploadList={false}
                customRequest={({ file }) => uploadAvatar(file)}
                onChange={handleAvatarUpload}
              >
                <Avatar
                  size={120}
                  src={profile.avatar_url}
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', marginBottom: 16 }}
                />
              </Upload>
              <h3 style={{ margin: '8px 0 4px' }}>{profile.full_name || profile.username}</h3>
              <p style={{ color: '#666', margin: 0 }}>@{profile.username}</p>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '4px 12px',
                  borderRadius: 4,
                  background: roleColor,
                  color: '#fff',
                  fontSize: 12,
                }}
              >
                {roleLabel}
              </div>
            </div>

            <Divider />

            <div style={{ fontSize: 14 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>邮箱：</strong>{profile.email || '-'}
              </p>
              <p style={{ marginBottom: 8 }}>
                <strong>手机：</strong>{profile.phone || '-'}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>部门：</strong>{profile.department || '-'}
              </p>
            </div>
          </Card>
        </Col>

        {/* 右侧设置区域 */}
        <Col span={18}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    个人信息
                  </span>
                }
                key="info"
              >
                <Form form={profileForm} layout="vertical" style={{ maxWidth: 400, marginTop: 24 }}>
                  <Form.Item name="full_name" label="姓名">
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input placeholder="请输入邮箱" disabled />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号">
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={handleProfileSubmit}>
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <LockOutlined />
                    修改密码
                  </span>
                }
                key="password"
              >
                <Form form={passwordForm} layout="vertical" style={{ maxWidth: 400, marginTop: 24 }}>
                  <Form.Item
                    name="old_password"
                    label="旧密码"
                    rules={[{ required: true, message: '请输入旧密码' }]}
                  >
                    <Input.Password placeholder="请输入旧密码" />
                  </Form.Item>
                  <Form.Item
                    name="new_password"
                    label="新密码"
                    rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}
                  >
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  <Form.Item
                    name="confirm_password"
                    label="确认新密码"
                    rules={[{ required: true, message: '请确认新密码' }]}
                  >
                    <Input.Password placeholder="请再次输入新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={handlePasswordSubmit}>
                      修改密码
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BellOutlined />
                    通知设置
                  </span>
                }
                key="notifications"
              >
                <div style={{ marginTop: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4>消息通知</h4>
                    <div style={{ marginTop: 12 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>隐患上报通知</span>
                          <Switch
                            checked={notificationSettings?.hazard_reported ?? true}
                            onChange={(checked) => handleNotificationChange('hazard_reported', checked)}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>审批提醒</span>
                          <Switch
                            checked={notificationSettings?.approval_reminder ?? true}
                            onChange={(checked) => handleNotificationChange('approval_reminder', checked)}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>任务变更通知</span>
                          <Switch
                            checked={notificationSettings?.task_update ?? true}
                            onChange={(checked) => handleNotificationChange('task_update', checked)}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>系统公告</span>
                          <Switch
                            checked={notificationSettings?.system_announcement ?? true}
                            onChange={(checked) => handleNotificationChange('system_announcement', checked)}
                          />
                        </div>
                      </Space>
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
