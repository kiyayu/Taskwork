//src/features/board/comments/schemas/comment.schema.ts
import { z } from 'zod'

export const commentSchema = z.object({
  text: z.string().trim().min(1, 'validation:commentRequired').max(2000, 'validation:commentMax'),
})

export type CommentFormValues = z.infer<typeof commentSchema>