//src/features/projects/schemas/project.schema.ts
import { z } from 'zod'

export const projectNameSchema = z.object({
  name: z.string().trim().min(1, 'validation:projectNameRequired').max(100, 'validation:projectNameMax'),
})

export type ProjectNameForm = z.infer<typeof projectNameSchema>