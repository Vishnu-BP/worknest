/**
 * @file ChannelItem.tsx — Single channel row in the chat sidebar
 * @module client/features/chat/components
 *
 * Pure presentational. Highlights the active channel and shows a hash
 * prefix. Intended to be rendered inside <ChannelList>.
 *
 * @related client/src/features/chat/components/ChannelList.tsx
 */

import { Hash } from 'lucide-react'

import { cn } from '@core/lib'

interface ChannelItemProps {
  name: string
  isActive: boolean
  onClick: () => void
}

export function ChannelItem({ name, isActive, onClick }: ChannelItemProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        isActive
          ? 'bg-primary/15 text-text'
          : 'text-text-muted hover:bg-surface hover:text-text',
      )}
    >
      <Hash className="h-3.5 w-3.5 shrink-0 text-text-dim" />
      <span className="truncate">{name}</span>
    </button>
  )
}
