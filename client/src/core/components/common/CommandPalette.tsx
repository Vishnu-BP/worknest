/**
 * @file CommandPalette.tsx — Cmd+K global search dialog
 * @module client/core/components/common
 *
 * Opens with Cmd+K (Mac) or Ctrl+K (Windows). Searches across cached
 * TanStack Query data — tasks, projects, members — with zero API calls.
 * Results are grouped by type. Enter navigates to the selected item.
 *
 * Search is client-side for instant results. All data is already in
 * the TanStack Query cache from previous page loads.
 *
 * @dependencies cmdk, react-router-dom, lucide-react
 * @related client/src/core/components/common/Header.tsx — trigger button
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Command } from 'cmdk'
import { FileText, FolderKanban, Search, Users } from 'lucide-react'

import {
  Dialog,
  DialogContent,
} from '@core/components/ui/dialog'
import { ROUTES } from '@core/config'

import type { MemberWithUser, Project, Task } from '@worknest/shared'

// ─── Component ─────────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tasks?: Task[]
  projects?: Project[]
  members?: MemberWithUser[]
}

export function CommandPalette({
  isOpen,
  onOpenChange,
  tasks = [],
  projects = [],
  members = [],
}: CommandPaletteProps): JSX.Element {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()
  const [search, setSearch] = useState('')

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  // ─── Keyboard Shortcut ─────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!isOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onOpenChange])

  // ─── Filtered Results ──────────────────────────────────────

  const results = useMemo(() => {
    if (!search.trim()) return { tasks: [], projects: [], members: [] }

    const q = search.toLowerCase()

    return {
      tasks: tasks
        .filter((t) => t.title.toLowerCase().includes(q))
        .slice(0, 5),
      projects: projects
        .filter((p) => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
        .slice(0, 3),
      members: members
        .filter((m) =>
          m.user.email.toLowerCase().includes(q) ||
          (m.user.full_name?.toLowerCase().includes(q) ?? false),
        )
        .slice(0, 3),
    }
  }, [search, tasks, projects, members])

  const hasResults = results.tasks.length + results.projects.length + results.members.length > 0

  // ─── Navigation ────────────────────────────────────────────

  const handleSelect = (action: () => void): void => {
    action()
    onOpenChange(false)
  }

  // ─── Render ────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border bg-surface p-0 sm:max-w-lg">
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-text-muted" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search tasks, projects, members..."
              className="flex h-11 w-full bg-transparent py-3 text-sm text-text outline-none placeholder:text-text-dim"
            />
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            {search && !hasResults && (
              <Command.Empty className="py-6 text-center text-sm text-text-muted">
                No results found for &quot;{search}&quot;
              </Command.Empty>
            )}

            {!search && (
              <div className="py-6 text-center text-sm text-text-dim">
                Start typing to search...
              </div>
            )}

            {/* Tasks */}
            {results.tasks.length > 0 && (
              <Command.Group heading="Tasks" className="text-xs font-medium text-text-dim">
                {results.tasks.map((task) => (
                  <Command.Item
                    key={task.id}
                    value={task.id}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(`/w/${slug}/projects/${task.project_id}/board?task=${task.id}`),
                      )
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted aria-selected:bg-surface-alt aria-selected:text-text"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{task.title}</span>
                    <span className="ml-auto text-xs text-text-dim">#{task.task_number}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Projects */}
            {results.projects.length > 0 && (
              <Command.Group heading="Projects" className="text-xs font-medium text-text-dim">
                {results.projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={project.id}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(ROUTES.PROJECT_BOARD(slug!, project.id)),
                      )
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted aria-selected:bg-surface-alt aria-selected:text-text"
                  >
                    <FolderKanban className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                    <span className="ml-auto text-xs text-text-dim">{project.key}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Members */}
            {results.members.length > 0 && (
              <Command.Group heading="Members" className="text-xs font-medium text-text-dim">
                {results.members.map((member) => (
                  <Command.Item
                    key={member.id}
                    value={member.id}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(ROUTES.WORKSPACE_MEMBERS(slug!)),
                      )
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted aria-selected:bg-surface-alt aria-selected:text-text"
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">{member.user.full_name || member.user.email}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-border px-3 py-2 text-[10px] text-text-dim">
            <kbd className="rounded bg-surface-alt px-1.5 py-0.5">↑↓</kbd> navigate{' '}
            <kbd className="rounded bg-surface-alt px-1.5 py-0.5">↵</kbd> select{' '}
            <kbd className="rounded bg-surface-alt px-1.5 py-0.5">esc</kbd> close
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
