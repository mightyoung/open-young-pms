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
  reports: {
    key: 'reports',
    path: '/reports',
    label: '报告中心',
  },
  forum: {
    key: 'forum',
    path: '/forum',
    label: '论坛',
  },
  hazards: {
    key: 'hazards',
    path: '/hazards',
    label: '隐患管理',
  },
  drafts: {
    key: 'drafts',
    path: '/drafts',
    label: '草稿箱',
  },
  risks: {
    key: 'risks',
    path: '/risks',
    label: '风险管理',
  },
  quality: {
    key: 'quality',
    path: '/quality',
    label: '质量管理',
  },
  organization: {
    key: 'organization',
    path: '/organization',
    label: '组织架构',
  },
  aiChat: {
    key: 'aiChat',
    path: '/ai-chat',
    label: 'AI助手',
  },
  contracts: {
    key: 'contracts',
    path: '/contracts',
    label: '合同管理',
  },
  approvalCenter: {
    key: 'approvalCenter',
    path: '/approval-center',
    label: '审批中心',
  },
  resources: {
    key: 'resources',
    path: '/resources',
    label: '资源调度',
  },
  roles: {
    key: 'roles',
    path: '/roles',
    label: '角色管理',
  },
  profile: {
    key: 'profile',
    path: '/profile',
    label: '个人中心',
  },
}

export const DEFAULT_AUTH_ROUTE = ROUTE_META.dashboard.path

export function getMenuKeyByPath(pathname) {
  const item = Object.values(ROUTE_META).find(
    route => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )
  return item?.key || 'dashboard'
}
