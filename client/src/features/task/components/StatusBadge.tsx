/**
 * @file StatusBadge.tsx — Task status colored dot
 * @module client/features/task/components
 *
 * Displays a small colored dot representing the task's status.
 * Colors match the status colors from docs/design-tokens.md.
 * Used in column headers and task detail views.
 *
 * @dependencies shadcn/ui
 * @related client/src/features/task/components/KanbanColumn.tsx — uses in header
 */

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@core/components/ui/tooltip'
import { cn } from '@core/lib'

import type { TaskStatus } from '@worknest/shared'

// ─── Status Config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { color: string; label: string }> = {
  backlog: { color: 'bg-status-backlog', label: 'Backlog' },
  todo: { color: 'bg-status-todo', label: 'To Do' },
  in_progress: { color: 'bg-status-in-progress', label: 'In Progress' },
  in_review: { color: 'bg-status-in-review', label: 'In Review' },
  done: { color: 'bg-status-done', label: 'Done' },
  cancelled: { color: 'bg-status-cancelled', label: 'Cancelled' },
}

// ─── Component ─────────────────────────────────────────────────

interface StatusBadgeProps {
  status: TaskStatus
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, showTooltip = true, size = 'sm' }: StatusBadgeProps): JSX.Element {
  const config = STATUS_CONFIG[status]

  const dotElement = (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full',
        config.color,
        size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3',
      )}
    />
  )

  if (!showTooltip) return dotElement

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center">{dotElement}</span>
        </TooltipTrigger>
        <TooltipContent className="border-border bg-surface text-text">
          <p className="text-xs">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Returns the display label for a status (used in column headers) */
export function getStatusLabel(status: TaskStatus): string {
  return STATUS_CONFIG[status].label
}
