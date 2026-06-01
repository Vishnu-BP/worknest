/**
 * @file ProjectChatPage.tsx — Chat tab for a single project
 * @module client/features/chat/pages
 *
 * Route: /w/:slug/projects/:projectId/chat[/:channelId]
 *
 * Loads the project's channels, auto-selects the URL channel id (or the
 * default #general if none is in the URL), wires realtime cache
 * invalidation for the active channel, and renders the standard
 * ChatLayout with ChannelList as the sidebar.
 *
 * @related client/src/features/chat/components/ChatLayout.tsx
 */

import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Skeleton } from '@core/components/ui/skeleton'
import { useAuthStore } from '@core/stores'
import { ROUTES } from '@core/config'

import { useMembers } from '@features/member'

import { useChannels } from '../hooks/useChannels'
import { useChatRealtime } from '../hooks/useChatRealtime'
import { ChannelList } from '../components/ChannelList'
import { ChatLayout } from '../components/ChatLayout'

export function ProjectChatPage(): JSX.Element {
  const { slug, projectId, channelId } = useParams<{
    slug: string
    projectId: string
    channelId?: string
  }>()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: channels, isLoading } = useChannels(slug, projectId)
  const { data: members } = useMembers(slug)

  const currentMember = members?.find((m) => m.user_id === currentUser?.id)
  const userRole = currentMember?.role ?? 'viewer'

  const activeChannel = useMemo(() => {
    if (!channels || channels.length === 0) return undefined
    if (channelId) return channels.find((c) => c.id === channelId)
    return channels.find((c) => c.is_default) ?? channels[0]
  }, [channels, channelId])

  // If the URL has no channel id but channels are loaded, redirect to the
  // resolved active channel so the URL always reflects the visible thread.
  useEffect(() => {
    if (!channelId && activeChannel && slug && projectId) {
      navigate(
        ROUTES.PROJECT_CHAT_CHANNEL(slug, projectId, activeChannel.id),
        { replace: true },
      )
    }
  }, [channelId, activeChannel, slug, projectId, navigate])

  useChatRealtime(activeChannel?.id)

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Skeleton className="h-[60vh] w-56" />
        <Skeleton className="h-[60vh] flex-1" />
      </div>
    )
  }

  return (
    <ChatLayout
      slug={slug!}
      activeChannel={activeChannel}
      userRole={userRole}
      sidebar={
        <ChannelList
          slug={slug!}
          projectId={projectId!}
          activeChannelId={activeChannel?.id}
          onSelect={(id) =>
            navigate(ROUTES.PROJECT_CHAT_CHANNEL(slug!, projectId!, id))
          }
        />
      }
    />
  )
}
