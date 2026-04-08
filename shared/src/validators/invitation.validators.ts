/**
 * @file invitation.validators.ts — Invitation validation schemas
 * @module shared/validators
 *
 * Zod schema for creating workspace invitations. Role is restricted to
 * 'member' or 'viewer' — owner and admin roles cannot be assigned via
 * invitation (admin must be promoted by the owner after joining).
 *
 * @dependencies zod
 * @related server/src/routes/invitation.routes.ts — backend consumer
 */

import { z } from 'zod'

export const createInvitationSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  role: z.enum(['member', 'viewer'], {
    errorMap: () => ({ message: 'Role must be either member or viewer' }),
  }),
})

export type CreateInvitationSchema = z.infer<typeof createInvitationSchema>
