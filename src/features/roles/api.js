// 角色管理 API
import { get, post, put, del } from '../../api'

const BASE = '/roles'

export const rolesApi = {
  // 获取角色列表
  list: () => get(BASE),
  
  // 获取角色详情
  get: (id) => get(`${BASE}/${id}`),
  
  // 创建角色
  create: (data) => post(BASE, data),
  
  // 更新角色
  update: (id, data) => put(`${BASE}/${id}`, data),
  
  // 删除角色
  delete: (id) => del(`${BASE}/${id}`),
  
  // 获取权限矩阵
  getPermissions: () => get(`${BASE}/permissions`),
  
  // 更新角色权限
  updatePermissions: (id, permissions) => put(`${BASE}/${id}/permissions`, { permissions }),
}
