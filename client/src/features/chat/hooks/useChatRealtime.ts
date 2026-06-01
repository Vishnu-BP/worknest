/**
 * @file useChatRealtime.ts — Subscribe to Realtime events for an active channel
 * @module client/features/chat/hooks
 *
 * Opens a Supabase Realtime channel keyed to a single chat channel id.
 * Any insert/update/delete on chat_messages for this channel triggers a
 * cache invalidation so the message list refetches with the latest data.
 *
 * Lifecycle is tied to the calling component — when the user navigates
 * away from the channel the subscription is torn down so we stay within
 * Supabase's concurrent connection budget.
 *
 * @dependencies @supabase/supabase-js, @tanstack/react-query
 * @related client/src/core/components/common/RealtimeProvider.tsx — same pattern, tasks scope
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from '@supabase/supabase-js'

import { supabase, createLogger, chatKeys } from '@core/lib'

const log = createLogger('WS')

export function useChatRealtime(channelId: string | undefined): void {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!channelId) return

    const channelName = `chat:${channelId}`
    log.debug('Subscribing to chat Realtime', { channelName })

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          log.debug('Chat realtime event', { type: payload.eventType })
          queryClient.invalidateQueries({
            queryKey: chatKeys.messagesByChannel(channelId),
          })
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log.info('Chat realtime connected', { channelName })
        } else if (status === 'CHANNEL_ERROR') {
          log.warn('Chat realtime subscription failed', { channelName, status })
        }
      })

    channelRef.current = channel

    return () => {
      log.debug('Unsubscribing from chat Realtime', { channelName })
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [channelId, queryClient])
}
