//src/modules/checklist/checklist.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { projectService } from '../project/project.service.js'
import { Task } from '../task/task.model.js'
import { computeOrder } from '../task/task.order.js'
import { ChecklistItem } from './checklist.model.js'
import { computeProgress } from './checklist.progress.js'
import type {
  ChecklistItemDTO, ChecklistResponseDTO, CreateItemDTO, MoveItemDTO, UpdateItemDTO,
} from './checklist.dto.js'

const map = (i: any): ChecklistItemDTO => ({
  id: i._id.toString(), taskId: i.taskId.toString(),
  parentId: i.parentId ? i.parentId.toString() : null,
  title: i.title, completed: i.completed, order: i.order,
})

const assertTask = async (projectId: string, taskId: string) => {
  if (!(await Task.exists({ _id: taskId, projectId }))) throw ApiError.notFound('Task not found')
}

const findItem = async (projectId: string, taskId: string, itemId: string) => {
  const item = await ChecklistItem.findOne({ _id: itemId, taskId, projectId })
  if (!item) throw ApiError.notFound('Checklist item not found')
  return item
}

const snapshot = async (taskId: string): Promise<ChecklistResponseDTO> => {
  const rows = await ChecklistItem.find({ taskId }).sort({ order: 1 })
  const items = rows.map(map)
  return { items, progress: computeProgress(items) }
}

export const checklistService = {
  list: async (userId: string, projectId: string, taskId: string) => {
    await projectService.assertCan(userId, projectId, 'project:read')
    await assertTask(projectId, taskId)
    return snapshot(taskId)
  },

  create: async (userId: string, projectId: string, taskId: string, input: CreateItemDTO) => {
    await projectService.assertCan(userId, projectId, 'task:update')
    await assertTask(projectId, taskId)

    const parentId = input.parentId ?? null
    if (parentId) {
      const parent = await findItem(projectId, taskId, parentId)
      if (parent.parentId) throw ApiError.badRequest('Sub-items cannot have their own sub-items')
    }
    const last = await ChecklistItem.findOne({ taskId, parentId }).sort({ order: -1 })
    await ChecklistItem.create({
      projectId, taskId, parentId, title: input.title, order: computeOrder(last?.order ?? null, null),
    })
    // a new unfinished sub-item reopens a completed parent
    if (parentId) await ChecklistItem.updateOne({ _id: parentId }, { completed: false })
    return snapshot(taskId)
  },

  update: async (userId: string, projectId: string, taskId: string, itemId: string, input: UpdateItemDTO) => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const item = await findItem(projectId, taskId, itemId)

    if (input.title !== undefined) item.title = input.title

    if (input.completed !== undefined) {
      if (input.completed && !item.parentId) {
        // a parent can only be completed when all its sub-items are
        const open = await ChecklistItem.exists({ taskId, parentId: item.id, completed: false })
        if (open) throw ApiError.badRequest('Complete all sub-items first')
      }
      item.completed = input.completed
      // un-completing a sub-item reopens its parent
      if (!input.completed && item.parentId) {
        await ChecklistItem.updateOne({ _id: item.parentId }, { completed: false })
      }
    }
    await item.save()
    return snapshot(taskId)
  },

  move: async (userId: string, projectId: string, taskId: string, itemId: string, input: MoveItemDTO) => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const item = await findItem(projectId, taskId, itemId)

    // neighbors must be siblings (same parent), so levels never mix
    const neighbor = async (id?: string | null) => {
      if (!id) return null
      const n = await ChecklistItem.findOne({ _id: id, taskId, projectId, parentId: item.parentId })
      if (!n || n.id === itemId) throw ApiError.badRequest('Invalid neighbor item')
      return n
    }
    const above = await neighbor(input.aboveId)
    const below = await neighbor(input.belowId)
    if (above && below && above.order >= below.order) throw ApiError.badRequest('Neighbors are out of order')

    item.order = computeOrder(above?.order, below?.order)
    await item.save()
    return snapshot(taskId)
  },

  remove: async (userId: string, projectId: string, taskId: string, itemId: string) => {
    await projectService.assertCan(userId, projectId, 'task:update')
    const item = await findItem(projectId, taskId, itemId)
    await ChecklistItem.deleteMany({ $or: [{ _id: item._id }, { parentId: item._id }] })
    return snapshot(taskId)
  },
}