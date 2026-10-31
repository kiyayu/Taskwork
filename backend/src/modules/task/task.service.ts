//src/modules/task/task.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { Membership } from '../project/membership.model.js'
import { projectService } from '../project/project.service.js'
import { List } from '../list/list.model.js'
import { Comment } from '../comment/comment.model.js'
import { ChecklistItem } from '../checklist/checklist.model.js'
import { attachmentService } from '../attachment/attachment.service.js'
import { activityService } from '../activity/activity.service.js' // NEW
import { User } from '../user/user.model.js' // NEW
import { Task } from './task.model.js'
import { computeOrder } from './task.order.js'
import type {
  CreateTaskDTO, ListTasksQueryDTO, MoveTaskDTO, TaskResponseDTO, UpdateTaskDTO,
} from './task.dto.js'

const map = (t: any): TaskResponseDTO => ({
  id: t._id.toString(),
  projectId: t.projectId.toString(),
  title: t.title,
  description: t.description,
  listId: t.listId.toString(),
  order: t.order,
  assigneeId: t.assigneeId ? t.assigneeId.toString() : null,
  dueDate: t.dueDate ?? null,
  priority: t.priority,
  archived: !!t.archivedAt,
  createdAt: t.createdAt,
})

// Always filter by projectId too: a real task id from another project is "not found".
const findTask = async (projectId: string, taskId: string) => {
  const task = await Task.findOne({ _id: taskId, projectId })
  if (!task) throw ApiError.notFound('Task not found')
  return task
}

// A list id is only valid if it belongs to THIS project.
const assertListInProject = async (projectId: string, listId: string) => {
  const list = await List.findOne({ _id: listId, projectId })
  if (!list) throw ApiError.badRequest('List not found in this project')
  return list
}

// An assignee must belong to the project.
const assertAssignable = async (projectId: string, assigneeId?: string | null) => {
  if (!assigneeId) return
  const m = await Membership.findOne({ projectId, userId: assigneeId })
  if (!m) throw ApiError.badRequest('Assignee must be a member of the project')
}

const lastOrderIn = async (projectId: string, listId: string): Promise<number | null> => {
  const last = await Task.findOne({ projectId, listId, archivedAt: null }).sort({ order: -1 })
  return last ? last.order : null
}

export const taskService = {
  create: async (userId: string, projectId: string, input: CreateTaskDTO): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'task:create')
    await assertAssignable(projectId, input.assigneeId)

    const list = input.listId
      ? await assertListInProject(projectId, input.listId)
      : await List.findOne({ projectId }).sort({ order: 1 })
    if (!list) throw ApiError.badRequest('Create a list first')

    const order = computeOrder(await lastOrderIn(projectId, list.id), null) // append to the list

    const task = await Task.create({
      projectId,
      title: input.title,
      description: input.description ?? '',
      listId: list._id,
      order,
      priority: input.priority ?? 2,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdBy: userId,
    })

    // NEW: record AFTER the task is saved
    await activityService.record({
      projectId,
      actorId: userId,
      type: 'task_created',
      taskId: task.id,
      meta: { taskTitle: task.title },
    })

    return map(task)
  },

  list: async (userId: string, projectId: string, query: ListTasksQueryDTO): Promise<TaskResponseDTO[]> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    const filter = query.archived ? { projectId, archivedAt: { $ne: null } } : { projectId, archivedAt: null }
    const tasks = await Task.find(filter).sort({ listId: 1, order: 1 })
    return tasks.map(map)
  },

  get: async (userId: string, projectId: string, taskId: string): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    return map(await findTask(projectId, taskId))
  },

  update: async (userId: string, projectId: string, taskId: string, input: UpdateTaskDTO): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const task = await findTask(projectId, taskId)
    await assertAssignable(projectId, input.assigneeId)

    // NEW: remember the old assignee BEFORE we overwrite it
    const prevAssigneeId = task.assigneeId ? String(task.assigneeId) : null

    if (input.title !== undefined) task.title = input.title
    if (input.description !== undefined) task.description = input.description
    if (input.priority !== undefined) task.priority = input.priority
    if (input.assigneeId !== undefined) task.assigneeId = input.assigneeId as any
    if (input.dueDate !== undefined) task.dueDate = input.dueDate ? new Date(input.dueDate) : null
    await task.save()

    // NEW: only when the assignee changed to a real (non-null) user
    if (input.assigneeId && input.assigneeId !== prevAssigneeId) {
      const assignee = await User.findById(input.assigneeId)
      await activityService.record({
        projectId,
        actorId: userId,
        type: 'task_assigned',
        taskId,
        meta: { taskTitle: task.title, targetName: assignee?.name },
      })
    }

    return map(task)
  },

  // ONE write: only this task changes.
  move: async (userId: string, projectId: string, taskId: string, input: MoveTaskDTO): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const task = await findTask(projectId, taskId)
    const list = await assertListInProject(projectId, input.listId)

    const neighbor = async (id?: string | null) => {
      if (!id) return null
      // must be in the same project AND the target list, and not archived
      const n = await Task.findOne({ _id: id, projectId, listId: list._id, archivedAt: null })
      if (!n || n.id === taskId) throw ApiError.badRequest('Invalid neighbor task')
      return n
    }
    const above = await neighbor(input.aboveId)
    const below = await neighbor(input.belowId)

    if (above && below && above.order >= below.order) {
      throw ApiError.badRequest('Neighbors are out of order')
    }

    // NEW: compare BEFORE assigning, so we know if the list really changed
    const listChanged = String(task.listId) !== String(list._id)

    task.listId = list._id
    task.order = computeOrder(above?.order, below?.order)
    await task.save()

    // NEW: reordering inside the same list is not logged
    if (listChanged) {
      await activityService.record({
        projectId,
        actorId: userId,
        type: 'task_moved',
        taskId,
        meta: { taskTitle: task.title, listName: list.name },
      })
    }

    return map(task)
  },

  archive: async (userId: string, projectId: string, taskId: string): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const task = await findTask(projectId, taskId)
    task.archivedAt = new Date() // list and order are kept, so restore puts it back in place
    await task.save()

    // NEW
    await activityService.record({
      projectId,
      actorId: userId,
      type: 'task_archived',
      taskId,
      meta: { taskTitle: task.title },
    })

    return map(task)
  },

  restore: async (userId: string, projectId: string, taskId: string): Promise<TaskResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const task = await findTask(projectId, taskId)
    task.archivedAt = null
    await task.save()

    // NEW
    await activityService.record({
      projectId,
      actorId: userId,
      type: 'task_restored',
      taskId,
      meta: { taskTitle: task.title },
    })

    return map(task)
  },

  remove: async (userId: string, projectId: string, taskId: string): Promise<void> => {
    await projectService.assertCan(userId, projectId, 'task:delete')
    const task = await findTask(projectId, taskId)
    const taskTitle = task.title // NEW: grab the title before the task is gone

    await Comment.deleteMany({ taskId })
    await ChecklistItem.deleteMany({ taskId })
    await attachmentService.removeForTask(taskId)
    await task.deleteOne()

    // NEW
    await activityService.record({
      projectId,
      actorId: userId,
      type: 'task_deleted',
      taskId,
      meta: { taskTitle },
    })
  },
}