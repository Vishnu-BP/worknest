/**
 * @file useRevokeInvitation.ts — Revoke pending invitation
 * @module client/features/member/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/invitations/:id.
 * Invalidates invitation list on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/invitation/invitation.routes.ts — DELETE /invitations/:id
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, invitationKeys } from '@core/lib'

export function useRevokeInvitation(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invitationId: string) =>
      api.delete(`/api/workspaces/${slug}/invitations/${invitationId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byWorkspace(slug),
      })
      toast.success('Invitation revoked')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to revoke invitation')
    },
  })
}
