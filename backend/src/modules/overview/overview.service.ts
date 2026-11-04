//src/modules/overview/overview.service.ts
import { Membership } from '../project/membership.model.js'
import { Task } from '../task/task.model.js'
import { bucketTasks, sortMyTasks } from './overview.logic.js'

const MAX_SCAN = 200
const MAX_LISTED = 10

export const overviewService = {
  // The membership filter IS the permission: only projects I belong to are ever queried.
  get: async (userId: string) => {
    const memberships = await Membership.find({ userId }).populate('projectId')
    const projects = memberships.filter((m) => m.projectId).map((m) => m.projectId as any)
    const names = new Map<string, string>(projects.map((p) => [p._id.toString(), p.name]))

    const tasks = await Task.find({
      projectId: { $in: projects.map((p) => p._id) },
      assigneeId: userId,
      archivedAt: null,
    }).limit(MAX_SCAN)

    const { overdue, dueSoon } = bucketTasks(tasks)
    return {
      projects: projects.length,
      assigned: tasks.length,
      overdue,
      dueSoon,
      tasks: sortMyTasks(tasks).slice(0, MAX_LISTED).map((t) => ({
        id: t.id,
        projectId: t.projectId.toString(),
        projectName: names.get(t.projectId.toString()) ?? '',
        title: t.title,
        dueDate: t.dueDate ?? null,
        priority: t.priority,
      })),
    }
  },
}