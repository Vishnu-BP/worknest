/**
 * @file member.service.ts — Member management business logic
 * @module server/modules/member
 *
 * Handles workspace member operations: listing members with user profiles,
 * updating roles (with owner protection guards), and removing members.
 * Contains all RBAC edge case enforcement documented in auth-and-rbac.md.
 *
 * Critical guards enforced here (not in middleware — these are business rules):
 *   - Cannot modify the workspace owner's role
 *   - Cannot promote anyone to owner (use transfer endpoint instead)
 *   - Admin cannot promote to admin (only owner can create admins)
 *   - Cannot remove the workspace owner
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/member/member.routes.ts — calls these functions
 */

import { and, eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { members, users } from '../../core/db/schema'
import { createLogger, forbidden, notFound } from '../../core/utils'

import type { MemberWithUser, Role } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('RBAC')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Lists all members of a workspace with their user profiles.
 * Returns MemberWithUser[] ordered by join date (earliest first).
 */
export async function listByWorkspace(
  workspaceId: string,
): Promise<MemberWithUser[]> {
  const rows = await db
    .select({
      id: members.id,
      workspace_id: members.workspace_id,
      user_id: members.user_id,
      role: members.role,
      joined_at: members.joined_at,
      user_email: users.email,
      user_full_name: users.full_name,
      user_avatar_url: users.avatar_url,
    })
    .from(members)
    .innerJoin(users, eq(members.user_id, users.id))
    .where(eq(members.workspace_id, workspaceId))
    .orderBy(members.joined_at)

  return rows.map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    user_id: row.user_id,
    role: row.role,
    joined_at: row.joined_at.toISOString(),
    user: {
      id: row.user_id,
      email: row.user_email,
      full_name: row.user_full_name,
      avatar_url: row.user_avatar_url,
    },
  }))
}

/**
 * Updates a member's role with comprehensive guard checks.
 *
 * Guards:
 *   1. Target member must exist in the workspace
 *   2. Cannot modify the workspace owner
 *   3. Cannot promote anyone to 'owner' (use transfer endpoint)
 *   4. Admin requester cannot promote to 'admin' (only owner can)
 */
export async function updateRole(
  memberId: string,
  workspaceId: string,
  newRole: Role,
  requesterRole: Role,
): Promise<MemberWithUser> {
  // Fetch the target member
  const [targetMember] = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.id, memberId),
        eq(members.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!targetMember) {
    throw notFound('Member not found')
  }

  // Guard 1: Cannot modify the workspace owner
  if (targetMember.role === 'owner') {
    throw forbidden('Cannot modify the workspace owner. Use ownership transfer instead.')
  }

  // Guard 2: Cannot promote to owner
  if (newRole === 'owner') {
    throw forbidden('Cannot promote to owner. Use ownership transfer instead.')
  }

  // Guard 3: Admin cannot promote to admin (only owner can create admins)
  if (requesterRole === 'admin' && newRole === 'admin') {
    throw forbidden('Only the workspace owner can promote members to admin.')
  }

  log.info('Updating member role', {
    memberId,
    from: targetMember.role,
    to: newRole,
    workspaceId,
  })

  // Update the role
  const [updated] = await db
    .update(members)
    .set({ role: newRole })
    .where(eq(members.id, memberId))
    .returning()

  if (!updated) {
    throw notFound('Member not found')
  }

  // Fetch user profile for response
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      avatar_url: users.avatar_url,
    })
    .from(users)
    .where(eq(users.id, updated.user_id))
    .limit(1)

  return {
    id: updated.id,
    workspace_id: updated.workspace_id,
    user_id: updated.user_id,
    role: updated.role,
    joined_at: updated.joined_at.toISOString(),
    user: {
      id: user!.id,
      email: user!.email,
      full_name: user!.full_name,
      avatar_url: user!.avatar_url,
    },
  }
}

/**
 * Removes a member from the workspace.
 *
 * Guards:
 *   1. Target member must exist in the workspace
 *   2. Cannot remove the workspace owner
 */
export async function removeMember(
  memberId: string,
  workspaceId: string,
): Promise<void> {
  // Fetch the target member to check their role
  const [targetMember] = await db
    .select({ id: members.id, role: members.role })
    .from(members)
    .where(
      and(
        eq(members.id, memberId),
        eq(members.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!targetMember) {
    throw notFound('Member not found')
  }

  // Guard: Cannot remove the workspace owner
  if (targetMember.role === 'owner') {
    throw forbidden('Cannot remove the workspace owner. Transfer ownership first.')
  }

  log.info('Removing member', { memberId, workspaceId })

  await db
    .delete(members)
    .where(eq(members.id, memberId))
}
