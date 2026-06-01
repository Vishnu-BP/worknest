/**
 * @file chat.schema.ts — Drizzle schema for chat tables (channels, messages, reactions, attachments)
 * @module server/db/schema
 *
 * Slack-style chat with project channels and workspace DMs. A channel
 * either belongs to a project (project channel) or is a 1:1 DM
 * (is_dm=true, project_id=null, members in chat_channel_members). All
 * rows carry workspace_id directly for fast RLS checks without joining
 * through projects.
 *
 * @dependencies drizzle-orm/pg-core
 * @related server/src/db/schema/projects.schema.ts — project channels link here
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { projects } from './projects.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

// ─── Channels ──────────────────────────────────────────────────

export const chatChannels = pgTable(
  'chat_channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    project_id: uuid('project_id').references(() => projects.id, {
      onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    is_dm: boolean('is_dm').notNull().default(false),
    is_default: boolean('is_default').notNull().default(false),
    created_by: uuid('created_by')
      .notNull()
      .references(() => users.id),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Unique channel name per project — partial index restricted to non-DM rows
    projectNameUnique: uniqueIndex('chat_channels_project_name_unique')
      .on(table.workspace_id, table.project_id, table.name)
      .where(sql`${table.is_dm} = false`),
    workspaceIdx: index('chat_channels_workspace_idx').on(table.workspace_id),
  }),
)

// ─── Channel Members (DMs + future private channels) ──────────

export const chatChannelMembers = pgTable(
  'chat_channel_members',
  {
    channel_id: uuid('channel_id')
      .notNull()
      .references(() => chatChannels.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    last_read_at: timestamp('last_read_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.channel_id, table.user_id] }),
    userIdx: index('chat_channel_members_user_idx').on(table.user_id),
  }),
)

// ─── Messages ──────────────────────────────────────────────────

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspace_id: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    channel_id: uuid('channel_id')
      .notNull()
      .references(() => chatChannels.id, { onDelete: 'cascade' }),
    author_id: uuid('author_id')
      .notNull()
      .references(() => users.id),
    body: text('body').notNull(),
    edited_at: timestamp('edited_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    channelCreatedIdx: index('chat_messages_channel_created_idx').on(
      table.channel_id,
      table.created_at,
    ),
  }),
)

// ─── Reactions (Phase D) ───────────────────────────────────────

export const chatReactions = pgTable(
  'chat_reactions',
  {
    message_id: uuid('message_id')
      .notNull()
      .references(() => chatMessages.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: text('emoji').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.message_id, table.user_id, table.emoji] }),
  }),
)

// ─── Attachments (Phase E) ─────────────────────────────────────

export const chatAttachments = pgTable(
  'chat_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    message_id: uuid('message_id')
      .notNull()
      .references(() => chatMessages.id, { onDelete: 'cascade' }),
    storage_path: text('storage_path').notNull(),
    file_name: text('file_name').notNull(),
    mime_type: text('mime_type').notNull(),
    size_bytes: integer('size_bytes').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    messageIdx: index('chat_attachments_message_idx').on(table.message_id),
  }),
)
