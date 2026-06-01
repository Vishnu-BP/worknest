/**
 * @file useCreateDM.ts — Get-or-create a DM channel with another workspace member
 * @module client/features/chat/hooks
 *
 * POST /api/workspaces/:slug/dms { user_id }
 * Idempotent — returns the existing DM if one already exists between the two
 * users. Invalidates the workspace DM list on success.
 *
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, ChatChannel, CreateDMInput } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'

export function useCreateDM(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateDMInput) => {
      const res = await api.post<ApiSuccessResponse<ChatChannel>>(
        `/api/workspaces/${slug}/dms`,
        input,
      )
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.dms(slug),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to start direct message')
    },
  })
}
