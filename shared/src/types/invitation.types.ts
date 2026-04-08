/**
 * @file invitation.types.ts — Invitation entity types
 * @module shared/types
 *
 * Defines workspace invitations with secure tokens and 48-hour expiry.
 * Invitations allow admins/owners to bring new members into a workspace
 * via email with a cryptographically secure, single-use token.
 *
 * @dependencies shared/src/types/enums.ts — Role, InvitationStatus
 * @related shared/src/types/member.types.ts — accepted invitations create members
 */

import type { InvitationStatus, Role } from './enums'

export interface Invitation {
  readonly id: string
  readonly workspace_id: string
  readonly email: string
  readonly role: Role
  readonly token: string
  readonly invited_by: string
  readonly status: InvitationStatus
  readonly expires_at: string
  readonly created_at: string
}

export interface CreateInvitationInput {
  readonly email: string
  readonly role: Extract<Role, 'member' | 'viewer'>
}
