//src/modules/task/task.validation.ts
import { z } from 'zod'
import { TASK_STATUSES } from './task.model.js'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const projectParams = { projectId: objectId }
const status = z.enum(TASK_STATUSES)
const priority = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const createTaskSchema = z.object({
  params: z.object(projectParams).strict(),
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(5000).optional(),
    status: status.optional(),
    priority: priority.optional(),
    assigneeId: objectId.nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }).strict(),
})

export const listTasksSchema = z.object({
  params: z.object(projectParams).strict(),
  query: z.object({
    archived: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  }).strict(),
})

export const taskIdSchema = z.object({
  params: z.object({ ...projectParams, taskId: objectId }).strict(),
})

export const updateTaskSchema = z.object({
  params: z.object({ ...projectParams, taskId: objectId }).strict(),
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    priority: priority.optional(),
    assigneeId: objectId.nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }).strict(), 
})

export const moveTaskSchema = z.object({
  params: z.object({ ...projectParams, taskId: objectId }).strict(),
  body: z.object({
    status,
    aboveId: objectId.nullable().optional(),
    belowId: objectId.nullable().optional(),  
  }).strict(),
})