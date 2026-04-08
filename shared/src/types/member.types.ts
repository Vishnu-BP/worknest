/**
 * @file member.types.ts — Member entity types
 * @module shared/types
 *
 * Defines workspace membership. The members table is the join between
 * users and workspaces, carrying the role that determines permissions.
 * MemberWithUser is the common query shape when displaying member lists.
 *
 * @dependencies shared/src/types/enums.ts — Role
 * @related shared/src/types/user.types.ts, shared/src/types/workspace.types.ts
 */

import type { Role } from './enums'

export interface Member {
  readonly id: string
  readonly workspace_id: string
  readonly user_id: string
  readonly role: Role
  readonly joined_at: string
}

/** Member joined with user profile — used in member list UI */
export interface MemberWithUser extends Member {
  readonly user: {
    readonly id: string
    readonly email: string
    readonly full_name: string | null
    readonly avatar_url: string | null
  }
}

export interface UpdateMemberRoleInput {
  readonly role: Role
}
