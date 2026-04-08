/**
 * @file projects.schema.ts — Drizzle schema for the projects table
 * @module server/db/schema
 *
 * Projects are workspace-level containers for tasks. Each project has
 * a unique key (e.g., "ENG") used as the prefix for task numbering
 * (ENG-1, ENG-2). The task_counter only increments — deleted task
 * numbers are never reused.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/tasks.schema.ts — tasks belong to projects
 */

import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    key: text('key').notNull(),
    color: text('color').notNull().default('#6366f1'),
    task_counter: integer('task_counter').notNull().default(0),
    is_archived: boolean('is_archived').notNull().default(false),
    created_by: uuid('created_by')
      .notNull()
      .references(() => users.id),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workspaceKeyUnique: uniqueIndex('projects_workspace_key_unique').on(table.workspace_id, table.key),
  }),
)
