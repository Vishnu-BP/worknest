/**
 * @file task.types.ts — Task entity types
 * @module shared/types
 *
 * Defines the core task entity — every Kanban card is a task row.
 * workspace_id is intentionally redundant (derivable from project_id)
 * but stored directly for fast RLS policy checks without joins.
 * Position uses fractional indexing for drag-and-drop ordering.
 *
 * @dependencies shared/src/types/enums.ts — TaskStatus, Priority
 * @related shared/src/types/project.types.ts — tasks belong to projects
 */

import type { Priority, TaskStatus } from './enums'

export interface Task {
  readonly id: string
  readonly workspace_id: string
  readonly project_id: string
  readonly title: string
  readonly description: string | null
  readonly task_number: number
  readonly status: TaskStatus
  readonly priority: Priority
  readonly position: number
  readonly assignee_id: string | null
  readonly created_by: string
  readonly parent_id: string | null
  readonly due_date: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface CreateTaskInput {
  readonly title: string
  readonly description?: string
  readonly priority?: Priority
  readonly assignee_id?: string
  readonly due_date?: string
  readonly parent_id?: string
}

export interface UpdateTaskInput {
  readonly title?: string
  readonly description?: string | null
  readonly status?: TaskStatus
  readonly priority?: Priority
  readonly assignee_id?: string | null
  readonly due_date?: string | null
}

export interface MoveTaskInput {
  readonly status: TaskStatus
  readonly position: number
}
