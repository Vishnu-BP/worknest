/**
 * @file task.validators.ts — Task validation schemas
 * @module shared/validators
 *
 * Zod schemas for task CRUD and the separate move operation.
 * moveTaskSchema is distinct from updateTaskSchema because drag-and-drop
 * (status + position change) is a different operation from field editing,
 * with different activity log entries and optimistic update handling.
 *
 * @dependencies zod, shared/src/types/enums.ts
 * @related server/src/routes/task.routes.ts — backend consumer
 */

import { z } from 'zod'

import { PRIORITY, TASK_STATUS } from '../types/enums'

// ─── Enum Value Arrays for Zod ─────────────────────────────────

const taskStatusValues = Object.values(TASK_STATUS) as [string, ...string[]]
const priorityValues = Object.values(PRIORITY) as [string, ...string[]]

// ─── Schemas ───────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional(),
  priority: z.enum(priorityValues).default(PRIORITY.NONE).optional(),
  assignee_id: z.string().uuid('Must be a valid user ID').optional(),
  due_date: z.string().datetime({ message: 'Must be a valid ISO date' }).optional(),
  parent_id: z.string().uuid('Must be a valid task ID').optional(),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less').optional(),
  description: z.string().max(5000, 'Description must be 5000 characters or less').nullable().optional(),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(priorityValues).optional(),
  assignee_id: z.string().uuid('Must be a valid user ID').nullable().optional(),
  due_date: z.string().datetime({ message: 'Must be a valid ISO date' }).nullable().optional(),
})

export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>

export const moveTaskSchema = z.object({
  status: z.enum(taskStatusValues),
  position: z.number({ required_error: 'Position is required' }),
})

export type MoveTaskSchema = z.infer<typeof moveTaskSchema>
