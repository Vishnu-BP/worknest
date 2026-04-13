/**
 * @file ProjectBoard.tsx — Project board page (Kanban placeholder)
 * @module client/features/project/pages
 *
 * Route: /w/:slug/projects/:projectId/board
 * Phase 7: Shows project name + placeholder for Kanban board.
 * Phase 9: Will render full KanbanView with drag-and-drop.
 *
 * @dependencies react-router-dom, lucide-react
 * @related client/src/features/project/hooks/useProject.ts
 */

import { useParams } from 'react-router-dom'
import { Kanban } from 'lucide-react'

import { Skeleton } from '@core/components/ui/skeleton'
import { EmptyState } from '@core/components/common/EmptyState'

import { useProject } from '../hooks/useProject'

// ─── Component ─────────────────────────────────────────────────

export function ProjectBoard(): JSX.Element {
  const { slug, projectId } = useParams<{ slug: string; projectId: string }>()
  const { data: project, isLoading } = useProject(slug, projectId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!project) {
    return <p className="text-text-muted">Project not found.</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: project.color }}
          aria-hidden="true"
        />
        <h2 className="text-xl font-semibold text-text">{project.name}</h2>
        <span className="text-sm text-text-dim">({project.key})</span>
      </div>

      <EmptyState
        icon={Kanban}
        title="Kanban board coming in Phase 9"
        description="Drag-and-drop task columns with fractional indexing, optimistic updates, and real-time sync will be built here."
      />
    </div>
  )
}
