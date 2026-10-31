//src/modules/attachment/attachment.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { logger } from '../../common/utils/logger.js'
import { projectService } from '../project/project.service.js'
import { Task } from '../task/task.model.js'
import { User } from '../user/user.model.js'
import { uploadService } from '../upload/upload.service.js'
import { storage } from '../upload/storage/index.js'
import { activityService } from '../activity/activity.service.js' // NEW
import { live } from '../realtime/realtime.publish.js' // NEW (module 9)
import { Attachment } from './attachment.model.js'
import type { AttachmentResponseDTO, CreateAttachmentDTO } from './attachment.dto.js'

const MAX_PER_TASK = 20

const map = (a: any, uploaderName: string): AttachmentResponseDTO => ({
  id: a._id.toString(), taskId: a.taskId.toString(), uploaderId: a.uploaderId.toString(),
  uploaderName, name: a.name, url: a.url, bytes: a.bytes, createdAt: a.createdAt,
})

// CHANGED: now returns the task (title only), so create can log the title. Other callers ignore it.
const assertTask = async (projectId: string, taskId: string) => {
  const task = await Task.findOne({ _id: taskId, projectId }).select('title')
  if (!task) throw ApiError.notFound('Task not found')
  return task
}

// Storage cleanup must never fail a request: an orphan is better than a broken delete.
const deleteFile = (fileKey: string) =>
  storage.delete(fileKey).catch((err) => logger.warn({ err, fileKey }, 'attachment file cleanup failed'))

export const attachmentService = {
  create: async (userId: string, projectId: string, taskId: string, input: CreateAttachmentDTO) => {
    await projectService.assertCan(userId, projectId, 'attachment:create')
    const task = await assertTask(projectId, taskId)

    if ((await Attachment.countDocuments({ taskId })) >= MAX_PER_TASK) {
      throw ApiError.badRequest(`A task can have at most ${MAX_PER_TASK} attachments`)
    }

    // owner, purpose, real size and format are checked against storage, not the browser
    const file = await uploadService.confirm(userId, { purpose: 'attachment', fileKey: input.fileKey })

    // CHANGED (same behavior): the file cleanup only covers the database write itself.
    // Before, the user lookup was inside the same try, so a failure there would have deleted a file
    // whose row already existed. Activity and live events must stay OUTSIDE anything that deletes data.
    const row = await Attachment.create({
      projectId, taskId, uploaderId: userId,
      fileKey: file.fileKey, url: file.fileUrl, name: input.name, bytes: file.bytes,
    }).catch(async (err: any) => {
      if (err?.code === 11000) throw ApiError.conflict('This file is already attached')
      await deleteFile(file.fileKey) // no row means no owner for the file
      throw err
    })

    // NEW
    await activityService.record({
      projectId, actorId: userId, type: 'attachment_added', taskId, meta: { taskTitle: task.title },
    })
    live(projectId, 'attachments_changed', { taskId, actorId: userId })

    const user = await User.findById(userId)
    return map(row, user?.name ?? 'Unknown')
  },

  list: async (userId: string, projectId: string, taskId: string): Promise<AttachmentResponseDTO[]> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    await assertTask(projectId, taskId)
    const rows = await Attachment.find({ taskId }).sort({ createdAt: 1 })
    const users = await User.find({ _id: { $in: rows.map((r) => r.uploaderId) } })
    const names = new Map(users.map((u) => [u.id, u.name]))
    return rows.map((r) => map(r, names.get(r.uploaderId.toString()) ?? 'Deleted user'))
  },

  remove: async (userId: string, projectId: string, taskId: string, attachmentId: string) => {
    const role = await projectService.assertCan(userId, projectId, 'attachment:delete')
    const row = await Attachment.findOne({ _id: attachmentId, taskId, projectId })
    if (!row) throw ApiError.notFound('Attachment not found')
    if (row.uploaderId.toString() !== userId && role !== 'owner') {
      throw ApiError.forbidden('You do not have permission to do this')
    }
    await row.deleteOne()

    live(projectId, 'attachments_changed', { taskId, actorId: userId }) // NEW
    await deleteFile(row.fileKey)
  },

  // used when a task or project is deleted
  removeForTask: async (taskId: string) => {
    const rows = await Attachment.find({ taskId })
    await Attachment.deleteMany({ taskId })
    await Promise.all(rows.map((r) => deleteFile(r.fileKey)))
  },
  removeForProject: async (projectId: string) => {
    const rows = await Attachment.find({ projectId })
    await Attachment.deleteMany({ projectId })
    await Promise.all(rows.map((r) => deleteFile(r.fileKey)))
  },
}