/**
 * @file workspace.routes.ts — Workspace API endpoints
 * @module server/modules/workspace
 *
 * Five endpoints for workspace management:
 *   GET    /workspaces       — list user's workspaces (auth only)
 *   POST   /workspaces       — create workspace + owner member (auth only)
 *   GET    /workspaces/:slug — get workspace details (member only)
 *   PATCH  /workspaces/:slug — update workspace (owner/admin only)
 *   DELETE /workspaces/:slug — delete workspace (owner only)
 *
 * Routes are thin — parse request, call service, send response.
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/workspace/workspace.service.ts — business logic
 */

import { Router } from 'express'

import { createWorkspaceSchema, updateWorkspaceSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import * as workspaceService from './workspace.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces ───────────────────────────────────────────
// List all workspaces the authenticated user belongs to.
// No workspace scope — just auth required.

router.get(
  '/workspaces',
  authMiddleware,
  readLimiter,
  async (req, res, next) => {
    try {
      const workspaces = await workspaceService.listForUser(req.user!.id)
      res.json({ data: workspaces })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces ──────────────────────────────────────────
// Create a new workspace. The requesting user becomes the owner.

router.post(
  '/workspaces',
  authMiddleware,
  writeLimiter,
  validate(createWorkspaceSchema),
  async (req, res, next) => {
    try {
      const result = await workspaceService.create(req.user!.id, req.body)
      res.status(201).json({ data: result })
    } catch (error) {
      next(error)
    }
  },
)

// ─── GET /workspaces/:slug ─────────────────────────────────────
// Get workspace details. Requires workspace membership.

router.get(
  '/workspaces/:slug',
  authMiddleware,
  workspaceMiddleware,
  readLimiter,
  async (req, res, next) => {
    try {
      const workspace = await workspaceService.getBySlug(req.params['slug'] as string)
      res.json({ data: workspace })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug ───────────────────────────────────
// Update workspace name or logo. Owner and admin only.

router.patch(
  '/workspaces/:slug',
  authMiddleware,
  workspaceMiddleware,
  rbac('workspace:update'),
  writeLimiter,
  validate(updateWorkspaceSchema),
  async (req, res, next) => {
    try {
      const workspace = await workspaceService.update(
        req.membership!.workspaceId,
        req.body,
      )
      res.json({ data: workspace })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug ──────────────────────────────────
// Delete workspace and cascade all related data. Owner only.

router.delete(
  '/workspaces/:slug',
  authMiddleware,
  workspaceMiddleware,
  rbac('workspace:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      await workspaceService.deleteWorkspace(req.membership!.workspaceId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as workspaceRouter }
