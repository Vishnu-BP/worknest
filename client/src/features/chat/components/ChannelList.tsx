/**
 * @file ChannelList.tsx — Sidebar listing all channels in a project
 * @module client/features/chat/components
 *
 * Loads channels via useChannels and renders them as ChannelItem rows.
 * The "+ New channel" button opens an inline Dialog wrapping
 * CreateChannelDialog. Selecting a channel in the new dialog auto-selects
 * it via the parent's onSelect callback.
 *
 * @related client/src/features/chat/components/ChannelItem.tsx
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@core/components/ui/dialog'
import { Skeleton } from '@core/components/ui/skeleton'

import { useChannels } from '../hooks/useChannels'
import { ChannelItem } from './ChannelItem'
import { CreateChannelDialog } from './CreateChannelDialog'

interface ChannelListProps {
  slug: string
  projectId: string
  activeChannelId: string | undefined
  onSelect: (channelId: string) => void
}

export function ChannelList({
  slug,
  projectId,
  activeChannelId,
  onSelect,
}: ChannelListProps): JSX.Element {
  const { data: channels, isLoading } = useChannels(slug, projectId)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Channels
        </h3>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded p-1 text-text-dim hover:bg-surface hover:text-text"
          title="New channel"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 px-2">
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        ) : channels && channels.length > 0 ? (
          channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              name={channel.name}
              isActive={channel.id === activeChannelId}
              onClick={() => onSelect(channel.id)}
            />
          ))
        ) : (
          <p className="px-2 text-xs text-text-dim">No channels yet.</p>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-border bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-text">Create channel</DialogTitle>
          </DialogHeader>
          <CreateChannelDialog
            slug={slug}
            projectId={projectId}
            onSuccess={(channelId) => {
              setIsCreateOpen(false)
              onSelect(channelId)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
