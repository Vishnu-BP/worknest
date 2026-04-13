/**
 * @file task-labels.schema.ts — Drizzle schema for the task_labels table
 * @module server/db/schema
 *
 * Many-to-many junction table between tasks and labels. Uses a composite
 * primary key (task_id, label_id) — no separate id column, no timestamps.
 * Both FKs cascade on delete — removing a task or label automatically
 * cleans up the association.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/tasks.schema.ts, server/src/db/schema/labels.schema.ts
 */

import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'

import { labels } from './labels.schema'
import { tasks } from './tasks.schema'

export const taskLabels = pgTable(
  'task_labels',
  {
    task_id: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    label_id: uuid('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.task_id, table.label_id] }),
  }),
)
