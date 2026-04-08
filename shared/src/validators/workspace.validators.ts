/**
 * @file workspace.validators.ts — Workspace validation schemas
 * @module shared/validators
 *
 * Zod schemas for workspace creation and updates. The slug is auto-generated
 * server-side from the name, so it is not included in the create schema.
 *
 * @dependencies zod
 * @related server/src/routes/workspace.routes.ts — backend consumer
 */

import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name must be 100 characters or less'),
})

export type CreateWorkspaceSchema = z.infer<typeof createWorkspaceSchema>

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name must be 100 characters or less').optional(),
  logo_url: z.string().url('Must be a valid URL').nullable().optional(),
})

export type UpdateWorkspaceSchema = z.infer<typeof updateWorkspaceSchema>
