//src/app/router/PrivatePath.tsx  (complete file)
import { redirect, type RouteObject } from 'react-router-dom'
import { paths } from '@/config/paths'
import { queryClient } from '@/lib/query.client'
import { sessionQueryOptions } from '@/features/auth'
import { settingsConfig } from '@/features/settings/settings.config'
import { ErrorPanel } from '@/components/layout/ErrorPanel'

const page = (load: () => Promise<{ default: React.ComponentType }>) => () =>
  load().then((m) => ({ Component: m.default }))

const notFound = () => {
  throw new Response('Not Found', { status: 404 })
}

// UX gate only: the API refuses non-admins with 403 regardless.
const requireAdmin = async () => {
  const user = await queryClient.ensureQueryData(sessionQueryOptions)
  return user?.role === 'admin' ? null : redirect(paths.app.dashboard)
}

export const PrivateRoute: RouteObject[] = [
  {
    errorElement: <ErrorPanel />,
    children: [
      { index: true, loader: () => redirect(paths.app.dashboard) },
      { path: 'dashboard', handle: { titleKey: 'titles.dashboard' }, lazy: page(() => import('@/features/dashboard/pages/DashboardPage')) },
      { path: 'projects', handle: { titleKey: 'titles.projects' }, lazy: page(() => import('@/features/projects/pages/ProjectsPage')) },
      { path: 'projects/:projectId', handle: { titleKey: 'titles.board' }, lazy: page(() => import('@/features/board/pages/BoardPage')) },
      { path: 'projects/:projectId/members', handle: { titleKey: 'titles.members' }, lazy: page(() => import('@/features/members/pages/MembersPage')) },
      { path: 'invite/:token', handle: { titleKey: 'titles.invite' }, lazy: page(() => import('@/features/members/pages/AcceptInvitePage')) },
      { path: 'admin', handle: { titleKey: 'titles.admin' }, loader: requireAdmin, lazy: page(() => import('@/features/admin/pages/AdminPage')) },
      {
        path: 'settings',
        lazy: page(() => import('@/features/settings/SettingsLayout')),
        children: [
          { index: true, loader: () => redirect(settingsConfig.defaultPath) },
          { path: 'profile', handle: { titleKey: 'titles.profile' }, lazy: page(() => import('@/features/settings/pages/ProfilePage')) },
          { path: 'preferences', handle: { titleKey: 'titles.preferences' }, lazy: page(() => import('@/features/settings/pages/PreferencesPage')) },
          { path: 'notifications', handle: { titleKey: 'titles.notifications' }, lazy: page(() => import('@/features/settings/pages/NotificationsPage')) },
          { path: 'account', handle: { titleKey: 'titles.account' }, lazy: page(() => import('@/features/settings/pages/AccountPage')) },
          { path: 'security', handle: { titleKey: 'titles.security' }, lazy: page(() => import('@/features/settings/pages/SecurityPage')) },
          { path: 'privacy', handle: { titleKey: 'titles.privacyData' }, lazy: page(() => import('@/features/settings/pages/PrivacyPage')) },
        ],
      },
      { path: '*', loader: notFound },
    ],
  },
]