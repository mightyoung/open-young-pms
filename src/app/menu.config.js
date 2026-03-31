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
]
