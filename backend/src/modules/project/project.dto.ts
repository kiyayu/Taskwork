//src/modules/project/project.dto.ts
import { z } from 'zod'
import { createProjectSchema, updateProjectSchema, projectIdSchema } from './project.validation.js'
import type { Role } from './project.permissions.js'

export type CreateProjectDTO = z.infer<typeof createProjectSchema>['body']
export type UpdateProjectDTO = z.infer<typeof updateProjectSchema>['body']
export type ProjectParamsDTO = z.infer<typeof projectIdSchema>['params']

export interface ProjectResponseDTO {
  id: string
  name: string
  role: Role
  createdAt: Date
}