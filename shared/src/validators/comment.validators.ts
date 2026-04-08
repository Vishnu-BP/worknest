/**
 * @file comment.validators.ts — Comment validation schemas
 * @module shared/validators
 *
 * Zod schemas for task comment creation and editing.
 * Comments support markdown content rendered with react-markdown.
 *
 * @dependencies zod
 * @related server/src/routes/comment.routes.ts — backend consumer
 */

import { z } from 'zod'

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment must be 5000 characters or less'),
})

export type CreateCommentSchema = z.infer<typeof createCommentSchema>

export const updateCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment must be 5000 characters or less'),
})

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>
