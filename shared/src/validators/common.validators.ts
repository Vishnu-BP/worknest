/**
 * @file common.validators.ts — Reusable validation schemas
 * @module shared/validators
 *
 * Shared Zod schemas for common field types used across multiple
 * resource validators: UUIDs, slugs, and pagination parameters.
 * These are composed into resource-specific schemas, never used standalone.
 *
 * @dependencies zod
 * @related shared/src/validators/*.validators.ts — consumers of these schemas
 */

import { z } from 'zod'

// ─── Field Schemas ─────────────────────────────────────────────

export const uuidSchema = z.string().uuid('Must be a valid UUID')

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(64, 'Slug must be 64 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

// ─── Pagination ────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>
