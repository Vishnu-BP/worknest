/**
 * @file labels.schema.ts — Drizzle schema for the labels table
 * @module server/db/schema
 *
 * Workspace-scoped labels (tags) applied to tasks via the task_labels
 * junction table. Labels have a name and color for badge rendering.
 * No updated_at column — labels are rarely modified.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/task-labels.schema.ts — junction table
 */

import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { workspaces } from './workspaces.schema'

export const labels = pgTable(
  'labels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    color: text('color').notNull().default('#6366f1'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workspaceNameUnique: uniqueIndex('labels_workspace_name_unique').on(table.workspace_id, table.name),
  }),
)
