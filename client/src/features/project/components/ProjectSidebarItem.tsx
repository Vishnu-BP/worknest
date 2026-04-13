/**
 * @file ProjectSidebarItem.tsx — Sidebar project list item
 * @module client/features/project/components
 *
 * Single project entry in the sidebar navigation. Shows a color dot
 * matching the project's accent color and the project name. Clicking
 * navigates to the project board. Respects sidebar collapse state.
 *
 * @dependencies react-router-dom, client/src/core/lib, client/src/core/stores
 * @related client/src/core/components/common/Sidebar.tsx — parent component
 */

import { NavLink } from 'react-router-dom'

import type { Project } from '@worknest/shared'

import { cn } from '@core/lib'
import { ROUTES } from '@core/config'
import { useUIStore } from '@core/stores'

// ─── Component ─────────────────────────────────────────────────

interface ProjectSidebarItemProps {
  project: Project
  slug: string
}

export function ProjectSidebarItem({
  project,
  slug,
}: ProjectSidebarItemProps): JSX.Element {
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed)

  return (
    <NavLink
      to={ROUTES.PROJECT_BOARD(slug, project.id)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
          isActive
            ? 'bg-surface-alt text-text'
            : 'text-text-muted hover:bg-surface-alt hover:text-text',
          isSidebarCollapsed && 'justify-center px-2',
        )
      }
      title={project.name}
    >
      <div
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: project.color }}
        aria-hidden="true"
      />
      {!isSidebarCollapsed && (
        <span className="truncate">{project.name}</span>
      )}
    </NavLink>
  )
}
