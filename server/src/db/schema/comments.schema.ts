/**
 * @file comments.schema.ts — Drizzle schema for the comments table
 * @module server/db/schema
 *
 * Task discussion comments with markdown body. workspace_id is stored
 * directly for fast RLS policy checks without joining through tasks.
 * Comments are rendered with react-markdown on the frontend.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/tasks.schema.ts — comments belong to tasks
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { tasks } from './tasks.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspace_id: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  task_id: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  author_id: uuid('author_id')
    .notNull()
    .references(() => users.id),
  body: text('body').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
