/**
 * Menu configuration — pure data, no UI component imports.
 * Icon resolution happens at render time via icon-map.js.
 */
import { ROUTE_META, ROUTE_VISIBILITY } from './route-map'

const MAIN_MENU_ORDER = [
  'dashboard',
  'projects',
  'tasks',
  'hazards',
  'reports',
  'approvalCenter',
  'system',
]

const ICON_BY_KEY = {
  dashboard: 'DashboardOutlined',
  projects: 'ProjectOutlined',
  tasks: 'ToolOutlined',
  hazards: 'SafetyOutlined',
  reports: 'FileTextOutlined',
  approvalCenter: 'AuditOutlined',
  system: 'SettingOutlined',
}

export const MENU_ITEMS = Object.values(ROUTE_META)
  .filter(route => route.visibility === ROUTE_VISIBILITY.MAIN)
  .sort((left, right) => MAIN_MENU_ORDER.indexOf(left.key) - MAIN_MENU_ORDER.indexOf(right.key))
  .map(route => ({
    key: route.key,
    label: route.label,
    path: route.path,
    iconKey: ICON_BY_KEY[route.key],
  }))

export const SECONDARY_MENU_ITEMS = Object.values(ROUTE_META)
  .filter(route => route.visibility === ROUTE_VISIBILITY.SECONDARY)
  .map(route => ({
    key: route.key,
    label: route.label,
    path: route.path,
    parent: route.menuParent,
  }))
