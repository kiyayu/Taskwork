 //src/modules/list/list.service.ts
import { ApiError } from '../../common/errors/apiErrors.js'
import { projectService } from '../project/project.service.js'
import { computeOrder } from '../task/task.order.js'
import { Task } from '../task/task.model.js'
import { Comment } from '../comment/comment.model.js'
import { List } from './list.model.js'
import type { CreateListDTO, ListResponseDTO, MoveListDTO, UpdateListDTO } from './list.dto.js'

const map = (l: any): ListResponseDTO => ({
  id: l._id.toString(), projectId: l.projectId.toString(), name: l.name, order: l.order,
})

const findList = async (projectId: string, listId: string) => {
  const list = await List.findOne({ _id: listId, projectId })
  if (!list) throw ApiError.notFound('List not found')
  return list
}

export const DEFAULT_LISTS = ['Todo', 'Doing', 'Done'] as const

export const listService = {
  // called by projectService.create, so a new project is never an empty page
  createDefaults: async (projectId: string): Promise<void> => {
    await List.insertMany(DEFAULT_LISTS.map((name, i) => ({ projectId, name, order: (i + 1) * 1024 })))
  },

  create: async (userId: string, projectId: string, input: CreateListDTO): Promise<ListResponseDTO> => {
    await projectService.assertCan(userId, projectId, 'list:create')
    const last = await List.findOne({ projectId }).sort({ order: -1 })
    const list = await List.create({ projectId, name: input.name, order: computeOrder(last?.order ?? null, null) })
    return map(list)
  },

  list: async (userId: string, projectId: string): Promise<ListResponseDTO[]> => {
    await projectService.assertCan(userId, projectId, 'project:read')
    return (await List.find({ projectId }).sort({ order: 1 })).map(map)
  },

  update: async (userId: string, projectId: string, listId: string, input: UpdateListDTO) => {
    await projectService.assertCan(userId, projectId, 'list:update')
    const list = await findList(projectId, listId)
    list.name = input.name
    await list.save()
    return map(list)
  },

  move: async (userId: string, projectId: string, listId: string, input: MoveListDTO) => {
    await projectService.assertCan(userId, projectId, 'list:update')
    const list = await findList(projectId, listId)

    const neighbor = async (id?: string | null) => {
      if (!id) return null
      const n = await List.findOne({ _id: id, projectId })
      if (!n || n.id === listId) throw ApiError.badRequest('Invalid neighbor list')
      return n
    }
    const above = await neighbor(input.aboveId)
    const below = await neighbor(input.belowId)
    if (above && below && above.order >= below.order) throw ApiError.badRequest('Neighbors are out of order')

    list.order = computeOrder(above?.order, below?.order)
    await list.save()
    return map(list)
  },

  // deleting a list must not silently destroy work: it must be empty
  remove: async (userId: string, projectId: string, listId: string): Promise<void> => {
    await projectService.assertCan(userId, projectId, 'list:delete')
    const list = await findList(projectId, listId)
    if (await Task.exists({ projectId, listId })) {
      throw ApiError.conflict('Move or archive the tasks in this list first')
    }
    await list.deleteOne()
  },
}