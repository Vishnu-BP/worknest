/**
 * @file chat-channel.service.ts — Chat channel business logic
 * @module server/modules/chat-channel
 *
 * Manages project channels (group chat per project) and DM channels (1:1).
 * A project channel has project_id set and is_dm=false; a DM has
 * project_id=null, is_dm=true, and exactly two rows in chat_channel_members.
 *
 * Visibility:
 *   - Project channels: any workspace member can read (RBAC handles it)
 *   - DM channels: only the two participants (enforced here in the service)
 *
 * @dependencies drizzle-orm, server/src/core/db
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 */

import { and, asc, desc, eq, or, sql } from 'drizzle-orm'

import { db } from '../../core/db'
import {
  chatChannelMembers,
  chatChannels,
  users,
} from '../../core/db/schema'
import { conflict, createLogger, forbidden, notFound } from '../../core/utils'

import type {
  ChatChannel,
  CreateChannelInput,
  DMChannel,
  UpdateChannelInput,
} from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Channel CRUD ──────────────────────────────────────────────

/**
 * Creates a project channel. The unique partial index on
 * (workspace_id, project_id, name) where is_dm=false enforces
 * name uniqueness — the conflict is mapped to a 409.
 */
export async function create(
  workspaceId: string,
  projectId: string,
  userId: string,
  input: CreateChannelInput,
): Promise<ChatChannel> {
  log.info('Creating chat channel', { name: input.name, projectId })

  try {
    const [channel] = await db
      .insert(chatChannels)
      .values({
        workspace_id: workspaceId,
        project_id: projectId,
        name: input.name,
        is_dm: false,
        is_default: false,
        created_by: userId,
      })
      .returning()

    if (!channel) throw new Error('Failed to create channel')
    return mapToChannel(channel)
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw conflict(`Channel "#${input.name}" already exists in this project`)
    }
    throw error
  }
}

/**
 * Auto-creates the default `#general` channel for a newly-created
 * project. Idempotent — if a default channel already exists, returns it.
 * Called by project.service after the project row is inserted.
 */
export async function createDefaultChannel(
  workspaceId: string,
  projectId: string,
  userId: string,
): Promise<ChatChannel> {
  const [existing] = await db
    .select()
    .from(chatChannels)
    .where(
      and(
        eq(chatChannels.project_id, projectId),
        eq(chatChannels.is_default, true),
      ),
    )
    .limit(1)

  if (existing) return mapToChannel(existing)

  const [channel] = await db
    .insert(chatChannels)
    .values({
      workspace_id: workspaceId,
      project_id: projectId,
      name: 'general',
      is_dm: false,
      is_default: true,
      created_by: userId,
    })
    .returning()

  if (!channel) throw new Error('Failed to create default channel')
  log.info('Default channel created', { projectId, channelId: channel.id })
  return mapToChannel(channel)
}

/** Lists project channels ordered by created_at asc (default first). */
export async function listByProject(
  workspaceId: string,
  projectId: string,
): Promise<ChatChannel[]> {
  const rows = await db
    .select()
    .from(chatChannels)
    .where(
      and(
        eq(chatChannels.workspace_id, workspaceId),
        eq(chatChannels.project_id, projectId),
        eq(chatChannels.is_dm, false),
      ),
    )
    .orderBy(desc(chatChannels.is_default), asc(chatChannels.created_at))

  return rows.map(mapToChannel)
}

export async function getById(
  channelId: string,
  workspaceId: string,
): Promise<ChatChannel> {
  const [row] = await db
    .select()
    .from(chatChannels)
    .where(
      and(eq(chatChannels.id, channelId), eq(chatChannels.workspace_id, workspaceId)),
    )
    .limit(1)

  if (!row) throw notFound('Channel not found')
  return mapToChannel(row)
}

/**
 * Asserts the user can read the channel. Project channels are open to
 * any workspace member (RBAC layer already validated membership).
 * DMs require the user to be in chat_channel_members.
 */
export async function assertCanAccess(
  channelId: string,
  workspaceId: string,
  userId: string,
): Promise<ChatChannel> {
  const channel = await getById(channelId, workspaceId)

  if (channel.is_dm) {
    const [membership] = await db
      .select()
      .from(chatChannelMembers)
      .where(
        and(
          eq(chatChannelMembers.channel_id, channelId),
          eq(chatChannelMembers.user_id, userId),
        ),
      )
      .limit(1)

    if (!membership) {
      throw forbidden('You are not a participant of this DM')
    }
  }

  return channel
}

/** Renames a channel. Default `#general` cannot be renamed. */
export async function update(
  channelId: string,
  workspaceId: string,
  input: UpdateChannelInput,
): Promise<ChatChannel> {
  const existing = await getById(channelId, workspaceId)

  if (existing.is_default) {
    throw forbidden('The default #general channel cannot be renamed')
  }

  if (existing.is_dm) {
    throw forbidden('DM channels cannot be renamed')
  }

  try {
    const [row] = await db
      .update(chatChannels)
      .set({ name: input.name })
      .where(eq(chatChannels.id, channelId))
      .returning()

    if (!row) throw notFound('Channel not found')
    return mapToChannel(row)
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw conflict(`Channel "#${input.name}" already exists in this project`)
    }
    throw error
  }
}

