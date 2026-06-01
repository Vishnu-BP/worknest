/**
 * @file useCreateMessage.ts — Post a new message to a channel
 * @module client/features/chat/hooks
 *
 * POST /api/workspaces/:slug/channels/:channelId/messages
 * Invalidates the message list on success — the realtime subscription
 * will also fire the same invalidation for other clients.
 *
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, CreateMessageInput, MessageWithAuthor } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'

export function useCreateMessage(slug: string, channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMessageInput) => {
      const res = await api.post<ApiSuccessResponse<MessageWithAuthor>>(
        `/api/workspaces/${slug}/channels/${channelId}/messages`,
        input,
      )
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messagesByChannel(channelId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })
}
