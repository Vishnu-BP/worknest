/**
 * @file label.types.ts — Label entity types
 * @module shared/types
 *
 * Defines workspace-scoped labels (tags) that can be applied to tasks
 * across all projects. Labels have a name and color for badge rendering.
 * The task_labels junction table handles the many-to-many relationship.
 *
 * @dependencies none
 * @related shared/src/types/task.types.ts — labels applied to tasks
 */

export interface Label {
  readonly id: string
  readonly workspace_id: string
  readonly name: string
  readonly color: string
  readonly created_at: string
}

export interface CreateLabelInput {
  readonly name: string
  readonly color?: string
}

export interface UpdateLabelInput {
  readonly name?: string
  readonly color?: string
}