/** Deletes a non-default channel. CASCADE cleans up messages. */
export async function deleteChannel(
  channelId: string,
  workspaceId: string,
): Promise<void> {
  const existing = await getById(channelId, workspaceId)

  if (existing.is_default) {
    throw forbidden('The default #general channel cannot be deleted')
  }

  if (existing.is_dm) {
    throw forbidden('DM channels cannot be deleted')
  }

  await db.delete(chatChannels).where(eq(chatChannels.id, channelId))
  log.info('Channel deleted', { channelId })
}

// ─── DMs ───────────────────────────────────────────────────────

/**
 * Returns the user's DM channels in the workspace, with the other
 * participant's profile pre-joined for direct rendering.
 */
export async function listDMsForUser(
  workspaceId: string,
  userId: string,
): Promise<DMChannel[]> {
  const rows = await db
    .select({
      id: chatChannels.id,
      workspace_id: chatChannels.workspace_id,
      project_id: chatChannels.project_id,
      name: chatChannels.name,
      is_dm: chatChannels.is_dm,
      is_default: chatChannels.is_default,
      created_by: chatChannels.created_by,
      created_at: chatChannels.created_at,
      other_user_id: users.id,
      other_user_email: users.email,
      other_user_full_name: users.full_name,
      other_user_avatar_url: users.avatar_url,
    })
    .from(chatChannels)
    .innerJoin(
      chatChannelMembers,
      and(
        eq(chatChannelMembers.channel_id, chatChannels.id),
        eq(chatChannelMembers.user_id, userId),
      ),
    )
    // Join the OTHER member to get the counterpart's profile
    .innerJoin(
      sql`${chatChannelMembers} AS other_member`,
      sql`other_member.channel_id = ${chatChannels.id} AND other_member.user_id != ${userId}`,
    )
    .innerJoin(users, sql`${users.id} = other_member.user_id`)
    .where(
      and(
        eq(chatChannels.workspace_id, workspaceId),
        eq(chatChannels.is_dm, true),
      ),
    )
    .orderBy(desc(chatChannels.created_at))

  return rows.map((r) => ({
    id: r.id,
    workspace_id: r.workspace_id,
    project_id: r.project_id,
    name: r.name,
    is_dm: r.is_dm,
    is_default: r.is_default,
    created_by: r.created_by,
    created_at: r.created_at.toISOString(),
    other_user: {
      id: r.other_user_id,
      email: r.other_user_email,
      full_name: r.other_user_full_name,
      avatar_url: r.other_user_avatar_url,
    },
  }))
}

/**
 * Idempotently fetches or creates a 1:1 DM between two users in a
 * workspace. The lookup is symmetric — `getOrCreateDM(A, B) === getOrCreateDM(B, A)`.
 */
export async function getOrCreateDM(
  workspaceId: string,
  userIdA: string,
  userIdB: string,
): Promise<ChatChannel> {
  if (userIdA === userIdB) {
    throw forbidden('You cannot start a DM with yourself')
  }

  return db.transaction(async (tx) => {
    // Find an existing DM that has BOTH users as members
    const existingRows = await tx
      .select({ channel_id: chatChannelMembers.channel_id })
      .from(chatChannelMembers)
      .innerJoin(
        chatChannels,
        and(
          eq(chatChannels.id, chatChannelMembers.channel_id),
          eq(chatChannels.workspace_id, workspaceId),
          eq(chatChannels.is_dm, true),
        ),
      )
      .where(
        or(
          eq(chatChannelMembers.user_id, userIdA),
          eq(chatChannelMembers.user_id, userIdB),
        ),
      )

    const counts = new Map<string, number>()
    for (const row of existingRows) {
      counts.set(row.channel_id, (counts.get(row.channel_id) ?? 0) + 1)
    }
    const matchedId = [...counts.entries()].find(([, n]) => n === 2)?.[0]

    if (matchedId) {
      const [channel] = await tx
        .select()
        .from(chatChannels)
        .where(eq(chatChannels.id, matchedId))
        .limit(1)
      if (channel) return mapToChannel(channel)
    }

    // Create new DM
    const [channel] = await tx
      .insert(chatChannels)
      .values({
        workspace_id: workspaceId,
        project_id: null,
        name: 'dm',
        is_dm: true,
        is_default: false,
        created_by: userIdA,
      })
      .returning()

    if (!channel) throw new Error('Failed to create DM channel')

    await tx.insert(chatChannelMembers).values([
      { channel_id: channel.id, user_id: userIdA },
      { channel_id: channel.id, user_id: userIdB },
    ])

    log.info('DM created', { channelId: channel.id, userIdA, userIdB })
    return mapToChannel(channel)
  })
}

// ─── Mapper ────────────────────────────────────────────────────

function mapToChannel(row: typeof chatChannels.$inferSelect): ChatChannel {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    project_id: row.project_id,
    name: row.name,
    is_dm: row.is_dm,
    is_default: row.is_default,
    created_by: row.created_by,
    created_at: row.created_at.toISOString(),
  }
}

