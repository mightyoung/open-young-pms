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
}

export const DEFAULT_AUTH_ROUTE = ROUTE_META.dashboard.path

export function getMenuKeyByPath(pathname) {
  const item = Object.values(ROUTE_META).find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))
  return item?.key || 'dashboard'
}
