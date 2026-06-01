/**
 * @file MessageList.tsx — Scrollable message thread for the active channel
 * @module client/features/chat/components
 *
 * Pulls paginated pages from useMessages (newest-first) and renders them
 * oldest-at-top so the latest message sits at the bottom. A "Load older
 * messages" button at the top fetches the next page when more exist.
 *
 * Realtime invalidation is owned by the parent (ProjectChatPage calls
 * useChatRealtime) so MessageList stays purely render-focused.
 *
 * @related client/src/features/chat/components/MessageItem.tsx
 */

import { useEffect, useMemo, useRef } from 'react'

import { Button } from '@core/components/ui/button'
import { useAuthStore } from '@core/stores'

import type { MessageWithAuthor, Role } from '@worknest/shared'

import { useMessages } from '../hooks/useMessages'
import { useUpdateMessage } from '../hooks/useUpdateMessage'
import { useDeleteMessage } from '../hooks/useDeleteMessage'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  slug: string
  channelId: string
  userRole: Role
}

export function MessageList({ slug, channelId, userRole }: MessageListProps): JSX.Element {
  const currentUser = useAuthStore((s) => s.currentUser)
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(slug, channelId)
  const updateMessage = useUpdateMessage(slug, channelId)
  const deleteMessage = useDeleteMessage(slug, channelId)

  // Server returns newest first per page; flatten then reverse so the
  // oldest message is at the top and the newest sits at the bottom.
  const orderedMessages = useMemo<MessageWithAuthor[]>(() => {
    const all = data?.pages.flatMap((p) => p.data) ?? []
    return [...all].reverse()
  }, [data])

  const canDeleteAny = userRole === 'owner' || userRole === 'admin'
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when a new message arrives at the tail of the list.
  // Only triggers on length change (not on history loads from the top).
  const lastLengthRef = useRef(0)
  useEffect(() => {
    const len = orderedMessages.length
    if (len > lastLengthRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    lastLengthRef.current = len
  }, [orderedMessages.length])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {hasNextPage && (
        <div className="flex justify-center py-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-xs text-text-dim"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="px-4 py-6 text-xs text-text-dim">Loading messages...</p>
      ) : orderedMessages.length === 0 ? (
        <p className="px-4 py-6 text-xs text-text-dim">No messages yet. Say hello.</p>
      ) : (
        <div className="py-2">
          {orderedMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isAuthor={message.author_id === currentUser?.id}
              canDelete={message.author_id === currentUser?.id || canDeleteAny}
              onUpdate={(body) => updateMessage.mutate({ messageId: message.id, input: { body } })}
              onDelete={() => deleteMessage.mutate(message.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
