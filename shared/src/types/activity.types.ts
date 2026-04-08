/**
 * @file activity.types.ts — Activity log entity types
 * @module shared/types
 *
 * Defines the immutable audit trail. Every significant action in a workspace
 * creates an activity_log entry. Entries are never updated or deleted.
 * The metadata field (JSONB) carries action-specific context like
 * "status changed from todo to in_progress".
 *
 * @dependencies shared/src/types/enums.ts — ActivityAction, EntityType
 * @related shared/src/types/task.types.ts, shared/src/types/project.types.ts
 */

import type { ActivityAction, EntityType } from './enums'

export interface ActivityLog {
  readonly id: string
  readonly workspace_id: string
  readonly actor_id: string
  readonly action: ActivityAction
  readonly entity_type: EntityType
  readonly entity_id: string
  readonly metadata: Record<string, unknown>
  readonly created_at: string
}
