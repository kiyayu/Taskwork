//src/features/board/schemas/board.schema.ts
import { z } from 'zod'

export const listSchema = z.object({
  name: z.string().trim().min(1, 'validation:listNameRequired').max(60, 'validation:listNameMax'),
})

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'validation:taskTitleRequired').max(200, 'validation:taskTitleMax'),
  description: z.string().max(5000, 'validation:taskDescriptionMax'),
  priority: z.enum(['1', '2', '3']), // a Select works with strings; converted on submit
})

export type ListForm = z.infer<typeof listSchema>
export type TaskForm = z.infer<typeof taskSchema>

export const taskDetailsSchema = z.object({
  title: z.string().trim().min(1, 'validation:taskTitleRequired').max(200, 'validation:taskTitleMax'),
  description: z.string().max(5000, 'validation:taskDescriptionMax'),
  priority: z.enum(['1', '2', '3']),
  assigneeId: z.string(), // a member id, or 'none'
  dueDate: z.string(), // '' or YYYY-MM-DD
})
export type TaskDetailsFormValues = z.infer<typeof taskDetailsSchema>