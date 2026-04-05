import React, { Suspense, lazy } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import AuthenticatedRoute from '../components/auth/AuthenticatedRoute'
import PublicRoute from '../components/auth/PublicRoute'
import MainLayout from './MainLayout'
import SkeletonContent from '../components/SkeletonContent'
import LoginPage from '../pages/Login'
import { DEFAULT_AUTH_ROUTE } from './route-map'

// Lazy-loaded feature pages — each becomes a separate chunk
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const UsersPage = lazy(() => import('../features/users/pages/UsersPage'))
const ProjectsPage = lazy(() => import('../features/projects/pages/ProjectsPage'))
const TasksPage = lazy(() => import('../features/tasks/pages/TasksPage'))
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'))
const NotificationSettingsPage = lazy(
  () => import('../features/notifications/pages/NotificationSettingsPage')
)
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'))
const ForumPage = lazy(() => import('../features/forum/pages/ForumPage'))
const HazardsPage = lazy(() => import('../features/hazards/pages/HazardsPage'))
const RisksPage = lazy(() => import('../features/risks/pages/RisksPage'))
const QualityPage = lazy(() => import('../features/quality/pages/QualityPage'))
const OrganizationPage = lazy(() => import('../features/organization/pages/OrganizationPage'))
const AIChatPage = lazy(() => import('../features/ai-chat/pages/AIChatPage'))
const ContractsPage = lazy(() => import('../features/contracts/pages/ContractsPage'))
const ApprovalCenterPage = lazy(
  () => import('../features/approval-center/pages/ApprovalCenterPage')
)
const ResourcesPage = lazy(() => import('../features/resources/pages/ResourcesPage'))
const RolesPage = lazy(() => import('../features/roles/pages/RolesPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))

function NotFoundPage() {
  return <Navigate to={DEFAULT_AUTH_ROUTE} replace />
}

function PageLoader() {
  return <SkeletonContent />
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
        {
          path: 'dashboard',
          element: (
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          ),
        },
        {
          path: 'users',
          element: (
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          ),
        },
        {
          path: 'projects',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProjectsPage />
            </Suspense>
          ),
        },
        {
          path: 'tasks',
          element: (
            <Suspense fallback={<PageLoader />}>
              <TasksPage />
            </Suspense>
          ),
        },
        {
          path: 'notifications',
          element: (
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          ),
        },
        {
          path: 'notification-settings',
          element: (
            <Suspense fallback={<PageLoader />}>
              <NotificationSettingsPage />
            </Suspense>
          ),
        },
        {
          path: 'reports',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          ),
        },
        {
          path: 'forum',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ForumPage />
            </Suspense>
          ),
        },
        {
          path: 'hazards',
          element: (
            <Suspense fallback={<PageLoader />}>
              <HazardsPage />
            </Suspense>
          ),
        },
        {
          path: 'risks',
          element: (
            <Suspense fallback={<PageLoader />}>
              <RisksPage />
            </Suspense>
          ),
        },
        {
          path: 'quality',
          element: (
            <Suspense fallback={<PageLoader />}>
              <QualityPage />
            </Suspense>
          ),
        },
        {
          path: 'organization',
          element: (
            <Suspense fallback={<PageLoader />}>
              <OrganizationPage />
            </Suspense>
          ),
        },
        {
          path: 'ai-chat',
          element: (
            <Suspense fallback={<PageLoader />}>
              <AIChatPage />
            </Suspense>
          ),
        },
        {
          path: 'contracts',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ContractsPage />
            </Suspense>
          ),
        },
        {
          path: 'approval-center',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ApprovalCenterPage />
            </Suspense>
          ),
        },
        {
          path: 'resources',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ResourcesPage />
            </Suspense>
          ),
        },
        {
          path: 'roles',
          element: (
            <Suspense fallback={<PageLoader />}>
              <RolesPage />
            </Suspense>
          ),
        },
        {
          path: 'profile',
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ])
}

export default AppRoutes
