/**
 * @file useRemoveMember.ts — Remove member from workspace mutation
 * @module client/features/member/hooks
 *
 * TanStack Query mutation for DELETE /api/workspaces/:slug/members/:memberId.
 * Removes a member from the workspace (with server-side owner guard).
 * Invalidates the member list cache on success.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/member/member.routes.ts — DELETE /members/:memberId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, memberKeys } from '@core/lib'

interface RemoveMemberParams {
  slug: string
  memberId: string
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, memberId }: RemoveMemberParams) =>
      api.delete(`/api/workspaces/${slug}/members/${memberId}`),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.byWorkspace(variables.slug),
      })
      toast.success('Member removed')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })
}
