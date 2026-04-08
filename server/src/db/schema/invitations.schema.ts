/**
 * @file invitations.schema.ts — Drizzle schema for the invitations table
 * @module server/db/schema
 *
 * Tracks workspace invitations with secure tokens and 48-hour expiry.
 * Role is restricted to member/viewer — owner and admin roles cannot
 * be assigned via invitation. No updated_at column because status
 * transitions are discrete events (pending → accepted/expired/revoked).
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/members.schema.ts — accepted invitations create members
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { invitationStatusEnum, roleEnum } from './enums.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspace_id: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: roleEnum('role').notNull(),
  token: text('token').notNull().unique(),
  invited_by: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  status: invitationStatusEnum('status').notNull().default('pending'),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
