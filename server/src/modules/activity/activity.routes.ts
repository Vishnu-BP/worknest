/**
 * @file activity.routes.ts — Activity log API endpoint
 * @module server/modules/activity
 *
 * Single endpoint for the workspace activity feed:
 *   GET /workspaces/:slug/activity — paginated, filterable by entity_type
 *
 * Query params: ?page=1&limit=20&entity_type=task
 *
 * @dependencies express, server/src/core/middleware
 * @related server/src/modules/activity/activity.service.ts — business logic
 */

import { Router } from 'express'

import type { EntityType } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  workspaceMiddleware,
} from '../../core/middleware'

import { listByWorkspace } from './activity.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/activity ────────────────────────────

router.get(
  '/workspaces/:slug/activity',
  authMiddleware,
  workspaceMiddleware,
  rbac('workspace:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const page = Number(req.query['page']) || 1
      const limit = Math.min(Number(req.query['limit']) || 20, 100)

      // Parse entity_type filter (single or multi-value)
      const entityTypeParam = req.query['entity_type']
      const entityTypeFilter = entityTypeParam
        ? (Array.isArray(entityTypeParam) ? entityTypeParam : [entityTypeParam]) as EntityType[]
        : undefined

      const result = await listByWorkspace(
        req.membership!.workspaceId,
        page,
        limit,
        { entityType: entityTypeFilter },
      )

      res.json({
        data: result.activities,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

export { router as activityRouter }
