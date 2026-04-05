// 个人中心 API
import { api } from '../../api'

export const profileApi = {
  // 获取当前用户信息
  getProfile: () => api.get('/users/me'),
  
  // 更新个人信息
  updateProfile: (data) => api.put('/users/me', data),
  
  // 修改密码 (如果后端支持)
  changePassword: (_oldPassword, _newPassword) => {
    // TODO: 后端需要实现 /users/me/password 接口
    console.warn('changePassword API not implemented in backend')
    return Promise.reject(new Error('API not implemented'))
  },
  
  // 上传头像 (如果后端支持)
  uploadAvatar: (_file) => {
    // TODO: 后端需要实现 /users/me/avatar 接口
    console.warn('uploadAvatar API not implemented in backend')
    return Promise.reject(new Error('API not implemented'))
  },
  
  // 获取通知设置
  getNotificationSettings: () => api.get('/notification-settings'),
  
  // 更新通知设置
  updateNotificationSettings: (settings) => 
    api.put('/notification-settings', settings),
}
