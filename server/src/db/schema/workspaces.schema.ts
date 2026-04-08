/**
 * @file workspaces.schema.ts — Drizzle schema for the workspaces table
 * @module server/db/schema
 *
 * Workspaces are the top-level multi-tenancy container. Every other entity
 * (except users) belongs to a workspace. The slug is used in URLs
 * (e.g., /w/acme-corp). owner_id has no cascade — cannot delete a user
 * who owns workspaces.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/users.schema.ts — owner_id FK target
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  owner_id: uuid('owner_id').notNull().references(() => users.id),
  logo_url: text('logo_url'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
