import { Navigate } from 'react-router-dom'
import { usePermission } from '../../contexts/PermissionContext'

/**
 * ProtectedRoute - 角色首页路由守卫
 * @param {string[]} requires - 所需权限列表
 * @param {ReactNode} children - 受保护的内容
 * @param {string} redirectTo - 重定向路径，默认角色首页
 */
export function ProtectedRoute({ requires, children, redirectTo }) {
  const { can, homeRoute, user } = usePermission()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const requiredList = Array.isArray(requires) ? requires : [requires]
  const hasPermission = requiredList.every(p => can(...(Array.isArray(p) ? p : [p, null])))

  if (!hasPermission) {
    return <Navigate to={redirectTo || homeRoute} replace />
  }

  return children
}

export default ProtectedRoute
