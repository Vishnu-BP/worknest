/**
 * @file workspace.middleware.ts — Workspace context and membership verification
 * @module server/core/middleware
 *
 * Extracts the workspace slug from the URL, verifies the authenticated user
 * is a member of that workspace, and attaches membership context (workspaceId,
 * userId, role) to req.membership. This is the second layer of the auth chain:
 *
 *   authMiddleware (who are you?) → workspaceMiddleware (are you a member?)
 *   → rbacMiddleware (do you have permission?)
 *
 * Used on ALL workspace-scoped routes (/api/workspaces/:slug/*).
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/core/middleware/auth.middleware.ts — provides req.user
 * @related server/src/core/middleware/rbac.middleware.ts — reads req.membership
 */

import { and, eq } from 'drizzle-orm'
import type { NextFunction, Request, Response } from 'express'

import { db } from '../db'
import { members, workspaces } from '../db/schema'
import { createLogger, forbidden, notFound } from '../utils'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('MW')

// ─── Middleware ─────────────────────────────────────────────────

/**
 * Verifies the authenticated user is a member of the workspace
 * identified by the :slug URL parameter. Attaches workspace context
 * to req.membership for downstream RBAC checks and route handlers.
 *
 * Returns 404 if workspace doesn't exist, 403 if user isn't a member.
 */
export async function workspaceMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slug = req.params['slug'] as string | undefined

    if (!slug) {
      throw notFound('Workspace not found')
    }

    // Find workspace by slug
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1)

    if (!workspace) {
      throw notFound('Workspace not found')
    }

    // Verify user is a member of this workspace
    const userId = req.user?.id
    if (!userId) {
      throw forbidden('Authentication required')
    }

    const [member] = await db
      .select({ role: members.role })
      .from(members)
      .where(
        and(
          eq(members.workspace_id, workspace.id),
          eq(members.user_id, userId),
        ),
      )
      .limit(1)

    if (!member) {
      log.warn('Non-member attempted workspace access', { slug, userId })
      throw forbidden('You are not a member of this workspace')
    }

    // Attach membership context for RBAC and route handlers
    req.membership = {
      workspaceId: workspace.id,
      userId,
      role: member.role,
    }

    next()
  } catch (error) {
    next(error)
  }
}
