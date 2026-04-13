/**
 * @file errorHandler.middleware.ts — Centralized Express error handler
 * @module server/middleware
 *
 * Catches ALL errors that pass through next(error) from any middleware
 * or route handler. Formats them into a consistent ApiErrorResponse.
 *
 * Handles three error types:
 *   1. HttpError (from http-errors) — intentional errors thrown by services
 *   2. ZodError (from Zod) — validation failures
 *   3. Unknown — unexpected errors (logged, never exposed to client)
 *
 * MUST be registered LAST in the middleware chain. Express identifies
 * error handlers by their 4-parameter signature (err, req, res, next).
 *
 * @dependencies http-errors, zod, server/src/utils/logger
 * @related server/src/utils/httpErrors.ts — creates the errors caught here
 */

import type { NextFunction, Request, Response } from 'express'
import { isHttpError } from 'http-errors'
import { ZodError } from 'zod'

import type { ApiErrorResponse } from '@worknest/shared'

import { createLogger } from '../utils'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('API')

// ─── Error Handler ─────────────────────────────────────────────

/**
 * Centralized error handler. The _next parameter is unused but REQUIRED —
 * Express only recognizes this as an error handler if it has exactly
 * 4 parameters. Removing it breaks error routing entirely.
 */
export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. HttpError — intentional errors from services (notFound, forbidden, etc.)
  if (isHttpError(err)) {
    const response: ApiErrorResponse = {
      error: err.name,
      message: err.message,
    }
    res.status(err.status).json(response)
    return
  }

  // 2. ZodError — validation failures (malformed request data)
  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: { fieldErrors: err.flatten().fieldErrors },
    }
    res.status(400).json(response)
    return
  }

  // 3. Unknown — something unexpected broke. Log full error, return generic message.
  //    Never expose internal details (stack trace, DB errors) to the client.
  log.error('Unhandled error', err)

  const response: ApiErrorResponse = {
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
  }
  res.status(500).json(response)
}
