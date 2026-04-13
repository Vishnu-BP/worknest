/**
 * @file comment.routes.ts — Comment API endpoints
 * @module server/modules/comment
 *
 * Four endpoints for task comment management:
 *   GET    /workspaces/:slug/tasks/:taskId/comments  — list (paginated)
 *   POST   /workspaces/:slug/tasks/:taskId/comments  — create (member+)
 *   PATCH  /workspaces/:slug/comments/:id            — edit (author only)
 *   DELETE /workspaces/:slug/comments/:id            — delete (author/admin/owner)
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/comment/comment.service.ts — business logic
 */

import { Router } from 'express'

import { createCommentSchema, updateCommentSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import { logActivity } from '../activity'
import * as commentService from './comment.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/tasks/:taskId/comments ──────────────

router.get(
  '/workspaces/:slug/tasks/:taskId/comments',
  authMiddleware,
  workspaceMiddleware,
  rbac('comment:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string
      const page = Number(req.query['page']) || 1
      const limit = Math.min(Number(req.query['limit']) || 20, 100)

      const result = await commentService.listByTask(
        req.membership!.workspaceId,
        taskId,
        page,
        limit,
      )

      res.json({
        data: result.comments,
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

// ─── POST /workspaces/:slug/tasks/:taskId/comments ─────────────

router.post(
  '/workspaces/:slug/tasks/:taskId/comments',
  authMiddleware,
  workspaceMiddleware,
  rbac('comment:create'),
  writeLimiter,
  validate(createCommentSchema),
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string

      const comment = await commentService.create(
        req.membership!.workspaceId,
        taskId,
        req.user!.id,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'comment_added',
        'comment',
        comment.id,
        { task_id: taskId },
      )

      res.status(201).json({ data: comment })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/comments/:id ──────────────────────

router.patch(
  '/workspaces/:slug/comments/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('comment:update'),
  writeLimiter,
  validate(updateCommentSchema),
  async (req, res, next) => {
    try {
      const commentId = req.params['id'] as string

      const comment = await commentService.update(
        commentId,
        req.membership!.workspaceId,
        req.user!.id,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'comment_updated',
        'comment',
        commentId,
        {},
      )

      res.json({ data: comment })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/comments/:id ─────────────────────

router.delete(
  '/workspaces/:slug/comments/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('comment:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const commentId = req.params['id'] as string

      await commentService.deleteComment(
        commentId,
        req.membership!.workspaceId,
        req.user!.id,
        req.membership!.role,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'comment_deleted',
        'comment',
        commentId,
        {},
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as commentRouter }
