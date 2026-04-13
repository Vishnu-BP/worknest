/**
 * @file express.d.ts — Express Request type augmentation
 * @module server/types
 *
 * Extends the Express Request interface with custom properties attached
 * by our middleware chain. This gives full TypeScript support when
 * route handlers access req.user (from auth middleware) and
 * req.membership (from workspace middleware, added in Phase 5).
 *
 * @dependencies @worknest/shared — Role type
 * @related server/src/core/middleware/auth.middleware.ts — attaches req.user
 */

import type { Role } from '@worknest/shared'

declare global {
  namespace Express {
    interface Request {
      /** Attached by auth.middleware.ts after JWT verification */
      user?: {
        id: string
        email: string
      }

      /** Attached by workspace.middleware.ts after membership check (Phase 5) */
      membership?: {
        workspaceId: string
        userId: string
        role: Role
      }
    }
  }
}
