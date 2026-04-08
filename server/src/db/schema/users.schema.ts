/**
 * @file users.schema.ts — Drizzle schema for the users table
 * @module server/db/schema
 *
 * Users are synced from Supabase Auth via a database trigger.
 * This is the only table without workspace_id — users exist globally.
 * The id matches the Supabase Auth user ID (no gen_random_uuid default).
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/members.schema.ts — links users to workspaces
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  full_name: text('full_name').notNull().default(''),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
