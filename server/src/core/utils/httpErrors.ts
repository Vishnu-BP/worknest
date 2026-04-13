/**
 * @file httpErrors.ts — Typed HTTP error factory functions
 * @module server/utils
 *
 * Thin wrappers around the http-errors package providing named factory
 * functions for common HTTP error statuses. Services throw these instead
 * of constructing errors manually, ensuring consistent status codes
 * and messages throughout the application.
 *
 * The centralized error handler (errorHandler.middleware.ts) catches
 * these and formats them into ApiErrorResponse shape.
 *
 * @dependencies http-errors
 * @related server/src/middleware/errorHandler.middleware.ts — catches these errors
 */

import createHttpError from 'http-errors'
import type { HttpError } from 'http-errors'

export type { HttpError }

/** 400 — Invalid request data or parameters */
export function badRequest(message = 'Bad request'): HttpError {
  return createHttpError(400, message)
}

/** 401 — Missing or invalid authentication credentials */
export function unauthorized(message = 'Unauthorized'): HttpError {
  return createHttpError(401, message)
}

/** 403 — Authenticated but lacks permission for this action */
export function forbidden(message = 'Forbidden'): HttpError {
  return createHttpError(403, message)
}

/** 404 — The requested resource does not exist */
export function notFound(message = 'Not found'): HttpError {
  return createHttpError(404, message)
}

/** 409 — Conflicts with current state (e.g., duplicate slug) */
export function conflict(message = 'Conflict'): HttpError {
  return createHttpError(409, message)
}

/** 429 — Rate limit exceeded */
export function tooManyRequests(message = 'Too many requests'): HttpError {
  return createHttpError(429, message)
}
