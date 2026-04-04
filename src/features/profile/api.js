// 个人中心 API
import { get, put, post } from '../../api'

export const profileApi = {
  // 获取当前用户信息
  getProfile: () => get('/users/me'),
  
  // 更新个人信息
  updateProfile: (data) => put('/users/me', data),
  
  // 修改密码
  changePassword: (oldPassword, newPassword) => 
    post('/users/me/password', { old_password: oldPassword, new_password: newPassword }),
  
  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return post('/users/me/avatar', formData)
  },
  
  // 获取通知设置
  getNotificationSettings: () => get('/users/me/notification-settings'),
  
  // 更新通知设置
  updateNotificationSettings: (settings) => 
    put('/users/me/notification-settings', settings),
}
