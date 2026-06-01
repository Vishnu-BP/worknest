/**
 * @file FlowDemo.tsx — Data hierarchy visualization (Workspace → Task)
 * @module client/features/landing/components
 *
 * Teaches visitors how WorkNest's data nests: a workspace contains
 * projects, a project has a team, a team owns tasks. Renders four
 * connected cards with an entity icon, a concrete example, and a
 * one-liner. Chevrons sit between cards — horizontal on desktop,
 * vertical on mobile so the hierarchy still reads top-down.
 *
 * This is a static teaching diagram — no interaction, no drag.
 *
 * @dependencies lucide-react, @core/components/ui/card
 * @related client/src/features/landing/components/DemoSection.tsx — parent
 */

import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Users,
} from 'lucide-react'
import { Fragment } from 'react'

import { Card, CardContent } from '@core/components/ui/card'

// ─── Data ──────────────────────────────────────────────────────

interface Level {
  icon: LucideIcon
  label: string
  example: string
  detail: string
}

const LEVELS: Level[] = [
  {
    icon: Building2,
    label: 'Workspace',
    example: 'Acme',
    detail: 'Top-level tenant boundary · RLS-isolated',
  },
  {
    icon: FolderKanban,
    label: 'Project',
    example: 'Website redesign',
    detail: 'A board with columns and tasks',
  },
  {
    icon: Users,
    label: 'Team',
    example: 'Engineering',
    detail: 'Members with shared access',
  },
  {
    icon: CheckCircle2,
    label: 'Task',
    example: 'WN-17 · Ship drag-and-drop',
    detail: 'In progress · high priority',
  },
]

// ─── Component ─────────────────────────────────────────────────

export function FlowDemo(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ─── Hierarchy strip ────────────────────────────── */}
      <div className="flex flex-col items-stretch gap-3 md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center md:gap-2">
        {LEVELS.map((level, i) => (
          <Fragment key={level.label}>
            <LevelCard level={level} index={i} />
            {i < LEVELS.length - 1 && (
              <>
                <ChevronDown className="mx-auto h-5 w-5 shrink-0 text-text-dim md:hidden" />
                <ChevronRight className="hidden h-6 w-6 shrink-0 text-text-dim md:block" />
              </>
            )}
          </Fragment>
        ))}
      </div>

      {/* ─── Footnote ───────────────────────────────────── */}
      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-text-dim md:text-sm">
        Every task rolls up to a team, every team to a project, every project to
        a workspace &mdash; and <code className="rounded bg-surface/60 px-1 py-0.5 font-mono text-text-muted">workspace_id</code> lives on
        every row so Postgres RLS can filter at the source, not in application code.
      </p>
    </div>
  )
}

// ─── Level Card ────────────────────────────────────────────────

function LevelCard({ level, index }: { level: Level; index: number }): JSX.Element {
  const Icon = level.icon
  return (
    <Card className="border-border/60 bg-surface/40 backdrop-blur-sm">
      <CardContent className="flex flex-col items-start gap-3 p-4 md:p-5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
          <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span>{level.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-semibold text-text md:text-base">
            {level.example}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-text-muted">{level.detail}</p>
      </CardContent>
    </Card>
  )
}
