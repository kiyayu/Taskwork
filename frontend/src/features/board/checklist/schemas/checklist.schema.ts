//src/features/board/checklist/schemas/checklist.schema.ts
import { z } from 'zod'

export const checklistItemSchema = z.object({
  title: z.string().trim().min(1, 'validation:checklistItemRequired').max(200, 'validation:checklistItemMax'),
})

export type ChecklistItemForm = z.infer<typeof checklistItemSchema>