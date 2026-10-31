//src/modules/comment/comment.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { Membership } from '../project/membership.model.js'
import { projectService } from '../project/project.service.js'
import { Task } from '../task/task.model.js'
import { User } from '../user/user.model.js'
import { notificationService } from '../notification/notification.service.js'
import { activityService } from '../activity/activity.service.js' // NEW
import { live } from '../realtime/realtime.publish.js' // NEW (module 9)
import { Comment } from './comment.model.js'
import type { CommentResponseDTO, CreateCommentDTO } from './comment.dto.js'

const map = (c: any, authorName: string): CommentResponseDTO => ({
  id: c._id.toString(),
  taskId: c.taskId.toString(),
  authorId: c.authorId.toString(),
  authorName,
  text: c.text,
  mentions: c.mentions.map((m: any) => m.toString()),
  createdAt: c.createdAt,
})

const assertTaskInProject = async (projectId: string, taskId: string) => {
  const task = await Task.findOne({ _id: taskId, projectId })
  if (!task) throw ApiError.notFound('Task not found')
  return task
}

export const commentService = {
  create: async (userId: string, projectId: string, taskId: string, input: CreateCommentDTO) => {
    await projectService.assertCan(userId, projectId, 'comment:create')
    const task = await assertTaskInProject(projectId, taskId)

    // every mentioned user must be a member of THIS project; unique, and not yourself
    const wanted = [...new Set(input.mentions ?? [])].filter((id) => id !== userId)
    const members = await Membership.find({ projectId, userId: { $in: wanted } })
    if (members.length !== wanted.length) {
      throw ApiError.badRequest('You can only mention members of this project')
    }

    const author = await User.findById(userId)
    if (!author) throw ApiError.notFound('User not found')

    const comment = await Comment.create({
      projectId, taskId, authorId: userId, text: input.text, mentions: wanted,
    })

    // NEW: right after the write, before the (slower) notifications, so others see it fast
    await activityService.record({
      projectId, actorId: userId, type: 'comment_added', taskId, meta: { taskTitle: task.title },
    })
    live(projectId, 'comments_changed', { taskId, actorId: userId })

    // notifications never throw (notify swallows its own errors)
    const mentioned = await User.find({ _id: { $in: wanted } })
    await Promise.all(
      mentioned.map((u) =>
        notificationService.notify({
          userId: u.id, type: 'mentioned', emailTo: u.email, name: u.name,
          meta: { actorName: author.name, taskTitle: task.title },
        })
      )
    )

    return map(comment, author.name)
  },

  list: async (userId: string, projectId: string, taskId: string): Promise<CommentResponseDTO[]> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    await assertTaskInProject(projectId, taskId)

    const comments = await Comment.find({ taskId }).sort({ createdAt: 1 })
    const authors = await User.find({ _id: { $in: comments.map((c) => c.authorId) } })
    const names = new Map(authors.map((a) => [a.id, a.name]))
    return comments.map((c) => map(c, names.get(c.authorId.toString()) ?? 'Deleted user'))
  },

  // authors delete their own comments; owners may delete any (moderation)
  remove: async (userId: string, projectId: string, taskId: string, commentId: string) => {
    const role = await projectService.assertCan(userId, projectId, 'project:read')
    const comment = await Comment.findOne({ _id: commentId, taskId, projectId })
    if (!comment) throw ApiError.notFound('Comment not found')
    if (comment.authorId.toString() !== userId && role !== 'owner') {
      throw ApiError.forbidden('You do not have permission to do this')
    }
    await comment.deleteOne()

    live(projectId, 'comments_changed', { taskId, actorId: userId }) // NEW
  },
}