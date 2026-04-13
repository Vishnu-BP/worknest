/**
 * @file ProjectCard.tsx — Project card in workspace dashboard grid
 * @module client/features/project/components
 *
 * Clickable card showing project color dot, name, key badge,
 * optional description, and task count placeholder. Navigates
 * to the project board on click.
 *
 * @dependencies react-router-dom, shadcn/ui
 * @related client/src/features/workspace/pages/WorkspaceDashboard.tsx — renders these
 */

import { useNavigate } from 'react-router-dom'

import type { Project } from '@worknest/shared'

import { Card, CardContent, CardHeader } from '@core/components/ui/card'
import { Badge } from '@core/components/ui/badge'
import { ROUTES } from '@core/config'

// ─── Component ─────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project
  slug: string
}

export function ProjectCard({ project, slug }: ProjectCardProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer border-border bg-surface transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => navigate(ROUTES.PROJECT_BOARD(slug, project.id))}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">
              {project.name}
            </p>
            <Badge
              variant="outline"
              className="mt-1 border-border text-xs text-text-dim"
            >
              {project.key}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {project.description && (
          <p className="mb-2 line-clamp-2 text-xs text-text-muted">
            {project.description}
          </p>
        )}
        <p className="text-xs text-text-dim">
          {project.task_counter} {project.task_counter === 1 ? 'task' : 'tasks'}
        </p>
      </CardContent>
    </Card>
  )
}
