/**
 * @file chat.types.ts — Chat entity types
 * @module shared/types
 *
 * Defines channels, messages, reactions, and attachments shared between
 * client and server. workspace_id is denormalized on every row for fast
 * RLS scope checks. A channel either belongs to a project (project
 * channel) or is a 1:1 DM (is_dm=true, project_id=null).
 *
 * @dependencies none
 * @related shared/src/validators/chat.validators.ts — Zod input shapes
 */

// ─── Channels ──────────────────────────────────────────────────

export interface ChatChannel {
  readonly id: string
  readonly workspace_id: string
  readonly project_id: string | null
  readonly name: string
  readonly is_dm: boolean
  readonly is_default: boolean
  readonly created_by: string
  readonly created_at: string
}

/**
 * A DM channel listed for the current user, with the other participant's
 * profile pre-joined so the client can render "DM with X" without a
 * follow-up request.
 */
export interface DMChannel extends ChatChannel {
  readonly other_user: {
    readonly id: string
    readonly email: string
    readonly full_name: string | null
    readonly avatar_url: string | null
  }
}

export interface CreateChannelInput {
  readonly name: string
}

export interface CreateDMInput {
  readonly user_id: string
}

export interface UpdateChannelInput {
  readonly name: string
}

// ─── Messages ──────────────────────────────────────────────────

export interface ChatMessage {
  readonly id: string
  readonly workspace_id: string
  readonly channel_id: string
  readonly author_id: string
  readonly body: string
  readonly edited_at: string | null
  readonly created_at: string
}

/**
 * Message returned by listByChannel — author profile is joined so the
 * client can render the avatar and name without a member lookup.
 */
export interface MessageWithAuthor extends ChatMessage {
  readonly author: {
    readonly id: string
    readonly email: string
    readonly full_name: string | null
    readonly avatar_url: string | null
  }
}

export interface CreateMessageInput {
  readonly body: string
}

export interface UpdateMessageInput {
  readonly body: string
}
