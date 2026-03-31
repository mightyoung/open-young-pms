import { createContext, useContext, useMemo } from 'react'
import { PERMISSION_MATRIX, ROLE_HOME_ROUTES, ROLE_LABELS, ROLES } from '../constants/permissions'

const PermissionContext = createContext(null)
const ROLE_ALIASES = {
  admin: ROLES.SUPER_ADMIN,
}

function normalizeRole(role) {
  if (!role) return ''
  return ROLE_ALIASES[role] || role
}

export function PermissionProvider({ user, children }) {
  const normalizedRole = useMemo(() => normalizeRole(user?.role), [user?.role])

  const permissions = useMemo(() => {
    if (!normalizedRole) return []
    return PERMISSION_MATRIX[normalizedRole] || []
  }, [normalizedRole])

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
    if (!normalizedRole) return '/login'
    return ROLE_HOME_ROUTES[normalizedRole] || '/dashboard'
  }, [normalizedRole])

  const roleLabel = useMemo(() => {
    if (!normalizedRole) return ''
    return ROLE_LABELS[normalizedRole] || user?.role || normalizedRole
  }, [normalizedRole, user?.role])

  const value = useMemo(() => ({
    user,
    permissions,
    role: normalizedRole,
    roleLabel,
    can,
    canAny,
    canAll,
    canAccessProject,
    homeRoute,
  }), [user, permissions, normalizedRole, roleLabel, homeRoute])

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
