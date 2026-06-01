/**
 * @file useCreateChannel.ts — Create channel mutation
 * @module client/features/chat/hooks
 *
 * POST /api/workspaces/:slug/projects/:projectId/channels
 * Invalidates the project's channel list on success.
 *
 * @related server/src/modules/chat-channel/chat-channel.routes.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, ChatChannel, CreateChannelInput } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'

export function useCreateChannel(slug: string, projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateChannelInput) => {
      const res = await api.post<ApiSuccessResponse<ChatChannel>>(
        `/api/workspaces/${slug}/projects/${projectId}/channels`,
        input,
      )
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.channelsByProject(projectId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create channel')
    },
  })
}
