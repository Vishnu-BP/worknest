/**
 * @file Header.tsx — Top header bar with breadcrumb, search, and user menu
 * @module client/core/components/common
 *
 * Displays the current workspace name and page context as a breadcrumb.
 * Cmd+K button opens the CommandPalette for searching tasks/projects/members.
 * User avatar with dropdown menu on the right.
 *
 * @dependencies react-router-dom, client/src/features/workspace
 * @related client/src/core/components/common/WorkspaceLayout.tsx
 */

import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Search } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { useWorkspace } from '@features/workspace/hooks/useWorkspace'
import { useTasks } from '@features/task/hooks/useTasks'
import { useProjects } from '@features/project/hooks/useProjects'
import { useMembers } from '@features/member/hooks/useMembers'

import { CommandPalette } from './CommandPalette'
import { UserMenu } from './UserMenu'

// ─── Component ─────────────────────────────────────────────────

export function Header(): JSX.Element {
  const { slug, projectId } = useParams<{ slug: string; projectId: string }>()
  const location = useLocation()
  const { data: workspace } = useWorkspace(slug)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Cached data for CommandPalette search (no extra API calls)
  const { data: tasks } = useTasks(slug, projectId)
  const { data: projects } = useProjects(slug)
  const { data: members } = useMembers(slug)

  const pageName = getPageName(location.pathname, slug)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      {/* ─── Breadcrumb ──────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-text">
          {workspace?.name ?? 'Loading...'}
        </span>
        {pageName && (
          <>
            <span className="text-text-dim">/</span>
            <span className="text-text-muted">{pageName}</span>
          </>
        )}
      </div>

      {/* ─── Right Actions ───────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCommandOpen(true)}
          className="gap-2 border-border text-xs text-text-muted hover:text-text"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-surface-alt px-1.5 py-0.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>

        <UserMenu />
      </div>

      {/* ─── Command Palette ─────────────────────────── */}
      <CommandPalette
        isOpen={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        tasks={tasks}
        projects={projects}
        members={members}
      />
    </header>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function getPageName(pathname: string, slug: string | undefined): string | null {
  if (!slug) return null

  const workspacePath = `/w/${slug}`
  const subPath = pathname.replace(workspacePath, '').replace(/^\//, '')

  if (!subPath || subPath === '') return null

  const pageMap: Record<string, string> = {
    members: 'Members',
    settings: 'Settings',
    activity: 'Activity',
  }

  return pageMap[subPath] ?? subPath
}
