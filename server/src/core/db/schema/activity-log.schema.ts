/**
 * @file activity-log.schema.ts — Drizzle schema for the activity_log table
 * @module server/db/schema
 *
 * Immutable audit trail of all workspace actions. Entries are never
 * updated or deleted. The metadata column (JSONB) carries action-specific
 * context like { from: "todo", to: "in_progress" } for task moves.
 * Only created_at — no updated_at since entries are immutable.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/enums.schema.ts — activityActionEnum, entityTypeEnum
 */

import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

import { activityActionEnum, entityTypeEnum } from './enums.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspace_id: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  actor_id: uuid('actor_id')
    .notNull()
    .references(() => users.id),
  action: activityActionEnum('action').notNull(),
  entity_type: entityTypeEnum('entity_type').notNull(),
  entity_id: uuid('entity_id').notNull(),
  metadata: jsonb('metadata').notNull().default({}),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
