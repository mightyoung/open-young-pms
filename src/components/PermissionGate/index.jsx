import { usePermission } from '../../hooks/usePermission'

/**
 * PermissionGate - 权限门控组件
 * @param {string|string[]} requires - 所需权限列表
 * @param {'any'|'all'} mode - 权限匹配模式，默认 'any'
 * @param {ReactNode} fallback - 无权限时的降级 UI，默认 null
 * @param {boolean} silent - 是否静默模式（不渲染 fallback），默认 false
 */
export function PermissionGate({
  requires,
  mode = 'any',
  fallback = null,
  silent = false,
  children,
}) {
  const { can } = usePermission()

  const requiredList = Array.isArray(requires) ? requires : [requires]

  const granted =
    mode === 'all'
      ? requiredList.every(p => can(...(Array.isArray(p) ? p : [p, null])))
      : requiredList.some(p => can(...(Array.isArray(p) ? p : [p, null])))

  if (!granted) {
    return silent ? null : fallback
  }

  return children
}

export default PermissionGate
