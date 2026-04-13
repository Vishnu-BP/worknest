/**
 * @file validate.middleware.ts — Zod schema validation middleware factory
 * @module server/middleware
 *
 * Returns Express middleware that validates req.body, req.query, or
 * req.params against a Zod schema. On success, the parsed (coerced)
 * data replaces the original — downstream handlers receive clean,
 * typed data. On failure, responds with 400 and field-level errors.
 *
 * Usage:
 *   router.post('/tasks', validate(createTaskSchema), taskHandler)
 *   router.get('/tasks', validate(paginationSchema, 'query'), listHandler)
 *
 * @dependencies zod
 * @related shared/src/validators/ — Zod schemas used with this middleware
 */

import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

import type { ApiErrorResponse } from '@worknest/shared'

// ─── Types ─────────────────────────────────────────────────────

type ValidationSource = 'body' | 'query' | 'params'

// ─── Middleware Factory ────────────────────────────────────────

/**
 * Creates middleware that validates the specified request property
 * against a Zod schema. Replaces the raw data with parsed output
 * on success, or returns 400 with field errors on failure.
 */
export function validate(
  schema: ZodSchema,
  source: ValidationSource = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source])

    if (result.success) {
      // Replace with parsed + coerced data (e.g., string "2" → number 2)
      if (source === 'body') req.body = result.data
      else if (source === 'query') req.query = result.data
      else req.params = result.data

      next()
      return
    }

    // Validation failed — return structured field errors
    const response: ApiErrorResponse = {
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: { fieldErrors: result.error.flatten().fieldErrors },
    }

    res.status(400).json(response)
  }
}
