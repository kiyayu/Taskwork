// src/app/router/PublicPath.ts
import { redirect, type RouteObject } from 'react-router-dom'
import type { QueryClient } from '@tanstack/react-query'
import { paths } from '@/config/paths'
import { sessionQueryOptions, getSafeRedirect } from '@/features/auth'

const page = (load: () => Promise<{ default: React.ComponentType }>) => () =>
  load().then((m) => ({ Component: m.default }))

export const marketingRoutes: RouteObject[] = [
  { index: true, lazy: page(() => import('@/features/marketing/pages/HomePage')) },
  { path: 'contact', handle: { title: 'Contact' }, lazy: page(() => import('@/features/marketing/pages/ContactPage')) },
  { path: 'terms', handle: { title: 'Terms of Service' }, lazy: page(() => import('@/features/marketing/pages/TermsPage')) },
  { path: 'privacy', handle: { title: 'Privacy Policy' }, lazy: page(() => import('@/features/marketing/pages/PrivacyPage')) },
  { path: 'price', handle: { title: 'Pricing' }, lazy: page(() => import('@/features/marketing/pages/PricePage')) },
]

export const authRoutes: RouteObject[] = [
  { path: 'login', handle: { title: 'Log in' }, lazy: page(() => import('@/features/auth/pages/LoginPage')) },
  { path: 'register', handle: { title: 'Create account' }, lazy: page(() => import('@/features/auth/pages/RegisterPage')) },
  { path: 'verify-email', handle: { title: 'Verify email' }, lazy: page(() => import('@/features/auth/pages/VerifyEmailPage')) },
  { path: 'forgot-password', handle: { title: 'Forgot password' }, lazy: page(() => import('@/features/auth/pages/ForgotPasswordPage')) },
  { path: 'reset-password', handle: { title: 'Reset password' }, lazy: page(() => import('@/features/auth/pages/ResetPasswordPage')) },
]

const redirectTarget = (request: Request) =>
  getSafeRedirect(new URL(request.url).searchParams.get('redirect'))

export function createAuthGuard(queryClient: QueryClient) {
  return async ({ request }: { request: Request }) => {
    const cached = queryClient.getQueryData(sessionQueryOptions.queryKey)

    if (cached !== undefined) {
      return cached ? redirect(redirectTarget(request)) : null
    }

    try {
      const user = await queryClient.ensureQueryData(sessionQueryOptions)
      if (user) return redirect(redirectTarget(request))
    } catch {
      return null
    }

    return null
  }
}

export function createHomeGuard(queryClient: QueryClient) {
  return async () => {
    let user = queryClient.getQueryData(sessionQueryOptions.queryKey)

    if (user === undefined) {
      try {
        user = await queryClient.ensureQueryData(sessionQueryOptions)
      } catch {
        return null
      }
    }

    return user ? redirect(paths.app.dashboard) : null
  }
}