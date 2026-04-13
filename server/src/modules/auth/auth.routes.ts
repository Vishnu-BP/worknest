/**
 * @file auth.routes.ts — Authentication API endpoints
 * @module server/modules/auth
 *
 * Three endpoints for authentication and profile management:
 *   POST /auth/callback — ensure user exists after signup (public)
 *   GET  /auth/me       — get current user's profile (authenticated)
 *   PATCH /auth/me      — update profile name/avatar (authenticated)
 *
 * Routes are thin — they parse the request, call the service, and
 * send the response. All business logic lives in auth.service.ts.
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/auth/auth.service.ts — business logic
 */

import { Router } from 'express'

import { updateProfileSchema } from '@worknest/shared'

import {
  authMiddleware,
  readLimiter,
  validate,
  writeLimiter,
} from '../../core/middleware'

import { ensureUserExists, getProfile, updateProfile } from './auth.service'

import type { ApiSuccessResponse, User } from '@worknest/shared'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── POST /auth/callback ───────────────────────────────────────
// Public endpoint — called by frontend after Supabase Auth signup/login.
// Ensures the user row exists in public.users (safety net for the trigger).

router.post('/auth/callback', writeLimiter, async (req, res, next) => {
  try {
    const { userId, email, fullName } = req.body as {
      userId: string
      email: string
      fullName?: string
    }

    const user = await ensureUserExists(userId, email, fullName)

    const response: ApiSuccessResponse<{ user: User }> = {
      data: { user },
    }

    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
})

// ─── GET /auth/me ──────────────────────────────────────────────
// Returns the authenticated user's profile.
// Requires valid JWT (authMiddleware verifies and attaches req.user).

router.get('/auth/me', authMiddleware, readLimiter, async (req, res, next) => {
  try {
    const user = await getProfile(req.user!.id)

    const response: ApiSuccessResponse<{ user: User }> = {
      data: { user },
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
})

// ─── PATCH /auth/me ────────────────────────────────────────────
// Updates the authenticated user's profile (full_name, avatar_url).
// Validates request body against the shared updateProfileSchema.

router.patch(
  '/auth/me',
  authMiddleware,
  writeLimiter,
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const user = await updateProfile(req.user!.id, req.body)

      const response: ApiSuccessResponse<{ user: User }> = {
        data: { user },
      }

      res.json(response)
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as authRouter }
