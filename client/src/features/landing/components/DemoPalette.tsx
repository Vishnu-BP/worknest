/**
 * @file DemoPalette.tsx — Inline command-palette demo
 * @module client/features/landing/components
 *
 * A working mockup of WorkNest's Cmd+K palette. Built on the same
 * `cmdk` primitive the real `CommandPalette` uses so the behavior
 * (type-to-filter, arrow-nav, Enter) is identical — just without a
 * dialog wrapper. Seed data is static so nothing queries the backend.
 *
 * Shows three groups — Tasks, Projects, Members — each with an icon
 * and "navigation hint" subtext. Selecting an item flashes a "navigated"
 * toast so visitors see the feedback loop without actually leaving the
 * landing.
 *
 * @dependencies cmdk, lucide-react
 * @related client/src/core/components/common/CommandPalette.tsx — real impl
 */

import { useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { FileText, FolderKanban, Search, Users } from 'lucide-react'

import { cn } from '@core/lib'

// ─── Seed Data ─────────────────────────────────────────────────

interface Entry {
  id: string
  label: string
  hint: string
}

const TASKS: Entry[] = [
  { id: 'task-17', label: 'Ship drag-and-drop on kanban board', hint: 'WN-17 · In progress' },
  { id: 'task-21', label: 'Add 6-digit OTP email auth',          hint: 'WN-21 · In progress' },
  { id: 'task-12', label: 'Design workspace switcher dropdown',  hint: 'WN-12 · Todo' },
  { id: 'task-14', label: 'Rate-limit invitation endpoint',      hint: 'WN-14 · Todo' },
  { id: 'task-9',  label: 'Wire Supabase Row-Level Security',    hint: 'WN-9 · Done' },
]

const PROJECTS: Entry[] = [
  { id: 'proj-1', label: 'WorkNest Landing',   hint: 'workspace / vishnu' },
  { id: 'proj-2', label: 'Client onboarding',  hint: 'workspace / vishnu' },
]

const MEMBERS: Entry[] = [
  { id: 'user-1', label: 'Vishnu B P',         hint: 'Owner · you' },
  { id: 'user-2', label: 'Priya Sharma',       hint: 'Admin' },
  { id: 'user-3', label: 'Arjun Reddy',        hint: 'Member' },
]

// ─── Component ─────────────────────────────────────────────────

export function DemoPalette(): JSX.Element {
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // Filter each group client-side
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return { tasks: TASKS, projects: PROJECTS, members: MEMBERS }
    return {
      tasks:    TASKS.filter((e) => matches(e, q)),
      projects: PROJECTS.filter((e) => matches(e, q)),
      members:  MEMBERS.filter((e) => matches(e, q)),
    }
  }, [search])

  const isEmpty =
    filtered.tasks.length === 0 &&
    filtered.projects.length === 0 &&
    filtered.members.length === 0

  // Selecting an item flashes a 1.5s toast — no real navigation since
  // this is a demo section, not the actual app
  const handleSelect = (entry: Entry): void => {
    setToast(`→ Would navigate to: ${entry.label}`)
    window.setTimeout(() => setToast(null), 1500)
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Command
        label="Command palette demo"
        className="overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-2xl shadow-primary/10 backdrop-blur-sm"
        filter={() => 1 /* we filter manually above — tell cmdk to show everything */}
      >
        {/* Input */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-text-dim" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search tasks, projects, members…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
            autoFocus={false}
          />
          <kbd className="hidden rounded border border-border/60 bg-surface/60 px-1.5 py-0.5 text-[10px] text-text-dim md:inline-block">
            Enter
          </kbd>
        </div>

        {/* Results */}
        <Command.List className="max-h-72 overflow-y-auto p-2">
          {isEmpty && (
            <Command.Empty className="px-3 py-6 text-center text-sm text-text-dim">
              No results.
            </Command.Empty>
          )}

          {filtered.tasks.length > 0 && (
            <Group label="Tasks" icon={<FileText className="h-3 w-3" />}>
              {filtered.tasks.map((entry) => (
                <Item key={entry.id} entry={entry} onSelect={handleSelect}>
                  <FileText className="h-4 w-4 text-text-dim" />
                </Item>
              ))}
            </Group>
          )}

          {filtered.projects.length > 0 && (
            <Group label="Projects" icon={<FolderKanban className="h-3 w-3" />}>
              {filtered.projects.map((entry) => (
                <Item key={entry.id} entry={entry} onSelect={handleSelect}>
                  <FolderKanban className="h-4 w-4 text-text-dim" />
                </Item>
              ))}
            </Group>
          )}

          {filtered.members.length > 0 && (
            <Group label="Members" icon={<Users className="h-3 w-3" />}>
              {filtered.members.map((entry) => (
                <Item key={entry.id} entry={entry} onSelect={handleSelect}>
                  <Users className="h-4 w-4 text-text-dim" />
                </Item>
              ))}
            </Group>
          )}
        </Command.List>

        {/* Keyboard hints */}
        <div className="flex items-center gap-4 border-t border-border/60 bg-surface/40 px-4 py-2 text-[10px] text-text-dim">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd><Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> select
          </span>
          <span className="ml-auto hidden items-center gap-1 sm:flex">
            <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> in the app
          </span>
        </div>
      </Command>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={cn(
            'pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2',
            'rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary',
            'shadow-md backdrop-blur-sm',
          )}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── Small presentational pieces ───────────────────────────────

function Group({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}): JSX.Element {
  return (
    <Command.Group
      heading={
        <span className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
          {icon}
          {label}
        </span>
      }
    >
      {children}
    </Command.Group>
  )
}

function Item({
  entry,
  onSelect,
  children,
}: {
  entry: Entry
  onSelect: (entry: Entry) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <Command.Item
      value={`${entry.label} ${entry.hint}`}
      onSelect={() => onSelect(entry)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        'data-[selected=true]:bg-primary/10 data-[selected=true]:text-text',
      )}
    >
      {children}
      <span className="flex-1 truncate text-text-muted data-[selected=true]:text-text">
        {entry.label}
      </span>
      <span className="text-[10px] text-text-dim">{entry.hint}</span>
    </Command.Item>
  )
}

function Kbd({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <kbd className="rounded border border-border/60 bg-background/70 px-1 py-0.5 font-mono">
      {children}
    </kbd>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function matches(entry: Entry, query: string): boolean {
  return (
    entry.label.toLowerCase().includes(query) ||
    entry.hint.toLowerCase().includes(query)
  )
}
