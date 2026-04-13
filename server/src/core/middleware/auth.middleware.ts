/**
 * @file auth.middleware.ts — JWT authentication middleware
 * @module server/core/middleware
 *
 * Verifies the JWT access token from the Authorization header using
 * Supabase's getUser() method. On success, attaches the authenticated
 * user's id and email to req.user for downstream handlers.
 *
 * Uses Supabase getUser() instead of local JWT verification because:
 * - No extra dependency (jsonwebtoken) or env var (JWT_SECRET) needed
 * - Checks if user is still active (not just if token is valid)
 * - Simpler implementation with the same security guarantees
 *
 * @dependencies @supabase/supabase-js, server/src/core/config, server/src/core/utils
 * @related server/src/types/express.d.ts — defines req.user type
 */

import { createClient } from '@supabase/supabase-js'
import type { NextFunction, Request, Response } from 'express'

import { env } from '../config'
import { createLogger, unauthorized } from '../utils'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Supabase Admin Client ─────────────────────────────────────

// Uses service role key to verify tokens server-side.
// This client is only used for auth verification, NOT for database queries.
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ─── Middleware ─────────────────────────────────────────────────

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches the authenticated user to req.user on success.
 * Returns 401 if the token is missing, malformed, or invalid.
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from "Bearer <token>" format
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw unauthorized('Missing authentication token')
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix

    if (!token) {
      throw unauthorized('Missing authentication token')
    }

    // Verify token with Supabase — this checks signature, expiry, and user status
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      log.warn('Token verification failed', { error: error?.message })
      throw unauthorized('Invalid or expired token')
    }

    // Attach verified user to request for downstream handlers
    req.user = {
      id: data.user.id,
      email: data.user.email ?? '',
    }

    next()
  } catch (error) {
    next(error)
  }
}
