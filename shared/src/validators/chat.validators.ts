/**
 * @file chat.validators.ts — Chat validation schemas
 * @module shared/validators
 *
 * Zod schemas for chat channel/message/DM creation and edits. Channel
 * names are lowercase slug-like (Slack convention) for predictable URLs
 * and to avoid display-name collisions.
 *
 * @dependencies zod
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { z } from 'zod'

// ─── Channel ───────────────────────────────────────────────────

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, 'Channel name is required')
    .max(50, 'Channel name must be 50 characters or less')
    .regex(
      /^[a-z0-9][a-z0-9-]*$/,
      'Channel name must be lowercase, start with a letter or number, and contain only letters, numbers, or hyphens',
    ),
})

export type CreateChannelSchema = z.infer<typeof createChannelSchema>

export const updateChannelSchema = createChannelSchema

export type UpdateChannelSchema = z.infer<typeof updateChannelSchema>

// ─── DM ────────────────────────────────────────────────────────

export const createDMSchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
})

export type CreateDMSchema = z.infer<typeof createDMSchema>

// ─── Message ───────────────────────────────────────────────────

export const createMessageSchema = z.object({
  body: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be 5000 characters or less'),
})

export type CreateMessageSchema = z.infer<typeof createMessageSchema>

export const updateMessageSchema = createMessageSchema

export type UpdateMessageSchema = z.infer<typeof updateMessageSchema>
