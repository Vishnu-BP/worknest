/**
 * @file project.routes.ts — Project API endpoints
 * @module server/modules/project
 *
 * Five endpoints for project management within a workspace:
 *   GET    /workspaces/:slug/projects             — list projects
 *   POST   /workspaces/:slug/projects             — create project (member+)
 *   GET    /workspaces/:slug/projects/:projectId  — get project
 *   PATCH  /workspaces/:slug/projects/:projectId  — update project (member+)
 *   DELETE /workspaces/:slug/projects/:projectId  — delete project (owner/admin)
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/project/project.service.ts — business logic
 */

import { Router } from 'express'

import { createProjectSchema, updateProjectSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import * as projectService from './project.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/projects ────────────────────────────

router.get(
  '/workspaces/:slug/projects',
  authMiddleware,
  workspaceMiddleware,
  rbac('project:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const projects = await projectService.listByWorkspace(
        req.membership!.workspaceId,
      )
      res.json({ data: projects })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/projects ───────────────────────────

router.post(
  '/workspaces/:slug/projects',
  authMiddleware,
  workspaceMiddleware,
  rbac('project:create'),
  writeLimiter,
  validate(createProjectSchema),
  async (req, res, next) => {
    try {
      const project = await projectService.create(
        req.membership!.workspaceId,
        req.user!.id,
        req.body,
      )
      res.status(201).json({ data: project })
    } catch (error) {
      next(error)
    }
  },
)

// ─── GET /workspaces/:slug/projects/:projectId ─────────────────

router.get(
  '/workspaces/:slug/projects/:projectId',
  authMiddleware,
  workspaceMiddleware,
  rbac('project:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const project = await projectService.getById(
        req.params['projectId'] as string,
        req.membership!.workspaceId,
      )
      res.json({ data: project })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/projects/:projectId ───────────────

router.patch(
  '/workspaces/:slug/projects/:projectId',
  authMiddleware,
  workspaceMiddleware,
  rbac('project:update'),
  writeLimiter,
  validate(updateProjectSchema),
  async (req, res, next) => {
    try {
      const project = await projectService.update(
        req.params['projectId'] as string,
        req.membership!.workspaceId,
        req.body,
      )
      res.json({ data: project })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/projects/:projectId ──────────────

router.delete(
  '/workspaces/:slug/projects/:projectId',
  authMiddleware,
  workspaceMiddleware,
  rbac('project:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      await projectService.deleteProject(
        req.params['projectId'] as string,
        req.membership!.workspaceId,
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as projectRouter }
