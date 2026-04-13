/**
 * @file TaskCard.tsx — Draggable Kanban task card
 * @module client/features/task/components
 *
 * Lightweight card rendered for each task in a Kanban column.
 * Displays: task number (KEY-#), title, priority badge, and
 * optional due date indicator. Must be lightweight because
 * 50-100 cards may render simultaneously on a busy board.
 *
 * This component has NO hooks — all data comes via props.
 * The useSortable hook is applied by the parent KanbanColumn
 * wrapper to keep this component pure and fast.
 *
 * @dependencies lucide-react
 * @related client/src/features/task/components/KanbanColumn.tsx — wraps with useSortable
 */

import { Calendar } from 'lucide-react'

import { cn } from '@core/lib'

import type { Task } from '@worknest/shared'

import { PriorityBadge } from './PriorityBadge'

// ─── Component ─────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  projectKey: string
  isDragging?: boolean
}

export function TaskCard({ task, projectKey, isDragging }: TaskCardProps): JSX.Element {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-surface p-3 transition-shadow',
        'hover:shadow-md hover:border-border/80',
        isDragging && 'shadow-lg border-primary/50 opacity-90',
      )}
    >
      {/* Task number + Priority */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-dim">
          {projectKey}-{task.task_number}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-text line-clamp-2">
        {task.title}
      </p>

      {/* Bottom row: due date */}
      {task.due_date && (
        <div className="mt-2 flex items-center gap-1">
          <Calendar className={cn(
            'h-3 w-3',
            isOverdue ? 'text-error' : 'text-text-dim',
          )} />
          <span className={cn(
            'text-xs',
            isOverdue ? 'text-error' : 'text-text-dim',
          )}>
            {formatDueDate(task.due_date)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

/** Formats a due date string into a short readable format */
function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays <= 7) return `${diffDays}d left`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
