/**
 * @file members.schema.ts — Drizzle schema for the members table
 * @module server/db/schema
 *
 * The members table is the join between users and workspaces, carrying
 * the role that determines permissions. Each user can have exactly one
 * membership per workspace (enforced by unique constraint).
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/users.schema.ts, server/src/db/schema/workspaces.schema.ts
 */

import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { roleEnum } from './enums.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const members = pgTable(
  'members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull().default('member'),
    joined_at: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    workspaceUserUnique: uniqueIndex('members_workspace_user_unique').on(table.workspace_id, table.user_id),
  }),
)
