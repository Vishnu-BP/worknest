/**
 * @file ChannelHeader.tsx — Top bar for the active channel/DM
 * @module client/features/chat/components
 *
 * Shows the channel name (or DM peer name) and basic info. Stays
 * decoupled from the message list so it can later host actions
 * (members, settings, search) without forcing a re-render of the thread.
 *
 * @related client/src/features/chat/components/MessageList.tsx
 */

import { Hash } from 'lucide-react'

import type { ChatChannel } from '@worknest/shared'

interface ChannelHeaderProps {
  channel: ChatChannel
}

export function ChannelHeader({ channel }: ChannelHeaderProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Hash className="h-4 w-4 text-text-dim" />
      <h2 className="text-sm font-semibold text-text">{channel.name}</h2>
      {channel.is_default && (
        <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] uppercase text-text-dim">
          default
        </span>
      )}
    </div>
  )
}
