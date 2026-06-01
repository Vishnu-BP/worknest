/**
 * @file chat-message.service.ts — Chat message business logic
 * @module server/modules/chat-message
 *
 * CRUD for messages inside a channel. Cursor-based pagination orders
 * messages newest-to-oldest; the cursor is the `created_at` ISO string
 * of the oldest message already loaded — page two returns messages
 * older than that cursor. Edits are author-only, deletions are author
 * OR admin/owner (mirroring the comment module).
 *
 * @dependencies drizzle-orm, server/src/core/db
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { and, desc, eq, lt } from 'drizzle-orm'

import { db } from '../../core/db'
import {
  chatMessages,
  users,
} from '../../core/db/schema'
import { createLogger, forbidden, notFound } from '../../core/utils'

import * as channelService from '../chat-channel/chat-channel.service'

import type {
  ChatMessage,
  CreateMessageInput,
  MessageWithAuthor,
  Role,
  UpdateMessageInput,
} from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Posts a message to a channel. The author check happens in the route
 * via authMiddleware; channel access is verified here for DMs.
 */
export async function create(
  workspaceId: string,
  channelId: string,
  userId: string,
  input: CreateMessageInput,
): Promise<MessageWithAuthor> {
  await channelService.assertCanAccess(channelId, workspaceId, userId)

  const [row] = await db
    .insert(chatMessages)
    .values({
      workspace_id: workspaceId,
      channel_id: channelId,
      author_id: userId,
      body: input.body,
    })
    .returning()

  if (!row) throw new Error('Failed to create message')

  log.debug('Message posted', { id: row.id, channelId })
  return hydrateAuthor(row)
}

/**
 * Lists messages in a channel, newest-first, cursor-paginated.
 * `cursor` is the ISO timestamp of the oldest message already loaded —
 * messages strictly older than the cursor are returned.
 */
export async function listByChannel(
  workspaceId: string,
  channelId: string,
  userId: string,
  options: { cursor?: string; limit?: number } = {},
): Promise<{ messages: MessageWithAuthor[]; nextCursor: string | null }> {
  await channelService.assertCanAccess(channelId, workspaceId, userId)

  const limit = Math.min(options.limit ?? 50, 100)
  const cursorDate = options.cursor ? new Date(options.cursor) : null

  const conditions = [
    eq(chatMessages.workspace_id, workspaceId),
    eq(chatMessages.channel_id, channelId),
  ]
  if (cursorDate) {
    conditions.push(lt(chatMessages.created_at, cursorDate))
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      workspace_id: chatMessages.workspace_id,
      channel_id: chatMessages.channel_id,
      author_id: chatMessages.author_id,
      body: chatMessages.body,
      edited_at: chatMessages.edited_at,
      created_at: chatMessages.created_at,
      author_email: users.email,
      author_full_name: users.full_name,
      author_avatar_url: users.avatar_url,
    })
    .from(chatMessages)
    .innerJoin(users, eq(users.id, chatMessages.author_id))
    .where(and(...conditions))
    .orderBy(desc(chatMessages.created_at))
    .limit(limit + 1) // fetch one extra to detect more

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? page[page.length - 1]!.created_at.toISOString() : null

  const messages = page.map((r) => ({
    id: r.id,
    workspace_id: r.workspace_id,
    channel_id: r.channel_id,
    author_id: r.author_id,
    body: r.body,
    edited_at: r.edited_at ? r.edited_at.toISOString() : null,
    created_at: r.created_at.toISOString(),
    author: {
      id: r.author_id,
      email: r.author_email,
      full_name: r.author_full_name,
      avatar_url: r.author_avatar_url,
    },
  }))

  return { messages, nextCursor }
}

/** Updates a message body. Only the author can edit. Sets edited_at. */
export async function update(
  messageId: string,
  workspaceId: string,
  userId: string,
  input: UpdateMessageInput,
): Promise<MessageWithAuthor> {
  const [existing] = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!existing) throw notFound('Message not found')
  if (existing.author_id !== userId) {
    throw forbidden('Only the message author can edit this message')
  }

  const [row] = await db
    .update(chatMessages)
    .set({ body: input.body, edited_at: new Date() })
    .where(eq(chatMessages.id, messageId))
    .returning()

  if (!row) throw notFound('Message not found')
  return hydrateAuthor(row)
}

/** Deletes a message. Author OR admin/owner can delete. */
export async function deleteMessage(
  messageId: string,
  workspaceId: string,
  userId: string,
  userRole: Role,
): Promise<ChatMessage> {
  const [existing] = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!existing) throw notFound('Message not found')

  const isAuthor = existing.author_id === userId
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'
  if (!isAuthor && !isAdminOrOwner) {
    throw forbidden('Only the author or workspace admins can delete this message')
  }

  await db.delete(chatMessages).where(eq(chatMessages.id, messageId))
  log.info('Message deleted', { messageId })
  return mapToMessage(existing)
}

// ─── Helpers ───────────────────────────────────────────────────

async function hydrateAuthor(
  row: typeof chatMessages.$inferSelect,
): Promise<MessageWithAuthor> {
  const [author] = await db
    .select({
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      avatar_url: users.avatar_url,
    })
    .from(users)
    .where(eq(users.id, row.author_id))
    .limit(1)

  return {
    ...mapToMessage(row),
    author: author ?? {
      id: row.author_id,
      email: '',
      full_name: null,
      avatar_url: null,
    },
  }
}

function mapToMessage(row: typeof chatMessages.$inferSelect): ChatMessage {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    channel_id: row.channel_id,
    author_id: row.author_id,
    body: row.body,
    edited_at: row.edited_at ? row.edited_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
  }
}
