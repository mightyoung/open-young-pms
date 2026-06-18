/**
 * Icon map — maps string keys to Ant Design icon components.
 * Consumed by menu.config.js resolution at render time.
 */
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  ToolOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  MessageOutlined,
  EditOutlined,
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
  AppstoreOutlined,
} from '@ant-design/icons'

export const ICON_MAP = {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  ToolOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  SafetyOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  MessageOutlined,
  EditOutlined,
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
  AppstoreOutlined,
}

export function resolveIcon(iconKey) {
  return ICON_MAP[iconKey] || null
}
