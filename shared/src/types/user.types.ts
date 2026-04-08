/**
 * @file user.types.ts — User entity types
 * @module shared/types
 *
 * Defines the User entity synced from Supabase Auth via database trigger.
 * Users are the only table without workspace_id — they exist globally.
 *
 * @dependencies none
 * @related shared/src/types/member.types.ts — links users to workspaces
 */

export interface User {
  readonly id: string
  readonly email: string
  readonly full_name: string | null
  readonly avatar_url: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface UpdateProfileInput {
  readonly full_name?: string
  readonly avatar_url?: string | null
}
