/**
 * @file workspace.types.ts — Workspace entity types
 * @module shared/types
 *
 * Defines the Workspace entity — the top-level multi-tenancy container.
 * Every other entity (except users) belongs to a workspace via workspace_id.
 *
 * @dependencies none
 * @related shared/src/types/member.types.ts — workspace membership
 */

export interface Workspace {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly owner_id: string
  readonly logo_url: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface CreateWorkspaceInput {
  readonly name: string
}

export interface UpdateWorkspaceInput {
  readonly name?: string
  readonly logo_url?: string | null
}
