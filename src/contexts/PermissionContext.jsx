import { createContext, useContext, useMemo } from 'react'
import { PERMISSION_MATRIX, ROLE_HOME_ROUTES, ROLE_LABELS } from '../constants/permissions'

const PermissionContext = createContext(null)

export function PermissionProvider({ user, children }) {
  const permissions = useMemo(() => {
    if (!user?.role) return []
    return PERMISSION_MATRIX[user.role] || []
  }, [user?.role])

  const can = (action, resource) => {
    const required = resource ? `${action}:${resource}` : action
    if (permissions.includes('*')) return true
    return permissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -2)
        return required.startsWith(prefix + ':') || required === prefix
      }
      if (p.includes(':*')) {
        const [base] = p.split(':')
        return required.startsWith(base + ':')
      }
      return p === required
    })
  }

  const canAny = (actions) => actions.some(([action, resource]) => can(action, resource))

  const canAll = (actions) => actions.every(([action, resource]) => can(action, resource))

  const canAccessProject = (projectId) => {
    if (!user) return false
    if (permissions.includes('*')) return true
    if (user.assignedProjects?.includes(projectId)) return true
    if (user.managedProjects?.includes(projectId)) return true
    return false
  }

  const homeRoute = useMemo(() => {
    if (!user?.role) return '/login'
    return ROLE_HOME_ROUTES[user.role] || '/'
  }, [user?.role])

  const roleLabel = useMemo(() => {
    if (!user?.role) return ''
    return ROLE_LABELS[user.role] || user.role
  }, [user?.role])

  const value = useMemo(() => ({
    user,
    permissions,
    role: user?.role,
    roleLabel,
    can,
    canAny,
    canAll,
    canAccessProject,
    homeRoute,
  }), [user, permissions, roleLabel, homeRoute])

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('usePermission must be used within PermissionProvider')
  return ctx
}

export default PermissionContext
