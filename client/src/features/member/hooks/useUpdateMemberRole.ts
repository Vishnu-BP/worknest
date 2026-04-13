/**
 * @file useUpdateMemberRole.ts — Change member role mutation
 * @module client/features/member/hooks
 *
 * TanStack Query mutation for PATCH /api/workspaces/:slug/members/:memberId.
 * Updates a member's role (with server-side guards for owner protection).
 * Invalidates the member list cache on success.
 *
 * @dependencies @tanstack/react-query, client/src/core/lib
 * @related server/src/modules/member/member.routes.ts — PATCH /members/:memberId
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, MemberWithUser, Role } from '@worknest/shared'

import { api, memberKeys } from '@core/lib'

interface UpdateMemberRoleParams {
  slug: string
  memberId: string
  role: Role
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slug, memberId, role }: UpdateMemberRoleParams) =>
      api.patch<ApiSuccessResponse<MemberWithUser>>(
        `/api/workspaces/${slug}/members/${memberId}`,
        { role },
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.byWorkspace(variables.slug),
      })
      toast.success('Member role updated')
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update member role')
    },
  })
}
