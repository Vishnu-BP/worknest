/**
 * @file rateLimiter.middleware.ts — Three-tier rate limiting
 * @module server/middleware
 *
 * Provides three pre-configured rate limiters for different endpoint
 * categories. Applied per-route in route definitions — NOT globally.
 * Uses standard RateLimit-* response headers so clients know their
 * remaining quota. Responds with ApiErrorResponse format on limit.
 *
 * Tiers:
 *   readLimiter   — 100 req/min  (GET routes)
 *   writeLimiter  — 30 req/min   (POST/PATCH/DELETE routes)
 *   strictLimiter — 20 req/hour  (auth attempts, invitations)
 *
 * @dependencies express-rate-limit
 * @related server/src/routes/ — routes apply the appropriate limiter
 */

import rateLimit from 'express-rate-limit'

import type { ApiErrorResponse } from '@worknest/shared'

// ─── Constants ─────────────────────────────────────────────────

const ONE_MINUTE_MS = 60_000
const ONE_HOUR_MS = 3_600_000

const RATE_LIMIT_RESPONSE: ApiErrorResponse = {
  error: 'RATE_LIMIT',
  message: 'Too many requests, please try again later',
}

// ─── Factory ───────────────────────────────────────────────────

function createLimiter(windowMs: number, limit: number): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: RATE_LIMIT_RESPONSE,
  })
}

// ─── Exported Limiters ─────────────────────────────────────────

/** 100 requests per minute — for read operations (GET endpoints) */
export const readLimiter = createLimiter(ONE_MINUTE_MS, 100)

/** 30 requests per minute — for write operations (POST/PATCH/DELETE) */
export const writeLimiter = createLimiter(ONE_MINUTE_MS, 30)

/** 20 requests per hour — for sensitive operations (auth, invitations) */
export const strictLimiter = createLimiter(ONE_HOUR_MS, 20)
