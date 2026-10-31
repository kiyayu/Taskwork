//src/modules/chat/chat.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { projectService } from '../project/project.service.js'
import { Task } from '../task/task.model.js'
import { User } from '../user/user.model.js'
import { live } from '../realtime/realtime.publish.js'
import { ChatMessage } from './chat.model.js'
import type { ChatMessageDTO, ChatPageDTO, CreateMessageDTO, ListMessagesQueryDTO } from './chat.dto.js'

const MAX_LIMIT = 50

const map = (m: any, authorName: string): ChatMessageDTO => ({
  id: m._id.toString(),
  taskId: m.taskId.toString(),
  authorId: m.authorId.toString(),
  authorName,
  text: m.text,
  createdAt: m.createdAt,
})

// A real task id from another project is "not found".
const assertTask = async (projectId: string, taskId: string) => {
  if (!(await Task.exists({ _id: taskId, projectId }))) throw ApiError.notFound('Task not found')
}

export const chatService = {
  send: async (userId: string, projectId: string, taskId: string, input: CreateMessageDTO): Promise<ChatMessageDTO> => {
    // same rule as comments: viewers read, editors and owners write
    await projectService.assertCan(userId, projectId, 'comment:create')
    await assertTask(projectId, taskId)

    const author = await User.findById(userId)
    if (!author) throw ApiError.notFound('User not found')

    const message = await ChatMessage.create({ projectId, taskId, authorId: userId, text: input.text })

    // after the write succeeded; carries ids only, the client fetches the text through the endpoint
    live(projectId, 'messages_changed', { taskId, actorId: userId })

    return map(message, author.name)
  },

  // newest page first from the database, returned oldest-first so the UI can render it as is
  list: async (
    userId: string, projectId: string, taskId: string, query: ListMessagesQueryDTO
  ): Promise<ChatPageDTO> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    await assertTask(projectId, taskId)

    const limit = Math.min(query.limit ?? 30, MAX_LIMIT)
    const filter: Record<string, unknown> = { taskId, projectId }
    if (query.before) filter._id = { $lt: query.before } // ids grow over time: no duplicate-timestamp problems

    // fetch one extra row to know whether older messages exist
    const rows = await ChatMessage.find(filter).sort({ _id: -1 }).limit(limit + 1)
    const page = rows.slice(0, limit)

    const authors = await User.find({ _id: { $in: page.map((r) => r.authorId) } })
    const names = new Map(authors.map((a) => [a.id, a.name]))

    const oldest = page[page.length - 1]
    return {
      items: [...page].reverse().map((m) => map(m, names.get(m.authorId.toString()) ?? 'Deleted user')),
      nextBefore: rows.length > limit && oldest ? oldest.id : null,
    }
  },

  // authors delete their own messages; owners may delete any (moderation)
  remove: async (userId: string, projectId: string, taskId: string, messageId: string): Promise<void> => {
    const role = await projectService.assertCan(userId, projectId, 'project:read')
    const message = await ChatMessage.findOne({ _id: messageId, taskId, projectId })
    if (!message) throw ApiError.notFound('Message not found')
    if (message.authorId.toString() !== userId && role !== 'owner') {
      throw ApiError.forbidden('You do not have permission to do this')
    }
    await message.deleteOne()
    live(projectId, 'messages_changed', { taskId, actorId: userId })
  },

  // used when a task or project is deleted
  removeForTask: async (taskId: string) => { await ChatMessage.deleteMany({ taskId }) },
  removeForProject: async (projectId: string) => { await ChatMessage.deleteMany({ projectId }) },
}