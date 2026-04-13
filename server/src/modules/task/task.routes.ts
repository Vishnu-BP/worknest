/**
 * @file task.routes.ts — Task API endpoints
 * @module server/modules/task
 *
 * Six endpoints for task management:
 *   GET    /workspaces/:slug/projects/:projectId/tasks  — list (filterable)
 *   POST   /workspaces/:slug/projects/:projectId/tasks  — create (auto task_number)
 *   GET    /workspaces/:slug/tasks/:taskId              — get detail
 *   PATCH  /workspaces/:slug/tasks/:taskId              — update fields
 *   PATCH  /workspaces/:slug/tasks/:taskId/move         — drag-and-drop move
 *   DELETE /workspaces/:slug/tasks/:taskId              — delete
 *
 * Activity logging is called after each mutation succeeds.
 * Move is separate from update for distinct activity tracking.
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/task/task.service.ts — business logic
 */

import { Router } from 'express'

import { createTaskSchema, moveTaskSchema, updateTaskSchema } from '@worknest/shared'
import type { Priority, TaskStatus } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import { logActivity } from '../activity'
import * as taskService from './task.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/projects/:projectId/tasks ───────────
// List tasks for a project with optional filters.
// Query params: ?status=todo&status=in_progress&priority=high&assignee_id=uuid

router.get(
  '/workspaces/:slug/projects/:projectId/tasks',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const projectId = req.params['projectId'] as string
      const query = req.query

      // Parse multi-value filters from query params
      const statusFilter = query['status']
        ? (Array.isArray(query['status']) ? query['status'] : [query['status']]) as TaskStatus[]
        : undefined

      const priorityFilter = query['priority']
        ? (Array.isArray(query['priority']) ? query['priority'] : [query['priority']]) as Priority[]
        : undefined

      const assigneeId = query['assignee_id'] as string | undefined

      const tasks = await taskService.listByProject(
        projectId,
        req.membership!.workspaceId,
        {
          status: statusFilter,
          priority: priorityFilter,
          assigneeId,
        },
      )

      res.json({ data: tasks })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/projects/:projectId/tasks ──────────
// Create a new task with auto-incremented task_number.

router.post(
  '/workspaces/:slug/projects/:projectId/tasks',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:create'),
  writeLimiter,
  validate(createTaskSchema),
  async (req, res, next) => {
    try {
      const projectId = req.params['projectId'] as string

      const task = await taskService.create(
        req.membership!.workspaceId,
        projectId,
        req.user!.id,
        req.body,
      )

      // Log activity (non-blocking — failures won't affect response)
      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'task_created',
        'task',
        task.id,
        { task_number: task.task_number, title: task.title, project_id: projectId },
      )

      res.status(201).json({ data: task })
    } catch (error) {
      next(error)
    }
  },
)

// ─── GET /workspaces/:slug/tasks/:taskId ───────────────────────
// Get full task detail.

router.get(
  '/workspaces/:slug/tasks/:taskId',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const task = await taskService.getById(
        req.params['taskId'] as string,
        req.membership!.workspaceId,
      )
      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/tasks/:taskId ─────────────────────
// Update task fields (NOT status/position — use /move for that).

router.patch(
  '/workspaces/:slug/tasks/:taskId',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:update'),
  writeLimiter,
  validate(updateTaskSchema),
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string

      const task = await taskService.update(
        taskId,
        req.membership!.workspaceId,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'task_updated',
        'task',
        taskId,
        { changed_fields: Object.keys(req.body) },
      )

      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/tasks/:taskId/move ────────────────
// Drag-and-drop: change status + position.

router.patch(
  '/workspaces/:slug/tasks/:taskId/move',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:update'),
  writeLimiter,
  validate(moveTaskSchema),
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string

      // Get current state for activity metadata
      const currentTask = await taskService.getById(
        taskId,
        req.membership!.workspaceId,
      )

      const task = await taskService.move(
        taskId,
        req.membership!.workspaceId,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'task_moved',
        'task',
        taskId,
        { from_status: currentTask.status, to_status: task.status },
      )

      res.json({ data: task })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/tasks/:taskId ────────────────────
// Delete task (cascade removes task_labels, comments).

router.delete(
  '/workspaces/:slug/tasks/:taskId',
  authMiddleware,
  workspaceMiddleware,
  rbac('task:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const taskId = req.params['taskId'] as string

      const task = await taskService.deleteTask(
        taskId,
        req.membership!.workspaceId,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'task_deleted',
        'task',
        taskId,
        { task_number: task.task_number, title: task.title },
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as taskRouter }
