//src/modules/checklist/checklist.dto.ts
import { z } from 'zod'
import {
  listChecklistSchema, createItemSchema, itemIdSchema, updateItemSchema, moveItemSchema,
} from './checklist.validation.js'
import type { Progress } from './checklist.progress.js'

export type TaskScopeDTO = z.infer<typeof listChecklistSchema>['params']
export type CreateItemDTO = z.infer<typeof createItemSchema>['body']
export type ItemParamsDTO = z.infer<typeof itemIdSchema>['params']
export type UpdateItemDTO = z.infer<typeof updateItemSchema>['body']
export type MoveItemDTO = z.infer<typeof moveItemSchema>['body']

export interface ChecklistItemDTO {
  id: string; taskId: string; parentId: string | null
  title: string; completed: boolean; order: number
}
export interface ChecklistResponseDTO { items: ChecklistItemDTO[]; progress: Progress }