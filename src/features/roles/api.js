// 角色管理 API
import { api } from '../../api'

const BASE = '/roles'

export const rolesApi = {
  // 获取角色列表
  list: () => api.get(BASE),
  
  // 获取角色详情
  get: (id) => api.get(`${BASE}/${id}`),
  
  // 创建角色
  create: (data) => api.post(BASE, data),
  
  // 更新角色
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  
  // 删除角色
  delete: (id) => api.delete(`${BASE}/${id}`),
  
  // 更新角色权限 (PATCH /roles/{id})
  updatePermissions: (id, permissions) => api.patch(`${BASE}/${id}`, { permissions }),
}
