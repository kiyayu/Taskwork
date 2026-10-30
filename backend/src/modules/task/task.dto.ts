//src/modules/task/task.dto.ts
import { z } from 'zod'
import {
  createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema, moveTaskSchema,
} from './task.validation.js'
 
export type CreateTaskDTO = z.infer<typeof createTaskSchema>['body']
export type ListTasksQueryDTO = z.infer<typeof listTasksSchema>['query']
export type TaskParamsDTO = z.infer<typeof taskIdSchema>['params']
export type ProjectParamsDTO = z.infer<typeof createTaskSchema>['params']
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>['body']
export type MoveTaskDTO = z.infer<typeof moveTaskSchema>['body']

export interface TaskResponseDTO {
  id: string
  projectId: string
  title: string
  description: string
  listId: string
  order: number
  assigneeId: string | null
  dueDate: Date | null
  priority: number
  archived: boolean
  createdAt: Date
}