//src/modules/project/project.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { User } from '../user/user.model.js'
import { Project } from './project.model.js'
import { Membership } from './membership.model.js'
import { can, type Action, type Role } from './project.permissions.js'
import { PLAN_LIMITS } from './project.constants.js'
import type { ProjectResponseDTO } from './project.dto.js'
import { Task } from '../task/task.model.js'
import { Comment } from '../comment/comment.model.js'
import { listService } from '../list/list.service.js'
import { List } from '../list/list.model.js'
import { activityService } from '../activity/activity.service.js'
import { hub } from '../realtime/realtime.hub.js' // NEW (module 9)
import { live } from '../realtime/realtime.publish.js' // NEW (module 9)

const map = (p: any, role: Role): ProjectResponseDTO => ({
  id: p._id.toString(),
  name: p.name,
  role,
  createdAt: p.createdAt,
})

export const projectService = {
  assertCan: async (userId: string, projectId: string, action: Action): Promise<Role> => {
    const m = await Membership.findOne({ projectId, userId })
    if (!m) throw ApiError.notFound('Project not found')
    if (!can(m.role, action)) throw ApiError.forbidden('You do not have permission to do this')
    return m.role
  },

  create: async (userId: string, name: string): Promise<ProjectResponseDTO> => {
    const user = await User.findById(userId)
    if (!user) throw ApiError.notFound('User not found')

    const owned = await Membership.countDocuments({ userId, role: 'owner' })
    if (owned >= PLAN_LIMITS[user.plan].projects) {
      throw ApiError.forbidden('Project limit reached for your plan. Upgrade to create more')
    }

    const project = await Project.create({ name, ownerId: userId })
    try {
      await Membership.create({ projectId: project._id, userId, role: 'owner' })
      await listService.createDefaults(project._id.toString())
    } catch (err) {
      await Membership.deleteMany({ projectId: project._id })
      await List.deleteMany({ projectId: project._id })
      await Project.findByIdAndDelete(project._id)
      throw err
    }
    return map(project, 'owner')
  },

  listMine: async (userId: string): Promise<ProjectResponseDTO[]> => {
    const memberships = await Membership.find({ userId }).populate('projectId').sort({ createdAt: -1 })
    return memberships
      .filter((m) => m.projectId)
      .map((m) => map(m.projectId as any, m.role))
  },

  get: async (userId: string, projectId: string): Promise<ProjectResponseDTO> => {
    const role = await projectService.assertCan(userId, projectId, 'project:read')
    const project = await Project.findById(projectId)
    if (!project) throw ApiError.notFound('Project not found')
    return map(project, role)
  },

  update: async (userId: string, projectId: string, name: string): Promise<ProjectResponseDTO> => {
    const role = await projectService.assertCan(userId, projectId, 'project:update')
    const project = await Project.findByIdAndUpdate(projectId, { name }, { returnDocument: 'after' })
    if (!project) throw ApiError.notFound('Project not found')

    live(projectId, 'project_changed', { actorId: userId }) // NEW
    return map(project, role)
  },

  remove: async (userId: string, projectId: string): Promise<void> => {
    await projectService.assertCan(userId, projectId, 'project:delete')
    await Membership.deleteMany({ projectId })
    await Task.deleteMany({ projectId })
    await Comment.deleteMany({ projectId })
    await List.deleteMany({ projectId })
    await Project.findByIdAndDelete(projectId)
    await activityService.removeForProject(projectId)

    hub.closeRoom(projectId) // NEW: nobody should stay connected to a deleted project
  },
}