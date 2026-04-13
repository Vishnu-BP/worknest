/**
 * @file TaskQuickCreate.tsx — Inline task creation at column bottom
 * @module client/features/task/components
 *
 * A minimal input at the bottom of each Kanban column. User types
 * a title and presses Enter to create a task in that column's status.
 * The task is created with default priority (none) and assigned to
 * the bottom of the column via the server's auto-positioning.
 *
 * @dependencies react, lucide-react
 * @related client/src/features/task/hooks/useCreateTask.ts — mutation hook
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { cn } from '@core/lib'

import type { TaskStatus } from '@worknest/shared'

import { useCreateTask } from '../hooks/useCreateTask'

// ─── Component ─────────────────────────────────────────────────

interface TaskQuickCreateProps {
  slug: string
  projectId: string
  /** Column status — will be used when server supports creating in a specific status */
  status: TaskStatus
}

export function TaskQuickCreate({ slug, projectId, status: _status }: TaskQuickCreateProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const createTask = useCreateTask(slug, projectId)

  const handleSubmit = async (): Promise<void> => {
    const trimmed = title.trim()
    if (!trimmed) return

    await createTask.mutateAsync({ title: trimmed })
    setTitle('')
    // Keep input open for rapid task creation
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setTitle('')
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-text-dim hover:bg-surface-alt hover:text-text-muted transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    )
  }

  return (
    <div className="rounded-md border border-border bg-surface p-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) setIsOpen(false)
        }}
        placeholder="Task title..."
        autoFocus
        disabled={createTask.isPending}
        className={cn(
          'w-full bg-transparent text-sm text-text placeholder:text-text-dim',
          'outline-none',
          createTask.isPending && 'opacity-50',
        )}
      />
      <p className="mt-1 text-[10px] text-text-dim">
        Enter to create &middot; Esc to cancel
      </p>
    </div>
  )
}
