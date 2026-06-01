/**
 * @file MessageComposer.tsx — Bottom textarea for posting new messages
 * @module client/features/chat/components
 *
 * Cmd/Ctrl+Enter sends. The textarea auto-resets after a successful post.
 *
 * @related client/src/features/chat/hooks/useCreateMessage.ts
 */

import { useState } from 'react'
import { Send } from 'lucide-react'

import { Button } from '@core/components/ui/button'

import { useCreateMessage } from '../hooks/useCreateMessage'

interface MessageComposerProps {
  slug: string
  channelId: string
  channelName: string
}

export function MessageComposer({
  slug,
  channelId,
  channelName,
}: MessageComposerProps): JSX.Element {
  const [body, setBody] = useState('')
  const createMessage = useCreateMessage(slug, channelId)

  const handleSend = async (): Promise<void> => {
    const trimmed = body.trim()
    if (!trimmed || createMessage.isPending) return
    await createMessage.mutateAsync({ body: trimmed })
    setBody('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="rounded-md border border-border bg-surface focus-within:ring-1 focus-within:ring-primary">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={2}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-dim outline-none"
        />
        <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
          <span className="text-[11px] text-text-dim">⌘/Ctrl + Enter to send</span>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={!body.trim() || createMessage.isPending}
            className="h-7 gap-1.5 bg-primary text-white hover:bg-primary/90"
          >
            <Send className="h-3 w-3" />
            {createMessage.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}
