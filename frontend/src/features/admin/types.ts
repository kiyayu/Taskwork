//src/features/admin/types.ts
export type Plan = 'free' | 'pro'

export type AdminStats = {
  users: { total: number; verified: number; active: number; newThisWeek: number; byPlan: Record<Plan, number> }
  projects: number
  tasks: { active: number; archived: number }
  comments: number
  attachments: number
  signups: { date: string; count: number }[]
}

export type AdminUser = {
  id: string; name: string; email: string; role: string; plan: Plan
  isActive: boolean; emailVerified: boolean; createdAt: string; projectsOwned: number
}

export type AdminUsersPage = {
  items: AdminUser[]
  pagination: { total: number; totalPage: number; currentPage: number }
}