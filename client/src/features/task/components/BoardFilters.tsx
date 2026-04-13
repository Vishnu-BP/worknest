/**
 * @file BoardFilters.tsx — Kanban board filter bar
 * @module client/features/task/components
 *
 * Collapsible filter bar below the BoardHeader. Provides toggleable
 * chips for status and priority filters, plus a clear-all button.
 * All filtering is client-side — the full task list is cached in
 * TanStack Query, and filterStore selects what to display.
 *
 * @dependencies shadcn/ui, @worknest/shared
 * @related client/src/core/stores/filterStore.ts — reads/writes filter state
 */

import { X } from 'lucide-react'

import { TASK_STATUS_ORDER, PRIORITY_ORDER } from '@worknest/shared'
import type { Priority, TaskStatus } from '@worknest/shared'

import { Button } from '@core/components/ui/button'
import { cn } from '@core/lib'
import { useFilterStore } from '@core/stores'

import { getStatusLabel } from './StatusBadge'

// ─── Constants ─────────────────────────────────────────────────

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'None',
}

// ─── Component ─────────────────────────────────────────────────

export function BoardFilters(): JSX.Element {
  const statusFilter = useFilterStore((s) => s.statusFilter)
  const priorityFilter = useFilterStore((s) => s.priorityFilter)
  const setStatusFilter = useFilterStore((s) => s.setStatusFilter)
  const setPriorityFilter = useFilterStore((s) => s.setPriorityFilter)
  const reset = useFilterStore((s) => s.reset)

  const hasActiveFilters = statusFilter.length > 0 || priorityFilter.length > 0

  // ─── Toggle Helpers ────────────────────────────────────────

  const toggleStatus = (status: TaskStatus): void => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  const togglePriority = (priority: Priority): void => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter((p) => p !== priority))
    } else {
      setPriorityFilter([...priorityFilter, priority])
    }
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="mb-4 space-y-3 rounded-lg border border-border bg-surface p-4">
      {/* Status Filters */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-text-dim">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {TASK_STATUS_ORDER.map((status) => (
            <FilterChip
              key={status}
              label={getStatusLabel(status)}
              isActive={statusFilter.includes(status)}
              onClick={() => toggleStatus(status)}
            />
          ))}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-text-dim">Priority</p>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_ORDER.map((priority) => (
            <FilterChip
              key={priority}
              label={PRIORITY_LABELS[priority]}
              isActive={priorityFilter.includes(priority)}
              onClick={() => togglePriority(priority)}
            />
          ))}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="gap-1 text-xs text-text-muted hover:text-text"
        >
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

// ─── Filter Chip ───────────────────────────────────────────────

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        isActive
          ? 'bg-primary text-white'
          : 'bg-surface-alt text-text-muted hover:text-text',
      )}
    >
      {label}
    </button>
  )
}
