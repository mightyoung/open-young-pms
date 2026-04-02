/**
 * Menu configuration — pure data, no UI component imports.
 * Icon resolution happens at render time via icon-map.js.
 */
import { ROUTE_META } from './route-map'

export const MENU_ITEMS = [
  {
    key: ROUTE_META.dashboard.key,
    label: ROUTE_META.dashboard.label,
    path: ROUTE_META.dashboard.path,
    iconKey: 'DashboardOutlined',
  },
  {
    key: ROUTE_META.users.key,
    label: ROUTE_META.users.label,
    path: ROUTE_META.users.path,
    iconKey: 'TeamOutlined',
  },
  {
    key: ROUTE_META.projects.key,
    label: ROUTE_META.projects.label,
    path: ROUTE_META.projects.path,
    iconKey: 'ProjectOutlined',
  },
  {
    key: ROUTE_META.tasks.key,
    label: ROUTE_META.tasks.label,
    path: ROUTE_META.tasks.path,
    iconKey: 'ToolOutlined',
  },
  {
    key: ROUTE_META.notifications.key,
    label: ROUTE_META.notifications.label,
    path: ROUTE_META.notifications.path,
    iconKey: 'BellOutlined',
  },
  {
    key: ROUTE_META.reports.key,
    label: ROUTE_META.reports.label,
    path: ROUTE_META.reports.path,
    iconKey: 'FileTextOutlined',
  },
  {
    key: ROUTE_META.forum.key,
    label: ROUTE_META.forum.label,
    path: ROUTE_META.forum.path,
    iconKey: 'MessageOutlined',
  },
  {
    key: ROUTE_META.hazards.key,
    label: ROUTE_META.hazards.label,
    path: ROUTE_META.hazards.path,
    iconKey: 'SafetyOutlined',
  },
  {
    key: ROUTE_META.risks.key,
    label: ROUTE_META.risks.label,
    path: ROUTE_META.risks.path,
    iconKey: 'AlertOutlined',
  },
  {
    key: ROUTE_META.quality.key,
    label: ROUTE_META.quality.label,
    path: ROUTE_META.quality.path,
    iconKey: 'CheckCircleOutlined',
  },
  {
    key: ROUTE_META.organization.key,
    label: ROUTE_META.organization.label,
    path: ROUTE_META.organization.path,
    iconKey: 'TeamOutlined',
  },
]
