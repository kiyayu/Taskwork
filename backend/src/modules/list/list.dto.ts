//src/modules/list/list.dto.ts
import { z } from 'zod'
import { createListSchema, listIdSchema, updateListSchema, moveListSchema, listListsSchema } from './list.validation.js'

export type ProjectScopeDTO = z.infer<typeof listListsSchema>['params']
export type CreateListDTO = z.infer<typeof createListSchema>['body']
export type ListParamsDTO = z.infer<typeof listIdSchema>['params']
export type UpdateListDTO = z.infer<typeof updateListSchema>['body']
export type MoveListDTO = z.infer<typeof moveListSchema>['body']

export interface ListResponseDTO { id: string; projectId: string; name: string; order: number }