//src/modules/activity/activity.service.ts
import { logger } from '../../common/utils/logger.js'
import { projectService } from '../project/project.service.js'
import { User } from '../user/user.model.js'
import { Activity } from './activity.model.js'
import type { ActivityMeta, ActivityType } from './activity.types.js'

export interface ActivityDTO {
  id: string; type: ActivityType; actorId: string; actorName: string
  taskId: string | null; meta: ActivityMeta; createdAt: Date
}

const MAX_LIMIT = 50

export const activityService = {
  // NEVER throws: the action already succeeded.
  record: async (input: {
    projectId: string; actorId: string; type: ActivityType; taskId?: string | null; meta?: ActivityMeta
  }): Promise<void> => {
    try {
      await Activity.create({
        projectId: input.projectId, actorId: input.actorId, type: input.type,
        taskId: input.taskId ?? null, meta: input.meta ?? {},
      })
    } catch (err) {
      logger.error({ err, type: input.type }, 'activity record failed')
    }
  },

  list: async (
    userId: string, projectId: string, opts: { limit?: number; before?: Date; taskId?: string }
  ): Promise<{ items: ActivityDTO[]; nextBefore: Date | null }> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    const limit = Math.min(opts.limit ?? 20, MAX_LIMIT)

    const filter: Record<string, unknown> = { projectId }
    if (opts.taskId) filter.taskId = opts.taskId
    if (opts.before) filter.createdAt = { $lt: opts.before }

    // fetch one extra row to know whether another page exists
    const rows = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit + 1)
    const page = rows.slice(0, limit)

    const users = await User.find({ _id: { $in: page.map((r) => r.actorId) } })
    const names = new Map(users.map((u) => [u.id, u.name]))

    return {
      items: page.map((r) => ({
        id: r.id, type: r.type, actorId: r.actorId.toString(),
        actorName: names.get(r.actorId.toString()) ?? 'Deleted user',
        taskId: r.taskId ? r.taskId.toString() : null, meta: r.meta, createdAt: r.createdAt,
      })),
      nextBefore: rows.length > limit ? page[page.length - 1].createdAt : null,
    }
  },

  removeForProject: async (projectId: string) => { await Activity.deleteMany({ projectId }) },
}