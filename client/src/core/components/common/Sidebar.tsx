/**
 * @file Sidebar.tsx — Main navigation sidebar
 * @module client/core/components/common
 *
 * Left sidebar containing workspace switcher, project list (Phase 7),
 * and settings link. Collapsible via uiStore toggle. Persists across
 * all workspace child routes via WorkspaceLayout's Outlet pattern.
 *
 * @dependencies react-router-dom, lucide-react, shadcn/ui
 * @related client/src/core/components/common/WorkspaceLayout.tsx
 */

import { Folder, PanelLeftClose, PanelLeft, Settings } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'

import { Button } from '@core/components/ui/button'
import { Separator } from '@core/components/ui/separator'
import { Skeleton } from '@core/components/ui/skeleton'
import { cn } from '@core/lib'
import { ROUTES } from '@core/config'
import { useUIStore } from '@core/stores'

import { useProjects } from '@features/project/hooks/useProjects'
import { ProjectSidebarItem } from '@features/project/components/ProjectSidebarItem'

import { WorkspaceSwitcher } from './WorkspaceSwitcher'

// ─── Component ─────────────────────────────────────────────────

export function Sidebar(): JSX.Element {
  const { slug } = useParams<{ slug: string }>()
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-surface transition-all duration-200',
        isSidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ─── Workspace Switcher ────────────────────────── */}
      <div className="p-3">
        {isSidebarCollapsed ? (
          <div className="flex h-9 items-center justify-center">
            <Folder className="h-5 w-5 text-text-muted" />
          </div>
        ) : (
          <WorkspaceSwitcher />
        )}
      </div>

      <Separator className="bg-border" />

      {/* ─── Project List ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-3">
        {!isSidebarCollapsed && (
          <p className="mb-2 text-xs font-medium uppercase text-text-dim">
            Projects
          </p>
        )}
        {slug && <ProjectList slug={slug} isSidebarCollapsed={isSidebarCollapsed} />}
      </nav>

      <Separator className="bg-border" />

      {/* ─── Bottom Actions ────────────────────────────── */}
      <div className="p-3 space-y-1">
        {slug && (
          <NavLink
            to={ROUTES.WORKSPACE_SETTINGS(slug)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-surface-alt text-text'
                  : 'text-text-muted hover:bg-surface-alt hover:text-text',
                isSidebarCollapsed && 'justify-center px-2',
              )
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            'w-full text-text-muted hover:bg-surface-alt hover:text-text',
            isSidebarCollapsed ? 'justify-center' : 'justify-start',
          )}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  )
}

// ─── Project List Sub-Component ────────────────────────────────

function ProjectList({
  slug,
  isSidebarCollapsed,
}: {
  slug: string
  isSidebarCollapsed: boolean
}): JSX.Element {
  const { data: projects, isLoading } = useProjects(slug)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-full" />
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    if (isSidebarCollapsed) return <></>
    return <p className="text-xs text-text-dim">No projects yet</p>
  }

  return (
    <div className="space-y-0.5">
      {projects.map((project) => (
        <ProjectSidebarItem key={project.id} project={project} slug={slug} />
      ))}
    </div>
  )
}
