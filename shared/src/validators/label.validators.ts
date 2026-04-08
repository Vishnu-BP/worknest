/**
 * @file label.validators.ts — Label validation schemas
 * @module shared/validators
 *
 * Zod schemas for workspace-level label CRUD. Labels are workspace-scoped
 * tags with a name and color, applied to tasks via the task_labels table.
 *
 * @dependencies zod
 * @related server/src/routes/label.routes.ts — backend consumer
 */

import { z } from 'zod'

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i
const DEFAULT_LABEL_COLOR = '#6366f1'

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Name must be 50 characters or less'),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color (e.g., #6366f1)').default(DEFAULT_LABEL_COLOR).optional(),
})

export type CreateLabelSchema = z.infer<typeof createLabelSchema>

export const updateLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Name must be 50 characters or less').optional(),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color (e.g., #6366f1)').optional(),
})

export type UpdateLabelSchema = z.infer<typeof updateLabelSchema>
