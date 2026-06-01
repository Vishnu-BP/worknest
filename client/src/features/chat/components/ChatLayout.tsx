/**
 * @file ChatLayout.tsx — Two-pane Slack-style chat shell
 * @module client/features/chat/components
 *
 * Left rail: channel list (passed in by caller — project channels for
 * project chat, DM list for workspace DMs).
 * Right pane: header + scrollable messages + composer for the active
 * channel. Renders an empty state when no channel is selected.
 *
 * @related client/src/features/chat/pages/ProjectChatPage.tsx
 */

import type { ChatChannel, Role } from '@worknest/shared'

import { ChannelHeader } from './ChannelHeader'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'

interface ChatLayoutProps {
  slug: string
  sidebar: React.ReactNode
  activeChannel: ChatChannel | undefined
  userRole: Role
}

export function ChatLayout({
  slug,
  sidebar,
  activeChannel,
  userRole,
}: ChatLayoutProps): JSX.Element {
  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border border-border bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface/30 py-3">
        {sidebar}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {activeChannel ? (
          <>
            <ChannelHeader channel={activeChannel} />
            <MessageList
              slug={slug}
              channelId={activeChannel.id}
              userRole={userRole}
            />
            <MessageComposer
              slug={slug}
              channelId={activeChannel.id}
              channelName={activeChannel.name}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-text-dim">
            Select a channel to start chatting.
          </div>
        )}
      </main>
    </div>
  )
}
