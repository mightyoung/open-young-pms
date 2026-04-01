export const ROUTE_META = {
  dashboard: {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
  },
  users: {
    key: 'users',
    path: '/users',
    label: '用户管理',
  },
  projects: {
    key: 'projects',
    path: '/projects',
    label: '项目管理',
  },
  tasks: {
    key: 'tasks',
    path: '/tasks',
    label: '任务管理',
  },
  notifications: {
    key: 'notifications',
    path: '/notifications',
    label: '消息通知',
  },
}

export const DEFAULT_AUTH_ROUTE = ROUTE_META.dashboard.path

export function getMenuKeyByPath(pathname) {
  const item = Object.values(ROUTE_META).find(
    route => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )
  return item?.key || 'dashboard'
}
