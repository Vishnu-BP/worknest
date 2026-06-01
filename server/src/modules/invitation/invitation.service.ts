/**
 * @file invitation.service.ts — Invitation business logic
 * @module server/modules/invitation
 *
 * Manages workspace invitations with secure tokens and 48-hour expiry.
 * Handles the full lifecycle: create → send email → accept/revoke.
 * Accept is a transaction: creates member row + updates invitation status.
 *
 * Security: tokens are crypto.randomUUID (unpredictable), single-use,
 * and validated against the authenticated user's email on accept.
 *
 * @dependencies crypto, drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/invitation/invitation.routes.ts
 */

import crypto from 'crypto'
import { and, eq, gt } from 'drizzle-orm'

import { db } from '../../core/db'
import { invitations, members, users } from '../../core/db/schema'
import { badRequest, conflict, createLogger, forbidden, notFound } from '../../core/utils'

import type { Invitation, Role } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('MAIL')

// ─── Constants ─────────────────────────────────────────────────

const INVITATION_EXPIRY_HOURS = 48

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates an invitation with a secure token and 48-hour expiry.
 * Validates: not already invited (pending), not already a member.
 */
export async function create(
  workspaceId: string,
  email: string,
  role: Role,
  inviterId: string,
): Promise<Invitation> {
  log.info('Creating invitation', { email, role, workspaceId })

  // Check for existing pending invitation
  const [existing] = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.workspace_id, workspaceId),
        eq(invitations.email, email),
        eq(invitations.status, 'pending'),
      ),
    )
    .limit(1)

  if (existing) {
    throw conflict('A pending invitation already exists for this email')
  }

  // Check if already a member (via users table + members)
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser) {
    const [existingMember] = await db
      .select({ id: members.id })
      .from(members)
      .where(
        and(
          eq(members.workspace_id, workspaceId),
          eq(members.user_id, existingUser.id),
        ),
      )
      .limit(1)

    if (existingMember) {
      throw conflict('This user is already a member of the workspace')
    }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000)

  const [invitation] = await db
    .insert(invitations)
    .values({
      workspace_id: workspaceId,
      email,
      role,
      token,
      invited_by: inviterId,
      status: 'pending',
      expires_at: expiresAt,
    })
    .returning()

  if (!invitation) throw new Error('Failed to create invitation')

  log.info('Invitation created', { id: invitation.id, email })
  return mapToInvitation(invitation)
}

/**
 * Lists pending invitations for a workspace (non-expired only).
 */
export async function listPending(workspaceId: string): Promise<Invitation[]> {
  const rows = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.workspace_id, workspaceId),
        eq(invitations.status, 'pending'),
        gt(invitations.expires_at, new Date()),
      ),
    )
    .orderBy(invitations.created_at)

  return rows.map(mapToInvitation)
}

/**
 * Accepts an invitation by token. Transaction: create member + update status.
 * Validates: token exists, pending, not expired, email matches user.
 */
export async function accept(
  token: string,
  userId: string,
  userEmail: string,
): Promise<void> {
  log.info('Accepting invitation', { token: token.slice(0, 8) + '...' })

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1)

  if (!invitation) {
    throw notFound('Invitation not found')
  }

  if (invitation.status !== 'pending') {
    throw badRequest(`This invitation has been ${invitation.status}`)
  }

  if (invitation.expires_at < new Date()) {
    // Auto-update expired status
    await db
      .update(invitations)
      .set({ status: 'expired' })
      .where(eq(invitations.id, invitation.id))
    throw badRequest('This invitation has expired')
  }

  if (invitation.email !== userEmail) {
    throw forbidden('This invitation was sent to a different email address')
  }

  // Transaction: create member + update invitation
  await db.transaction(async (tx) => {
    await tx.insert(members).values({
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
    })

    await tx
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id))
  })

  log.info('Invitation accepted', { workspaceId: invitation.workspace_id, userId })
}

/**
 * Revokes a pending invitation. Only owner/admin can revoke.
 */
export async function revoke(
  invitationId: string,
  workspaceId: string,
): Promise<void> {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.id, invitationId),
        eq(invitations.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!invitation) throw notFound('Invitation not found')

  if (invitation.status !== 'pending') {
    throw badRequest('Only pending invitations can be revoked')
  }

  await db
    .update(invitations)
    .set({ status: 'revoked' })
    .where(eq(invitations.id, invitationId))

  log.info('Invitation revoked', { invitationId })
}

// ─── Mapper ────────────────────────────────────────────────────

function mapToInvitation(row: typeof invitations.$inferSelect): Invitation {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    email: row.email,
    role: row.role,
    token: row.token,
    invited_by: row.invited_by,
    status: row.status,
    expires_at: row.expires_at.toISOString(),
    created_at: row.created_at.toISOString(),
  }
}
