/**
 * @file rbac.middleware.ts — Role-based access control enforcement
 * @module server/core/middleware
 *
 * Middleware factory that checks the user's role (from req.membership)
 * against the centralized permissions map. Returns 403 if the role
 * lacks the required permission. Must run AFTER workspaceMiddleware
 * which attaches req.membership.
 *
 * Usage in routes:
 *   router.patch('/workspaces/:slug', authMiddleware, workspaceMiddleware, rbac('workspace:update'), handler)
 *   router.delete('/workspaces/:slug', authMiddleware, workspaceMiddleware, rbac('workspace:delete'), handler)
 *
 * @dependencies server/src/core/utils/permissions
 * @related server/src/core/middleware/workspace.middleware.ts — provides req.membership
 * @related server/src/core/utils/permissions.ts — defines the permission matrix
 */

import type { NextFunction, Request, Response } from 'express'

import { createLogger, forbidden } from '../utils'
import { hasPermission } from '../utils/permissions'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('RBAC')

// ─── Middleware Factory ────────────────────────────────────────

/**
 * Creates middleware that checks if the user's workspace role
 * has the specified permission. The permission string follows
 * the "resource:action" pattern (e.g., "workspace:update").
 */
export function rbac(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.membership?.role

    if (!role) {
      // workspaceMiddleware should have run before this — if not, something is misconfigured
      next(forbidden('Workspace membership required'))
      return
    }

    if (!hasPermission(role, permission)) {
      log.warn('Permission denied', {
        userId: req.user?.id,
        role,
        permission,
        workspace: req.membership?.workspaceId,
      })
      next(forbidden(`Insufficient permissions. Required: ${permission}`))
      return
    }

    next()
  }
}
