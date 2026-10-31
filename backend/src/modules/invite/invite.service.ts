//src/modules/invite/invite.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { projectService } from '../project/project.service.js'
import { Membership } from '../project/membership.model.js'
import { Task } from '../task/task.model.js'
import { User } from '../user/user.model.js'
import { PLAN_LIMITS } from '../project/project.constants.js'
import { activityService } from '../activity/activity.service.js' // NEW
import { hub } from '../realtime/realtime.hub.js' // NEW (module 9)
import { live } from '../realtime/realtime.publish.js' // NEW (module 9)
import { Invite } from './invite.model.js'
import { generateToken, hashToken, isUsable } from './invite.token.js'
import type { CreateInviteDTO, InviteDTO, MemberDTO } from './invite.dto.js'

const mapInvite = (i: any): InviteDTO => ({
  id: i._id.toString(), role: i.role, expiresAt: i.expiresAt, maxUses: i.maxUses, uses: i.uses,
})

const assertRoom = async (projectId: string, ownerId: string) => {
  const owner = await User.findById(ownerId)
  const limit = PLAN_LIMITS[owner?.plan ?? 'free'].membersPerProject
  if ((await Membership.countDocuments({ projectId })) >= limit) {
    throw ApiError.forbidden('Member limit reached for this project. Upgrade to add more')
  }
}

export const inviteService = {
  create: async (userId: string, projectId: string, input: CreateInviteDTO) => {
    await projectService.assertCan(userId, projectId, 'member:invite')
    const token = generateToken()
    const invite = await Invite.create({
      projectId, role: input.role, tokenHash: hashToken(token), createdBy: userId,
      expiresAt: new Date(Date.now() + input.expiresInDays * 86_400_000), maxUses: input.maxUses,
    })
    return { ...mapInvite(invite), token } // the ONLY time the raw token is returned
  },

  listInvites: async (userId: string, projectId: string): Promise<InviteDTO[]> => {
    await projectService.assertCan(userId, projectId, 'member:invite')
    return (await Invite.find({ projectId }).sort({ createdAt: -1 })).map(mapInvite)
  },

  revoke: async (userId: string, projectId: string, inviteId: string) => {
    await projectService.assertCan(userId, projectId, 'member:invite')
    const res = await Invite.deleteOne({ _id: inviteId, projectId })
    if (!res.deletedCount) throw ApiError.notFound('Invite not found')
  },

  // any logged-in user holding the token may join
  accept: async (userId: string, token: string) => {
    const invite = await Invite.findOne({ tokenHash: hashToken(token) })
    if (!invite || !isUsable(invite)) throw ApiError.notFound('This invite is invalid or has expired')

    const existing = await Membership.findOne({ projectId: invite.projectId, userId })
    if (existing) return { projectId: invite.projectId.toString(), role: existing.role } // idempotent

    const project = await Membership.findOne({ projectId: invite.projectId, role: 'owner' })
    if (project) await assertRoom(invite.projectId.toString(), project.userId.toString())

    // atomic: only increments if still usable, so two simultaneous accepts cannot exceed maxUses
    const claimed = await Invite.findOneAndUpdate(
      { _id: invite._id, uses: { $lt: invite.maxUses }, expiresAt: { $gt: new Date() } },
      { $inc: { uses: 1 } }
    )
    if (!claimed) throw ApiError.notFound('This invite is invalid or has expired')

    let created = false // NEW: true only when THIS call created the membership
    try {
      await Membership.create({ projectId: invite.projectId, userId, role: invite.role })
      created = true
    } catch (err: any) {
      if (err?.code !== 11000) throw err // a racing duplicate is fine
    }

    // NEW: only a brand-new membership is news (actor = the joiner)
    if (created) {
      const projectId = invite.projectId.toString()
      await activityService.record({ projectId, actorId: userId, type: 'member_joined' })
      live(projectId, 'members_changed', { actorId: userId })
    }

    return { projectId: invite.projectId.toString(), role: invite.role }
  },

  listMembers: async (userId: string, projectId: string): Promise<MemberDTO[]> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    const rows = await Membership.find({ projectId })
    const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } })
    const byId = new Map(users.map((u) => [u.id, u]))
    return rows.map((r) => {
      const u = byId.get(r.userId.toString())
      return { userId: r.userId.toString(), name: u?.name ?? 'Deleted user', email: u?.email ?? '', role: r.role }
    })
  },

  updateRole: async (userId: string, projectId: string, targetId: string, role: 'editor' | 'viewer') => {
    await projectService.assertCan(userId, projectId, 'member:update')
    const m = await Membership.findOne({ projectId, userId: targetId })
    if (!m) throw ApiError.notFound('Member not found')
    if (m.role === 'owner') throw ApiError.badRequest('The owner role cannot be changed')
    m.role = role
    await m.save()

    live(projectId, 'members_changed', { actorId: userId }) // NEW
  },

  // owners remove others; anyone may leave; the owner cannot be removed or leave
  removeMember: async (userId: string, projectId: string, targetId: string) => {
    if (targetId === userId) {
      const own = await Membership.findOne({ projectId, userId })
      if (!own) throw ApiError.notFound('Project not found')
      if (own.role === 'owner') throw ApiError.badRequest('The owner cannot leave. Delete the project instead')
    } else {
      await projectService.assertCan(userId, projectId, 'member:remove')
    }
    const m = await Membership.findOne({ projectId, userId: targetId })
    if (!m) throw ApiError.notFound('Member not found')
    if (m.role === 'owner') throw ApiError.badRequest('The owner cannot be removed')
    await m.deleteOne()
    // their tasks become unassigned
    await Task.updateMany({ projectId, assigneeId: targetId }, { assigneeId: null })

    // NEW
    const target = await User.findById(targetId)
    await activityService.record({
      projectId, actorId: userId, type: 'member_removed', meta: { targetName: target?.name },
    })
    hub.kick(projectId, targetId) // close their stream FIRST, so they don't receive the events below
    live(projectId, 'members_changed', { actorId: userId })
    live(projectId, 'tasks_changed', { actorId: userId }) // their tasks were just unassigned
  },
}