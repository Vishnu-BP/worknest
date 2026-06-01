/**
 * @file ArchitectureSection.tsx — Engineering showcase (tech stack + 3 decisions)
 * @module client/features/landing/components
 *
 * Anchor target for the nav "Architecture" link (`#architecture`).
 * Pure technical showcase now — tech stack strip + three design decisions
 * that matter. The author narrative lives in `AboutSection`; here we
 * stay focused on *what powers WorkNest*, not *who built it*.
 *
 * @dependencies @core/components/ui/card
 * @related client/src/features/landing/components/AboutSection.tsx — author narrative
 */

import { Card, CardContent } from '@core/components/ui/card'
import { cn } from '@core/lib'

// ─── Data ──────────────────────────────────────────────────────

interface TechGroup {
  label: string
  items: string[]
}

const TECH_GROUPS: TechGroup[] = [
  {
    label: 'Frontend',
    items: [
      'React',
      'Vite',
      'TypeScript',
      'Tailwind',
      'shadcn/ui',
      'TanStack Query',
      'Zustand',
      'dnd-kit',
      'React Router',
    ],
  },
  {
    label: 'Backend',
    items: ['Express', 'Zod', 'Resend'],
  },
  {
    label: 'Database',
    items: ['PostgreSQL', 'Drizzle ORM', 'Supabase'],
  },
]

interface Decision {
  title: string
  body: string
}

const DECISIONS: Decision[] = [
  {
    title: 'Three-layer auth',
    body:
      'UI hides actions by role for UX. Express middleware re-verifies JWT + membership + role on every request. Postgres RLS filters by workspace_id as the safety net. No single layer is trusted.',
  },
  {
    title: 'RLS-first multi-tenancy',
    body:
      'Every non-user table has workspace_id. Every query filters by it. workspace_id is stored redundantly on tasks so RLS checks don\u2019t need joins — trading disk for latency.',
  },
  {
    title: 'Fractional indexing',
    body:
      'Kanban positions are floats, not integers. Moving one card writes one row; concurrent drags from different users never conflict on ordering.',
  },
]

// ─── Section ───────────────────────────────────────────────────

export function ArchitectureSection(): JSX.Element {
  return (
    <section
      id="architecture"
      className="scroll-mt-20 border-t border-border/40 bg-surface/20 px-4 py-16 md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* ─── Header ────────────────────────────────────── */}
        <div className="mb-10 text-center md:mb-12">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary md:text-xs">
            Under the hood
          </p>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            The architecture, not just the UI
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-sm leading-relaxed text-text-muted md:text-lg">
            Most portfolio projects stop at &ldquo;it renders.&rdquo; WorkNest
            is a full multi-tenant SaaS with the boring-but-load-bearing
            pieces in place. Here&rsquo;s what powers it.
          </p>
        </div>

        {/* ─── Tech Stack, grouped ───────────────────────── */}
        <div className="mb-14 space-y-6">
          {TECH_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-dim md:text-xs">
                {group.label}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {group.items.map((label) => (
                  <TechBadge key={label} label={label} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Decision Cards ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DECISIONS.map((decision) => (
            <Card
              key={decision.title}
              className="border-border/60 bg-background/40 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <h3 className="mb-3 text-base font-semibold text-text">
                  {decision.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  {decision.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Tech Badge ────────────────────────────────────────────────

function TechBadge({ label }: { label: string }): JSX.Element {
  return (
    <span
      className={cn(
        'rounded-full border border-border/60 bg-background/50 px-3 py-1.5',
        'text-xs font-medium text-text-muted backdrop-blur-sm',
        'transition-colors hover:border-primary/40 hover:text-text',
      )}
    >
      {label}
    </span>
  )
}
