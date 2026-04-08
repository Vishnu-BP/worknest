/**
 * @file auth.validators.ts — Authentication-related validation schemas
 * @module shared/validators
 *
 * Zod schemas for auth endpoints. Currently only profile updates —
 * signup/login are handled entirely by Supabase Auth.
 *
 * @dependencies zod
 * @related server/src/routes/auth.routes.ts — backend consumer
 */

import { z } from 'zod'

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  avatar_url: z.string().url('Must be a valid URL').nullable().optional(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
