//src/modules/admin/admin.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { logger } from '../../common/utils/logger.js'
import { User, TokenFamily } from '../user/user.model.js'
import { Project } from '../project/project.model.js'
import { Membership } from '../project/membership.model.js'
import { PLANS, type Plan } from '../project/project.constants.js'
import { Task } from '../task/task.model.js'
import { Comment } from '../comment/comment.model.js'
import { Attachment } from '../attachment/attachment.model.js'
import { fillDays } from './admin.series.js'

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const mapUser = (u: any, projectsOwned = 0) => ({
  id: u._id.toString(),
  name: u.name,
  email: u.email,
  role: u.role,
  plan: u.plan as Plan,
  isActive: u.isActive,
  emailVerified: u.emailVerified,
  createdAt: u.createdAt,
  projectsOwned,
})

// Counts only. An admin sees how big the system is, never what is inside a project.
export const adminService = {
  stats: async () => {
    const now = new Date()
    const since7 = new Date(now.getTime() - 7 * 86_400_000)
    const since14 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 13))

    const [users, verified, active, newThisWeek, byPlan, projects, activeTasks, archivedTasks, comments, attachments, signups] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ emailVerified: true }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: since7 } }),
        User.aggregate([{ $group: { _id: '$plan', n: { $sum: 1 } } }]),
        Project.countDocuments(),
        Task.countDocuments({ archivedAt: null }),
        Task.countDocuments({ archivedAt: { $ne: null } }),
        Comment.countDocuments(),
        Attachment.countDocuments(),
        User.aggregate([
          { $match: { createdAt: { $gte: since14 } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, n: { $sum: 1 } } },
        ]),
      ])

    const plans = Object.fromEntries(PLANS.map((p) => [p, 0])) as Record<Plan, number>
    for (const row of byPlan) if (row._id in plans) plans[row._id as Plan] = row.n

    return {
      users: { total: users, verified, active, newThisWeek, byPlan: plans },
      projects,
      tasks: { active: activeTasks, archived: archivedTasks },
      comments,
      attachments,
      signups: fillDays(signups, 14, now),
    }
  },

  listUsers: async (query: { page?: number; limit?: number; search?: string }) => {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const filter: Record<string, unknown> = {}
    if (query.search) {
      const re = new RegExp(escapeRegex(query.search), 'i')
      filter.$or = [{ name: re }, { email: re }]
    }

    const [rows, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ])

    const owned = await Membership.aggregate([
      { $match: { userId: { $in: rows.map((r) => r._id) }, role: 'owner' } },
      { $group: { _id: '$userId', n: { $sum: 1 } } },
    ])
    const ownedBy = new Map<string, number>(owned.map((o: any) => [o._id.toString(), o.n]))

    return {
      items: rows.map((u) => mapUser(u, ownedBy.get(u.id) ?? 0)),
      pagination: { total, totalPage: Math.ceil(total / limit), currentPage: page },
    }
  },

  updateUser: async (adminId: string, targetId: string, input: { plan?: Plan; isActive?: boolean }) => {
    if (targetId === adminId) throw ApiError.badRequest('You cannot change your own account here')
    const target = await User.findById(targetId)
    if (!target) throw ApiError.notFound('User not found')
    if (target.role === 'admin') throw ApiError.forbidden('Admin accounts cannot be changed here')

    if (input.plan !== undefined) target.plan = input.plan
    if (input.isActive !== undefined) target.isActive = input.isActive
    await target.save()

    // a deactivated user must not be able to refresh a session
    if (input.isActive === false) await TokenFamily.deleteMany({ userId: target._id })

    logger.info({ adminId, targetId, changes: input }, 'admin updated user')
    return mapUser(target)
  },
}