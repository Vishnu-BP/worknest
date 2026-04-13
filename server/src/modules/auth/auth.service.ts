/**
 * @file auth.service.ts — Authentication business logic
 * @module server/modules/auth
 *
 * Handles user profile operations: ensuring a user exists in public.users
 * after Supabase Auth signup, fetching profiles, and updating profile fields.
 *
 * The ensureUserExists function is a safety net for the database trigger
 * (handle_new_user) — if the trigger fails or there's a race condition,
 * this upsert guarantees the user row exists before returning.
 *
 * This service has NO HTTP/Express awareness — it receives plain data
 * and returns plain results. Route handlers call this, not the other way.
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/auth/auth.routes.ts — calls these functions
 */

import { eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { users } from '../../core/db/schema'
import { createLogger, notFound } from '../../core/utils'

import type { UpdateProfileInput, User } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('AUTH')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Ensures a user row exists in public.users after Supabase Auth signup.
 * Uses INSERT ... ON CONFLICT DO UPDATE (upsert) so it's safe to call
 * multiple times — idempotent. The database trigger handles most cases,
 * but this function covers race conditions and edge cases.
 */
export async function ensureUserExists(
  id: string,
  email: string,
  fullName?: string,
): Promise<User> {
  log.debug('Ensuring user exists', { id, email })

  const [user] = await db
    .insert(users)
    .values({
      id,
      email,
      full_name: fullName ?? '',
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email,
        full_name: fullName ?? undefined,
      },
    })
    .returning()

  if (!user) {
    throw notFound('Failed to create or find user')
  }

  log.info('User ensured', { id: user.id, email: user.email })
  return mapToUser(user)
}

/**
 * Retrieves a user's profile by their ID.
 * Called by GET /api/auth/me after auth middleware verifies the JWT.
 */
export async function getProfile(userId: string): Promise<User> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw notFound('User not found')
  }

  return mapToUser(user)
}

/**
 * Updates a user's profile fields (full_name, avatar_url).
 * Only updates fields that are provided in the input — undefined fields
 * are left unchanged. Returns the updated user.
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<User> {
  log.debug('Updating profile', { userId, fields: Object.keys(input) })

  const [user] = await db
    .update(users)
    .set(input)
    .where(eq(users.id, userId))
    .returning()

  if (!user) {
    throw notFound('User not found')
  }

  log.info('Profile updated', { id: user.id })
  return mapToUser(user)
}

// ─── Helpers ───────────────────────────────────────────────────

/** Maps a Drizzle row to the shared User type with ISO string timestamps */
function mapToUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}
