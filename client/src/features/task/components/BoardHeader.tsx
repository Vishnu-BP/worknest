/**
 * @file BoardHeader.tsx — Kanban board action row with filter toggle
 * @module client/features/task/components
 *
 * Project name/key/color now live in ProjectLayout's tab strip, so this
 * component owns only the right-aligned filter toggle and active-filter
 * badge above the columns.
 *
 * @dependencies lucide-react, shadcn/ui
 * @related client/src/features/task/components/BoardFilters.tsx
 * @related client/src/features/project/components/ProjectLayout.tsx
 */

import { Filter } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { useFilterStore } from '@core/stores'

// ─── Component ─────────────────────────────────────────────────

interface BoardHeaderProps {
  isFiltersOpen: boolean
  onToggleFilters: () => void
}

export function BoardHeader({
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
    <div className="mb-4 flex items-center justify-end">
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
