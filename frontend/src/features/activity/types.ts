//src/features/activity/types.ts
export const ACTIVITY_TYPES = [
  'task_created', 'task_moved', 'task_archived', 'task_restored', 'task_deleted', 'task_assigned',
  'comment_added', 'attachment_added', 'member_joined', 'member_removed', 'list_created',
] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export type ActivityItem = {
  id: string
  type: ActivityType
  actorId: string
  actorName: string
  taskId: string | null
  meta: { taskTitle?: string; listName?: string; targetName?: string }
  createdAt: string
}

export type ActivityPage = { items: ActivityItem[]; nextBefore: string | null }