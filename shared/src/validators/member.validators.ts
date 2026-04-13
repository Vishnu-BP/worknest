/**
 * @file member.validators.ts — Member role validation schemas
 * @module shared/validators
 *
 * Zod schema for updating a workspace member's role.
 * Used by PATCH /api/workspaces/:slug/members/:memberId.
 *
 * @dependencies zod
 * @related server/src/modules/member/member.routes.ts — backend consumer
 */

import { z } from 'zod'

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be owner, admin, member, or viewer' }),
  }),
})

export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>
