//src/features/dashboard/types.ts
export type OverviewTask = {
  id: string
  projectId: string
  projectName: string
  title: string
  dueDate: string | null
  priority: 1 | 2 | 3
}

export type Overview = { projects: number; assigned: number; overdue: number; dueSoon: number; tasks: OverviewTask[] }