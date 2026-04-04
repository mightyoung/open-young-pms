import { useState, useCallback } from 'react'
import { rolesApi } from '../api'
import { message } from 'antd'

export function useRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState([])

  const loadRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await rolesApi.list()
      setRoles(res?.data || res || [])
    } catch {
      message.error('加载角色失败')
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createRole = useCallback(async (data) => {
    try {
      await rolesApi.create(data)
      message.success('创建成功')
      await loadRoles()
      return true
    } catch {
      message.error('创建失败')
      return false
    }
  }, [loadRoles])

  const updateRole = useCallback(async (id, data) => {
    try {
      await rolesApi.update(id, data)
      message.success('更新成功')
      await loadRoles()
      return true
    } catch {
      message.error('更新失败')
      return false
    }
  }, [loadRoles])

  const deleteRole = useCallback(async (id) => {
    try {
      await rolesApi.delete(id)
      message.success('删除成功')
      await loadRoles()
      return true
    } catch {
      message.error('删除失败')
      return false
    }
  }, [loadRoles])

  const loadPermissions = useCallback(async () => {
    try {
      const res = await rolesApi.getPermissions()
      setPermissions(res?.data || [])
    } catch {
      console.error('加载权限失败')
    }
  }, [])

  const updateRolePermissions = useCallback(async (roleId, permissions) => {
    try {
      await rolesApi.updatePermissions(roleId, permissions)
      message.success('权限更新成功')
      return true
    } catch {
      message.error('权限更新失败')
      return false
    }
  }, [])

  return {
    roles,
    loading,
    permissions,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    loadPermissions,
    updateRolePermissions,
  }
}
