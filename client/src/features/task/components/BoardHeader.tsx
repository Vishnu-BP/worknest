/**
 * @file BoardHeader.tsx — Kanban board header with filter toggle
 * @module client/features/task/components
 *
 * Displays the project color dot, name, key, and a filter toggle
 * button. Shows an active filter indicator when any filters are set.
 *
 * @dependencies lucide-react, shadcn/ui
 * @related client/src/features/task/components/BoardFilters.tsx
 */

import { Filter } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { useFilterStore } from '@core/stores'

import type { Project } from '@worknest/shared'

// ─── Component ─────────────────────────────────────────────────

interface BoardHeaderProps {
  project: Project
  isFiltersOpen: boolean
  onToggleFilters: () => void
}

export function BoardHeader({
  project,
  isFiltersOpen,
  onToggleFilters,
}: BoardHeaderProps): JSX.Element {
  const statusFilter = useFilterStore((s) => s.statusFilter)
  const priorityFilter = useFilterStore((s) => s.priorityFilter)
  const assigneeFilter = useFilterStore((s) => s.assigneeFilter)

  const activeFilterCount =
    (statusFilter.length > 0 ? 1 : 0) +
    (priorityFilter.length > 0 ? 1 : 0) +
    (assigneeFilter ? 1 : 0)

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      {/* Project Info */}
      <div className="flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: project.color }}
          aria-hidden="true"
        />
        <h2 className="text-xl font-semibold text-text">{project.name}</h2>
        <span className="text-sm text-text-dim">({project.key})</span>
      </div>

      {/* Filter Toggle */}
      <Button
        variant={isFiltersOpen ? 'secondary' : 'outline'}
        size="sm"
        onClick={onToggleFilters}
        className="gap-2 border-border text-text-muted hover:text-text"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge className="ml-1 h-5 min-w-5 justify-center bg-primary px-1.5 text-[10px] text-white">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}
