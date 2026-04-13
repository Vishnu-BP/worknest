/**
 * @file label.routes.ts — Label API endpoints
 * @module server/modules/label
 *
 * Four endpoints for workspace-scoped label management:
 *   GET    /workspaces/:slug/labels       — list all labels
 *   POST   /workspaces/:slug/labels       — create label (member+)
 *   PATCH  /workspaces/:slug/labels/:id   — update label (owner/admin)
 *   DELETE /workspaces/:slug/labels/:id   — delete label (owner/admin)
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/label/label.service.ts — business logic
 */

import { Router } from 'express'

import { createLabelSchema, updateLabelSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import * as labelService from './label.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

router.get(
  '/workspaces/:slug/labels',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const labels = await labelService.listByWorkspace(req.membership!.workspaceId)
      res.json({ data: labels })
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  '/workspaces/:slug/labels',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:create'),
  writeLimiter,
  validate(createLabelSchema),
  async (req, res, next) => {
    try {
      const label = await labelService.create(req.membership!.workspaceId, req.body)
      res.status(201).json({ data: label })
    } catch (error) {
      next(error)
    }
  },
)

router.patch(
  '/workspaces/:slug/labels/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:update'),
  writeLimiter,
  validate(updateLabelSchema),
  async (req, res, next) => {
    try {
      const label = await labelService.update(
        req.params['id'] as string,
        req.membership!.workspaceId,
        req.body,
      )
      res.json({ data: label })
    } catch (error) {
      next(error)
    }
  },
)

router.delete(
  '/workspaces/:slug/labels/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      await labelService.deleteLabel(
        req.params['id'] as string,
        req.membership!.workspaceId,
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

export { router as labelRouter }
