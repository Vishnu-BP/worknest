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

import { and, count, desc, eq, inArray } from 'drizzle-orm'

import { db } from '../../core/db'
import { activityLog, users } from '../../core/db/schema'
import { createLogger } from '../../core/utils'

import type { ActivityAction, ActivityLog, EntityType } from '@worknest/shared'

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

/**
 * Lists activity entries for a workspace with pagination and optional
 * filters. Includes the actor's user profile (name, email) via JOIN.
 * Ordered by created_at descending (newest first).
 */
export async function listByWorkspace(
  workspaceId: string,
  page: number = 1,
  limit: number = 20,
  filters?: {
    entityType?: EntityType[]
  },
): Promise<{ activities: (ActivityLog & { actor: { id: string; email: string; full_name: string | null } })[]; total: number }> {
  const offset = (page - 1) * limit

  const conditions = [eq(activityLog.workspace_id, workspaceId)]

  if (filters?.entityType && filters.entityType.length > 0) {
    conditions.push(inArray(activityLog.entity_type, filters.entityType))
  }

  const whereClause = and(...conditions)

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: activityLog.id,
        workspace_id: activityLog.workspace_id,
        actor_id: activityLog.actor_id,
        action: activityLog.action,
        entity_type: activityLog.entity_type,
        entity_id: activityLog.entity_id,
        metadata: activityLog.metadata,
        created_at: activityLog.created_at,
        actor_email: users.email,
        actor_full_name: users.full_name,
      })
      .from(activityLog)
      .innerJoin(users, eq(activityLog.actor_id, users.id))
      .where(whereClause)
      .orderBy(desc(activityLog.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(activityLog)
      .where(whereClause),
  ])

  const activities = rows.map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    actor_id: row.actor_id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metadata: row.metadata as Record<string, unknown>,
    created_at: row.created_at.toISOString(),
    actor: {
      id: row.actor_id,
      email: row.actor_email,
      full_name: row.actor_full_name,
    },
  }))

  return {
    activities,
    total: totalRow?.count ?? 0,
  }
}
