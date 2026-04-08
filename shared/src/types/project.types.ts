/**
 * @file project.types.ts — Project entity types
 * @module shared/types
 *
 * Defines workspace-level project containers. Each project has a unique key
 * (e.g., "ENG") used as the prefix for task numbering (ENG-1, ENG-2).
 * The task_counter only increments — deleted task numbers are never reused.
 *
 * @dependencies none
 * @related shared/src/types/task.types.ts — tasks belong to projects
 */

export interface Project {
  readonly id: string
  readonly workspace_id: string
  readonly name: string
  readonly description: string | null
  readonly key: string
  readonly color: string
  readonly task_counter: number
  readonly is_archived: boolean
  readonly created_by: string
  readonly created_at: string
  readonly updated_at: string
}

export interface CreateProjectInput {
  readonly name: string
  readonly key: string
  readonly description?: string
  readonly color?: string
}

export interface UpdateProjectInput {
  readonly name?: string
  readonly description?: string | null
  readonly color?: string
  readonly is_archived?: boolean
}
