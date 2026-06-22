export const ROUTE_VISIBILITY = {
  MAIN: 'main',
  SECONDARY: 'secondary',
  HIDDEN: 'hidden',
  EXPERIMENTAL: 'experimental',
}

export const ROUTE_SECTIONS = {
  WORKFLOW: 'workflow',
  PROJECT_CONTEXT: 'project_context',
  SYSTEM: 'system',
  PERSONAL: 'personal',
  EXPERIMENTAL: 'experimental',
}

export const ROUTE_META = {
  dashboard: {
    key: 'dashboard',
    path: '/dashboard',
    label: '仪表盘',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  projects: {
    key: 'projects',
    path: '/projects',
    label: '项目管理',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  tasks: {
    key: 'tasks',
    path: '/tasks',
    label: '任务管理',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  hazards: {
    key: 'hazards',
    path: '/hazards',
    label: '随手拍/隐患',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  reports: {
    key: 'reports',
    path: '/reports',
    label: '报告中心',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  approvalCenter: {
    key: 'approvalCenter',
    path: '/approval-center',
    label: '审批中心',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.WORKFLOW,
  },
  system: {
    key: 'system',
    path: '/users',
    label: '系统管理',
    visibility: ROUTE_VISIBILITY.MAIN,
    section: ROUTE_SECTIONS.SYSTEM,
  },
  users: {
    key: 'users',
    path: '/users',
    label: '用户管理',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.SYSTEM,
    menuParent: 'system',
  },
  organization: {
    key: 'organization',
    path: '/organization',
    label: '组织架构',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.SYSTEM,
    menuParent: 'system',
  },
  roles: {
    key: 'roles',
    path: '/roles',
    label: '角色管理',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.SYSTEM,
    menuParent: 'system',
  },
  projectLifecycle: {
    key: 'projectLifecycle',
    path: '/projects/lifecycle',
    label: '项目流程模板',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
    menuParent: 'projects',
  },
  contracts: {
    key: 'contracts',
    path: '/contracts',
    label: '合同管理',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
    menuParent: 'projects',
  },
  risks: {
    key: 'risks',
    path: '/risks',
    label: '风险管理',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
    menuParent: 'projects',
  },
  quality: {
    key: 'quality',
    path: '/quality',
    label: '质量管理',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
    menuParent: 'projects',
  },
  resources: {
    key: 'resources',
    path: '/resources',
    label: '资源调度',
    visibility: ROUTE_VISIBILITY.SECONDARY,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
    menuParent: 'projects',
  },
  notifications: {
    key: 'notifications',
    path: '/notifications',
    label: '消息通知',
    visibility: ROUTE_VISIBILITY.HIDDEN,
    section: ROUTE_SECTIONS.PERSONAL,
  },
  drafts: {
    key: 'drafts',
    path: '/drafts',
    label: '草稿箱',
    visibility: ROUTE_VISIBILITY.HIDDEN,
    section: ROUTE_SECTIONS.PERSONAL,
  },
  forum: {
    key: 'forum',
    path: '/forum',
    label: '论坛',
    visibility: ROUTE_VISIBILITY.HIDDEN,
    section: ROUTE_SECTIONS.PROJECT_CONTEXT,
  },
  profile: {
    key: 'profile',
    path: '/profile',
    label: '个人中心',
    visibility: ROUTE_VISIBILITY.HIDDEN,
    section: ROUTE_SECTIONS.PERSONAL,
  },
  aiChat: {
    key: 'aiChat',
    path: '/ai-chat',
    label: 'AI助手',
    visibility: ROUTE_VISIBILITY.EXPERIMENTAL,
    section: ROUTE_SECTIONS.EXPERIMENTAL,
  },
}

export const DEFAULT_AUTH_ROUTE = ROUTE_META.dashboard.path

export function getMenuKeyByPath(pathname) {
  const item = Object.values(ROUTE_META)
    .sort((left, right) => right.path.length - left.path.length)
    .find(route => pathname === route.path || pathname.startsWith(`${route.path}/`))

  return item?.menuParent || item?.key || 'dashboard'
}
