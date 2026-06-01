/**
 * @file useCreateInvitation.ts — Send invitation mutation
 * @module client/features/member/hooks
 *
 * TanStack Query mutation for POST /api/workspaces/:slug/invitations.
 * Creates invitation + sends email. Invalidates invitation list on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/invitation/invitation.routes.ts — POST /invitations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateInvitationInput, Invitation } from '@worknest/shared'

import { api, invitationKeys } from '@core/lib'

export function useCreateInvitation(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateInvitationInput) =>
      api.post<ApiSuccessResponse<Invitation>>(
        `/api/workspaces/${slug}/invitations`,
        input,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.byWorkspace(slug),
      })
      toast.success('Invitation sent')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })
}
