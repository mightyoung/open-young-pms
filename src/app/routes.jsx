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
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'))
const ForumPage = lazy(() => import('../features/forum/pages/ForumPage'))
const HazardsPage = lazy(() => import('../features/hazards/pages/HazardsPage'))

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
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ])
}

export default AppRoutes
