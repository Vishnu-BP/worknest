/**
 * @file useAcceptInvitation.ts — Accept invitation by token
 * @module client/features/member/hooks
 *
 * TanStack Query mutation for POST /api/invitations/accept.
 * Not workspace-scoped — invitee may not be a member yet.
 * Invalidates workspace + member lists on success.
 *
 * @dependencies @tanstack/react-query, sonner, client/src/core/lib
 * @related server/src/modules/invitation/invitation.routes.ts — POST /invitations/accept
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, workspaceKeys, memberKeys } from '@core/lib'

export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) =>
      api.post('/api/invitations/accept', { token }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      queryClient.invalidateQueries({ queryKey: memberKeys.all })
      toast.success('Invitation accepted! Welcome to the workspace.')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to accept invitation')
    },
  })
}
