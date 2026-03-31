import { ROLE_LABELS, ROLE_COLORS } from '../../constants/permissions'

/**
 * RoleBadge - 角色标签组件
 * @param {string} role - 角色 key
 * @param {'filled'|'outline'} variant - 样式变体
 * @param {number} size - 字号大小
 */
export function RoleBadge({ role, variant = 'filled', size = 12 }) {
  const color = ROLE_COLORS[role] || '#d9d9d9'
  const label = ROLE_LABELS[role] || role

  if (variant === 'outline') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: 8,
          fontSize: size,
          fontWeight: 600,
          color,
          border: `1px solid ${color}40`,
          background: `${color}10`,
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 8,
        fontSize: size,
        fontWeight: 600,
        color: '#fff',
        background: color,
      }}
    >
      {label}
    </span>
  )
}

export default RoleBadge
