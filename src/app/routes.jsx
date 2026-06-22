import React, { Suspense, lazy } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import AuthenticatedRoute from '../components/auth/AuthenticatedRoute'
import PublicRoute from '../components/auth/PublicRoute'
import MainLayout from './MainLayout'
import SkeletonContent from '../components/SkeletonContent'
import LoginPage from '../pages/Login'
import { DEFAULT_AUTH_ROUTE } from './route-map'

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const UsersPage = lazy(() => import('../features/users/pages/UsersPage'))
const ProjectsPage = lazy(() => import('../features/projects/pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('../features/projects/pages/ProjectDetailPage'))
const ProjectLifecyclePage = lazy(() => import('../features/projects/pages/ProjectLifecyclePage'))
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage'))
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'))
const NotificationSettingsPage = lazy(() =>
  import('../features/notifications/pages/NotificationSettingsPage')
)
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'))
const ForumPage = lazy(() => import('../features/forum/pages/ForumPage'))
const HazardsPage = lazy(() => import('../features/hazards/pages/HazardsPage'))
const DraftBoxPage = lazy(() => import('../pages/DraftBox'))
const RisksPage = lazy(() => import('../features/risks/pages/RisksPage'))
const QualityPage = lazy(() => import('../features/quality/pages/QualityPage'))
const OrganizationPage = lazy(() => import('../features/organization/pages/OrganizationPage'))
const AIChatPage = lazy(() => import('../features/ai-chat/pages/AIChatPage'))
const ContractsPage = lazy(() => import('../features/contracts/pages/ContractsPage'))
const ApprovalCenterPage = lazy(() =>
  import('../features/approval-center/pages/ApprovalCenterPage')
)
const ResourcesPage = lazy(() => import('../features/resources/pages/ResourcesPage'))
const RolesPage = lazy(() => import('../features/roles/pages/RolesPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))

function PageLoader() {
  return <SkeletonContent />
}

function withLoader(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function NotFoundPage() {
  return <Navigate to={DEFAULT_AUTH_ROUTE} replace />
}

export function AppRoutes() {
  return useRoutes([
    {
      path: '/login',
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    {
      path: '/',
      element: (
        <AuthenticatedRoute>
          <MainLayout />
        </AuthenticatedRoute>
      ),
      children: [
        { index: true, element: <Navigate to={DEFAULT_AUTH_ROUTE} replace /> },
        { path: 'dashboard', element: withLoader(DashboardPage) },
        { path: 'users', element: withLoader(UsersPage) },
        { path: 'projects', element: withLoader(ProjectsPage) },
        { path: 'projects/lifecycle', element: withLoader(ProjectLifecyclePage) },
        { path: 'projects/:projectId', element: withLoader(ProjectDetailPage) },
        { path: 'tasks', element: withLoader(TasksPage) },
        { path: 'notifications', element: withLoader(NotificationsPage) },
        { path: 'notification-settings', element: withLoader(NotificationSettingsPage) },
        { path: 'reports', element: withLoader(ReportsPage) },
        { path: 'forum', element: withLoader(ForumPage) },
        { path: 'hazards', element: withLoader(HazardsPage) },
        { path: 'drafts', element: withLoader(DraftBoxPage) },
        { path: 'risks', element: withLoader(RisksPage) },
        { path: 'quality', element: withLoader(QualityPage) },
        { path: 'organization', element: withLoader(OrganizationPage) },
        { path: 'ai-chat', element: withLoader(AIChatPage) },
        { path: 'contracts', element: withLoader(ContractsPage) },
        { path: 'approval-center', element: withLoader(ApprovalCenterPage) },
        { path: 'resources', element: withLoader(ResourcesPage) },
        { path: 'roles', element: withLoader(RolesPage) },
        { path: 'profile', element: withLoader(ProfilePage) },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ])
}

export default AppRoutes
