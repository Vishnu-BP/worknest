/**
 * @file workspace.service.ts — Workspace business logic
 * @module server/modules/workspace
 *
 * Handles workspace CRUD operations including transactional creation
 * (workspace + owner member in one atomic operation) and slug generation
 * with uniqueness guarantee. This service has NO HTTP/Express awareness.
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/workspace/workspace.routes.ts — calls these functions
 */

import { eq, inArray } from 'drizzle-orm'

import { db } from '../../core/db'
import { members, users, workspaces } from '../../core/db/schema'
import { createLogger, generateSlug, notFound } from '../../core/utils'

import type { CreateWorkspaceInput, MemberWithUser, UpdateWorkspaceInput, Workspace } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates a new workspace with the requesting user as the owner.
 * Uses a transaction to ensure both the workspace and the owner
 * member row are created atomically — both succeed or both fail.
 */
export async function create(
  userId: string,
  input: CreateWorkspaceInput,
): Promise<{ workspace: Workspace; member: MemberWithUser }> {
  log.info('Creating workspace', { name: input.name, userId })

  const slug = await generateSlug(input.name)

  // Transaction: create workspace + owner member atomically
  const result = await db.transaction(async (tx) => {
    // Insert workspace
    const [workspace] = await tx
      .insert(workspaces)
      .values({
        name: input.name,
        slug,
        owner_id: userId,
      })
      .returning()

    if (!workspace) {
      throw new Error('Failed to create workspace')
    }

    // Insert owner member
    const [member] = await tx
      .insert(members)
      .values({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner',
      })
      .returning()

    if (!member) {
      throw new Error('Failed to create owner member')
    }

    return { workspace, member }
  })

  // Fetch user profile for the MemberWithUser response
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      avatar_url: users.avatar_url,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  log.info('Workspace created', { id: result.workspace.id, slug })

  return {
    workspace: mapToWorkspace(result.workspace),
    member: mapToMemberWithUser(result.member, user!),
  }
}

/**
 * Retrieves a workspace by its URL slug.
 */
export async function getBySlug(slug: string): Promise<Workspace> {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1)

  if (!workspace) {
    throw notFound('Workspace not found')
  }

  return mapToWorkspace(workspace)
}

/**
 * Lists all workspaces the user is a member of, ordered by creation date.
 */
export async function listForUser(userId: string): Promise<Workspace[]> {
  // Get workspace IDs the user belongs to
  const memberRows = await db
    .select({ workspace_id: members.workspace_id })
    .from(members)
    .where(eq(members.user_id, userId))

  if (memberRows.length === 0) return []

  const workspaceIds = memberRows.map((m) => m.workspace_id)

  const rows = await db
    .select()
    .from(workspaces)
    .where(inArray(workspaces.id, workspaceIds))
    .orderBy(workspaces.created_at)

  return rows.map(mapToWorkspace)
}

/**
 * Updates workspace fields (name, logo_url). Only provided fields
 * are changed — undefined fields are left as-is.
 */
export async function update(
  workspaceId: string,
  input: UpdateWorkspaceInput,
): Promise<Workspace> {
  log.debug('Updating workspace', { workspaceId, fields: Object.keys(input) })

  const [workspace] = await db
    .update(workspaces)
    .set(input)
    .where(eq(workspaces.id, workspaceId))
    .returning()

  if (!workspace) {
    throw notFound('Workspace not found')
  }

  return mapToWorkspace(workspace)
}

/**
 * Deletes a workspace. CASCADE foreign keys automatically remove
 * all related data (members, projects, tasks, comments, labels,
 * invitations, activity_log).
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  log.info('Deleting workspace', { workspaceId })

  const [deleted] = await db
    .delete(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .returning({ id: workspaces.id })

  if (!deleted) {
    throw notFound('Workspace not found')
  }
}

// ─── Mappers ───────────────────────────────────────────────────

/** Maps a Drizzle workspace row to the shared Workspace type */
function mapToWorkspace(row: typeof workspaces.$inferSelect): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    owner_id: row.owner_id,
    logo_url: row.logo_url,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}

/** Maps a Drizzle member row + user data to MemberWithUser */
function mapToMemberWithUser(
  member: typeof members.$inferSelect,
  user: { id: string; email: string; full_name: string; avatar_url: string | null },
): MemberWithUser {
  return {
    id: member.id,
    workspace_id: member.workspace_id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at.toISOString(),
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    },
  }
}
