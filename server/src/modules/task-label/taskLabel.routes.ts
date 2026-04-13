/**
 * @file taskLabel.routes.ts — Task-label association endpoints
 * @module server/modules/task-label
 *
 * Two endpoints for managing labels on tasks:
 *   POST   /workspaces/:slug/tasks/:taskId/labels            — add label (member+)
 *   DELETE /workspaces/:slug/tasks/:taskId/labels/:labelId   — remove label (member+)
 *
 * @dependencies express, server/src/core/middleware
 * @related server/src/modules/task-label/taskLabel.service.ts
 */

import { Router } from 'express'

import {
  authMiddleware,
  rbac,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import * as taskLabelService from './taskLabel.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── POST /workspaces/:slug/tasks/:taskId/labels ───────────────

router.post(
  '/workspaces/:slug/tasks/:taskId/labels',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:create'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string
      const { labelId } = req.body as { labelId: string }

      await taskLabelService.addLabel(taskId, labelId)

      res.status(201).json({ data: { success: true } })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/tasks/:taskId/labels/:labelId ────

router.delete(
  '/workspaces/:slug/tasks/:taskId/labels/:labelId',
  authMiddleware,
  workspaceMiddleware,
  rbac('label:create'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string
      const labelId = req.params['labelId'] as string

      await taskLabelService.removeLabel(taskId, labelId)

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

export { router as taskLabelRouter }
