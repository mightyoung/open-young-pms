import { useState, useCallback } from 'react'
import { profileApi } from '../api'
import { message } from 'antd'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await profileApi.getProfile()
      setProfile(res?.data || res)
    } catch {
      message.error('加载个人信息失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      await profileApi.updateProfile(data)
      message.success('更新成功')
      await loadProfile()
      return true
    } catch {
      message.error('更新失败')
      return false
    }
  }, [loadProfile])

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await profileApi.changePassword(oldPassword, newPassword)
      message.success('密码修改成功')
      return true
    } catch {
      message.error('密码修改失败')
      return false
    }
  }, [])

  const uploadAvatar = useCallback(async (file) => {
    try {
      await profileApi.uploadAvatar(file)
      message.success('头像上传成功')
      await loadProfile()
      return true
    } catch {
      message.error('头像上传失败')
      return false
    }
  }, [loadProfile])

  const loadNotificationSettings = useCallback(async () => {
    try {
      const res = await profileApi.getNotificationSettings()
      setNotificationSettings(res?.data || res)
    } catch {
      console.error('加载通知设置失败')
    }
  }, [])

  const updateNotificationSettings = useCallback(async (settings) => {
    try {
      await profileApi.updateNotificationSettings(settings)
      message.success('设置更新成功')
      await loadNotificationSettings()
      return true
    } catch {
      message.error('设置更新失败')
      return false
    }
  }, [loadNotificationSettings])

  return {
    profile,
    loading,
    notificationSettings,
    loadProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    loadNotificationSettings,
    updateNotificationSettings,
  }
}
