/**
 * Icon map — maps string keys to Ant Design icon components.
 * Consumed by menu.config.js resolution at render time.
 */
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  SafetyOutlined,
  BarChartOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  CameraOutlined,
  AlertOutlined,
  LockOutlined,
  RobotOutlined,
  AuditOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'

export const ICON_MAP = {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  SafetyOutlined,
  BarChartOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  DatabaseOutlined,
  CalendarOutlined,
  CameraOutlined,
  AlertOutlined,
  LockOutlined,
  RobotOutlined,
  AuditOutlined,
  CheckSquareOutlined,
}

export function resolveIcon(iconKey) {
  return ICON_MAP[iconKey] || null
}
