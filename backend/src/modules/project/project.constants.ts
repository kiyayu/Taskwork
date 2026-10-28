//src/modules/project/project.constants.ts
export const PLANS = ['free', 'pro'] as const
export type Plan = (typeof PLANS)[number]

 
export const PLAN_LIMITS: Record<Plan, { projects: number; membersPerProject: number }> = {
  free: { projects: 3, membersPerProject: 5 },
  pro: { projects: Number.POSITIVE_INFINITY, membersPerProject: Number.POSITIVE_INFINITY },
}