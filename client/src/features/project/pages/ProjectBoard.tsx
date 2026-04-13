/**
 * @file ProjectBoard.tsx — Project board page (Kanban board)
 * @module client/features/project/pages
 *
 * Route: /w/:slug/projects/:projectId/board
 * Fetches the project, then renders BoardHeader (with filter toggle)
 * and KanbanView (the full drag-and-drop board). Filter bar is
 * shown/hidden via local state toggle.
 *
 * This is a smart page — it fetches data and passes it as props
 * to dumb components (per CLAUDE.md design principles).
 *
 * @dependencies react-router-dom
 * @related client/src/features/task/ — task components and hooks
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Skeleton } from '@core/components/ui/skeleton'

import { useProject } from '../hooks/useProject'
import { KanbanView, BoardHeader, BoardFilters } from '@features/task'

// ─── Component ─────────────────────────────────────────────────

export function ProjectBoard(): JSX.Element {
  const { slug, projectId } = useParams<{ slug: string; projectId: string }>()
  const { data: project, isLoading } = useProject(slug, projectId)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // ─── Loading ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      </div>
    )
  }

  if (!project) {
    return <p className="text-text-muted">Project not found.</p>
  }

  // ─── Board ─────────────────────────────────────────────────

  return (
    <div>
      <BoardHeader
        project={project}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
      />

      {isFiltersOpen && <BoardFilters />}

      <KanbanView project={project} slug={slug!} />
    </div>
  )
}
