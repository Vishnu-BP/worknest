/**
 * @file useDeleteMessage.ts — Delete a message (author or admin/owner)
 * @module client/features/chat/hooks
 *
 * DELETE /api/workspaces/:slug/messages/:id
 * Server enforces author-OR-admin permission. Returns 204 on success.
 *
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api, chatKeys } from '@core/lib'

export function useDeleteMessage(slug: string, channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) =>
      api.delete<void>(`/api/workspaces/${slug}/messages/${messageId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messagesByChannel(channelId),
      })
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete message')
    },
  })
}
