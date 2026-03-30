export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_LEADER: 'company_leader',
  DEPT_LEADER: 'dept_leader',
  SECTION_CHIEF: 'section_chief',
  PROJECT_MANAGER: 'project_manager',
  FIELD_STAFF: 'field_staff',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: '超级管理员',
  [ROLES.COMPANY_LEADER]: '公司领导',
  [ROLES.DEPT_LEADER]: '部门领导',
  [ROLES.SECTION_CHIEF]: '科室负责人',
  [ROLES.PROJECT_MANAGER]: '项目负责人',
  [ROLES.FIELD_STAFF]: '现场人员',
}

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: '#ff4d4f',
  [ROLES.COMPANY_LEADER]: '#1890ff',
  [ROLES.DEPT_LEADER]: '#722ed1',
  [ROLES.SECTION_CHIEF]: '#faad14',
  [ROLES.PROJECT_MANAGER]: '#52c41a',
  [ROLES.FIELD_STAFF]: '#13c2c2',
}

export const PERMISSION_MATRIX = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.COMPANY_LEADER]: [
    'project:read:all',
    'approval:all',
    'report:read:all',
    'ai:chat',
    'issue:read:all',
  ],
  [ROLES.DEPT_LEADER]: [
    'project:read:dept',
    'approval:dept',
    'report:read:dept',
    'ai:chat',
    'issue:read:dept',
    'monitor:view',
  ],
  [ROLES.SECTION_CHIEF]: [
    'approval:section',
    'issue:verify',
    'report:read:section',
    'ai:chat',
    'issue:read:section',
  ],
  [ROLES.PROJECT_MANAGER]: [
    'project:manage',
    'task:*',
    'issue:manage',
    'report:manage',
    'ai:chat:project',
  ],
  [ROLES.FIELD_STAFF]: [
    'issue:create',
    'task:execute',
    'report:create',
    'ai:chat',
  ],
}

export const ROLE_HOME_ROUTES = {
  [ROLES.SUPER_ADMIN]: '/admin',
  [ROLES.COMPANY_LEADER]: '/dashboard',
  [ROLES.DEPT_LEADER]: '/dept',
  [ROLES.SECTION_CHIEF]: '/approvals',
  [ROLES.PROJECT_MANAGER]: '/projects',
  [ROLES.FIELD_STAFF]: '/mobile',
}

export const ROLE_MENUS = {
  [ROLES.SUPER_ADMIN]: [
    'admin', 'admin/users', 'admin/roles', 'admin/departments', 'admin/workflows',
    'dashboard', 'projects', 'projects/all', 'issues/all', 'reports/all',
    'approvals', 'ai', 'forum', 'notifications', 'settings',
  ],
  [ROLES.COMPANY_LEADER]: [
    'dashboard', 'projects', 'issues/all', 'reports/all', 'approvals', 'ai', 'forum', 'notifications', 'settings',
  ],
  [ROLES.DEPT_LEADER]: [
    'dept', 'projects/my-dept', 'issues/dept', 'monitor', 'approvals', 'ai', 'forum', 'notifications', 'settings',
  ],
  [ROLES.SECTION_CHIEF]: [
    'approvals', 'issues/section', 'reports/section', 'ai', 'forum', 'notifications', 'settings',
  ],
  [ROLES.PROJECT_MANAGER]: [
    'projects', 'projects/:id', 'projects/:id/tasks', 'projects/:id/gantt',
    'projects/:id/issues', 'projects/:id/reports', 'ai', 'forum', 'notifications', 'settings',
  ],
  [ROLES.FIELD_STAFF]: [
    'mobile', 'mobile/capture', 'mobile/tasks', 'mobile/reports',
    'my-tasks', 'my-reports', 'forum', 'notifications', 'settings',
  ],
}

export function hasPermission(permissions, required) {
  if (permissions.includes('*')) return true
  return permissions.some(p => {
    if (p.endsWith(':*')) {
      const prefix = p.slice(0, -2)
      return required.some(r => r.startsWith(prefix + ':'))
    }
    if (p.includes(':read:') || p.includes(':manage') || p.includes(':create') || p.includes(':verify')) {
      return required.includes(p)
    }
    return p === required
  })
}
