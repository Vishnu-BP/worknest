/**
 * @file activity.service.ts — Activity log business logic
 * @module server/modules/activity
 *
 * Provides logActivity() for writing immutable audit trail entries.
 * Called by route handlers after each successful mutation (task create,
 * update, move, delete, plus member and project actions in future).
 *
 * Activity log entries are NEVER updated or deleted — they are an
 * append-only audit trail of all workspace actions.
 *
 * @dependencies drizzle-orm, server/src/core/db
 * @related server/src/core/db/schema/activity-log.schema.ts — table definition
 */

import { db } from '../../core/db'
import { activityLog } from '../../core/db/schema'
import { createLogger } from '../../core/utils'

import type { ActivityAction, EntityType } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates an immutable activity log entry. Called after every
 * significant workspace action (task CRUD, member changes, etc.).
 *
 * Metadata is flexible JSONB — varies per action type:
 *   task_created: { project_key, task_number, title }
 *   task_moved:   { from_status, to_status }
 *   task_updated: { changed_fields: [...] }
 *   task_deleted: { task_number, title }
 */
export async function logActivity(
  workspaceId: string,
  actorId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.insert(activityLog).values({
      workspace_id: workspaceId,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })

    log.debug('Activity logged', { action, entityType, entityId })
  } catch (error) {
    // Activity logging should never block the main operation.
    // Log the error but don't re-throw — the user's action already succeeded.
    log.error('Failed to log activity', { action, entityType, entityId, error })
  }
}
