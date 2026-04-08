/**
 * @file tasks.schema.ts — Drizzle schema for the tasks table
 * @module server/db/schema
 *
 * The core entity — every Kanban card is a task row. This is the most
 * complex schema file due to multiple FK relationships:
 * - workspace_id: redundant for fast RLS (avoids join through projects)
 * - assignee_id: ON DELETE SET NULL (task stays, becomes unassigned)
 * - parent_id: self-reference for subtasks, ON DELETE SET NULL
 * - created_by: no cascade (cannot delete user who created tasks)
 * Position uses fractional indexing for drag-and-drop ordering.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/projects.schema.ts — tasks belong to projects
 */

import { date, integer, pgTable, real, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { priorityEnum, taskStatusEnum } from './enums.schema'
import { projects } from './projects.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    project_id: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    task_number: integer('task_number').notNull(),
    status: taskStatusEnum('status').notNull().default('backlog'),
    priority: priorityEnum('priority').notNull().default('none'),
    position: real('position').notNull().default(0),
    assignee_id: uuid('assignee_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    created_by: uuid('created_by')
      .notNull()
      .references(() => users.id),
    parent_id: uuid('parent_id'),
    due_date: date('due_date'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    projectTaskNumberUnique: uniqueIndex('tasks_project_task_number_unique').on(table.project_id, table.task_number),
  }),
)
