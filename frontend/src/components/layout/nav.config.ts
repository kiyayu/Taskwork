//src/components/layout/nav.config.ts
import { LayoutDashboard, FolderKanban, ShieldCheck, User, Settings, type LucideIcon } from 'lucide-react'
import type { ParseKeys } from 'i18next'
import { paths } from '@/config/paths'
import { site } from '@/config/site'

export type NavItem = { labelKey: ParseKeys<'layout'>; to: string; icon: LucideIcon; roles?: string[] }
export type LayoutVariant = 'sidebar' | 'topnav'

 const nav: NavItem[] = [
  { labelKey: 'nav.dashboard', to: paths.app.dashboard, icon: LayoutDashboard },
  { labelKey: 'nav.projects', to: paths.app.projects, icon: FolderKanban },
  { labelKey: 'nav.admin', to: paths.app.admin, icon: ShieldCheck, roles: ['admin'] },
]

const account: NavItem[] = [
  { labelKey: 'account.profile', to: paths.settings.profile, icon: User },
  { labelKey: 'account.settings', to: paths.settings.root, icon: Settings },
]

export const appConfig = {
  brand: site.name,
  layout: 'sidebar' as LayoutVariant,
  nav,
  account,
}