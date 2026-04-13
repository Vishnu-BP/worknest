/**
 * @file WorkspaceDashboard.tsx — Workspace landing page (project grid)
 * @module client/features/workspace/pages
 *
 * Default page at /w/:slug. Shows a grid of project cards or an
 * empty state with a "Create project" CTA. The create project dialog
 * is triggered via uiStore modal state.
 *
 * @dependencies react-router-dom, lucide-react
 * @related client/src/features/project/ — project hooks and components
 */

import { useParams } from 'react-router-dom'
import { FolderKanban } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { Skeleton } from '@core/components/ui/skeleton'
import { EmptyState } from '@core/components/common/EmptyState'
import { useUIStore } from '@core/stores'

import { useProjects } from '@features/project/hooks/useProjects'
import { ProjectCard } from '@features/project/components/ProjectCard'

// ─── Component ─────────────────────────────────────────────────

export function WorkspaceDashboard(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const { data: projects, isLoading } = useProjects(slug)
  const openModal = useUIStore((s) => s.openModal)

  // ─── Loading ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold text-text">Projects</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty State ───────────────────────────────────────────

  if (!projects || projects.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold text-text">Projects</h2>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks on a Kanban board."
          actionLabel="Create project"
          onAction={() => openModal('createProject')}
        />
      </div>
    )
  }

  // ─── Project Grid ──────────────────────────────────────────

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Projects</h2>
        <Button
          onClick={() => openModal('createProject')}
          className="bg-primary text-white hover:bg-primary/90"
        >
          New project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} slug={slug!} />
        ))}
      </div>
    </div>
  )
}
