/**
 * @file RealtimeProvider.tsx — Supabase Realtime subscription manager
 * @module client/core/components/common
 *
 * Subscribes to Supabase Realtime changes on the tasks table for
 * the active project. When another user creates, updates, or deletes
 * a task, this provider invalidates the TanStack Query cache so the
 * board silently refetches with the latest data.
 *
 * Graceful degradation: if Realtime fails, the board still works
 * from cache. Data refreshes on window focus via TanStack Query's
 * refetchOnWindowFocus (per CLAUDE.md error resilience).
 *
 * Cleanup: unsubscribes on unmount (navigation away from project)
 * to stay within Supabase's concurrent connection limits (~200).
 *
 * @dependencies @supabase/supabase-js, @tanstack/react-query
 * @related docs/kanban-architecture.md — real-time sync specification
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from '@supabase/supabase-js'

import { supabase, createLogger, taskKeys } from '@core/lib'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('WS')

// ─── Component ─────────────────────────────────────────────────

interface RealtimeProviderProps {
  projectId: string
  children: React.ReactNode
}

export function RealtimeProvider({ projectId, children }: RealtimeProviderProps): JSX.Element {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channelName = `project:${projectId}:tasks`

    log.debug('Subscribing to Realtime', { channelName })

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          log.debug('Realtime event', { type: payload.eventType, table: 'tasks' })

          // Invalidate task cache — next render triggers background refetch
          queryClient.invalidateQueries({
            queryKey: taskKeys.byProject(projectId),
          })
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          log.info('Realtime connected', { channelName })
        } else if (status === 'CHANNEL_ERROR') {
          // Graceful degradation — board still works from cache
          log.warn('Realtime subscription failed', { channelName, status })
        }
      })

    channelRef.current = channel

    // Cleanup: unsubscribe when navigating away from this project
    return () => {
      log.debug('Unsubscribing from Realtime', { channelName })
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [projectId, queryClient])

  return <>{children}</>
}
