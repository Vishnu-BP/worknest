/**
 * @file useMessages.ts — Paginated channel messages (infinite query)
 * @module client/features/chat/hooks
 *
 * GET /api/workspaces/:slug/channels/:channelId/messages?cursor&limit
 *
 * The server returns messages in reverse-chronological order (newest first)
 * along with a `nextCursor` (ISO timestamp of the oldest message in the page).
 * Passing that cursor on the next request returns older messages. The UI
 * reverses the array when rendering so the newest sits at the bottom.
 *
 * @related server/src/modules/chat-message/chat-message.routes.ts
 */

import { useInfiniteQuery } from '@tanstack/react-query'

import type { MessageWithAuthor } from '@worknest/shared'

import { api, chatKeys } from '@core/lib'

interface MessagesPage {
  readonly data: MessageWithAuthor[]
  readonly nextCursor: string | null
}

export function useMessages(
  slug: string | undefined,
  channelId: string | undefined,
) {
  return useInfiniteQuery({
    queryKey: chatKeys.messagesByChannel(channelId ?? ''),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set('cursor', pageParam)
      const qs = params.toString()
      return api.get<MessagesPage>(
        `/api/workspaces/${slug}/channels/${channelId}/messages${qs ? `?${qs}` : ''}`,
      )
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0,
    enabled: !!slug && !!channelId,
  })
}
