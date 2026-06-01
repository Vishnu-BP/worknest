/**
 * @file useUpdateMessage.ts — Edit an existing message (author only)
 * @module client/features/chat/hooks
 *
 * PATCH /api/workspaces/:slug/messages/:id
 * Server enforces author-only edits and stamps `edited_at`. The UI
 * re-fetches the channel's messages on success.
 *
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiSuccessResponse, MessageWithAuthor, UpdateMessageInput } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'

interface UpdateArgs {
  readonly messageId: string
  readonly input: UpdateMessageInput
}

export function useUpdateMessage(slug: string, channelId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, input }: UpdateArgs) => {
      const res = await api.patch<ApiSuccessResponse<MessageWithAuthor>>(
        `/api/workspaces/${slug}/messages/${messageId}`,
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
      toast.error(error.message || 'Failed to edit message')
    },
  })
}
