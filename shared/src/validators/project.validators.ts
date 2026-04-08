/**
 * @file project.validators.ts — Project validation schemas
 * @module shared/validators
 *
 * Zod schemas for project CRUD. The key field is the task number prefix
 * (e.g., "ENG" produces task numbers ENG-1, ENG-2). Keys are 2-5 uppercase
 * alphanumeric characters and must be unique per workspace.
 *
 * @dependencies zod
 * @related server/src/routes/project.routes.ts — backend consumer
 */

import { z } from 'zod'

// ─── Constants ─────────────────────────────────────────────────

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i
const PROJECT_KEY_REGEX = /^[A-Z0-9]+$/

// ─── Schemas ───────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be 100 characters or less'),
  key: z
    .string()
    .min(2, 'Key must be at least 2 characters')
    .max(5, 'Key must be 5 characters or less')
    .regex(PROJECT_KEY_REGEX, 'Key must be uppercase letters and numbers only'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color (e.g., #6366f1)').optional(),
})

export type CreateProjectSchema = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color (e.g., #6366f1)').optional(),
  is_archived: z.boolean().optional(),
})

export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>
