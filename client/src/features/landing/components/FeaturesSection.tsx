/**
 * @file FeaturesSection.tsx — Product feature highlights on the landing page
 * @module client/features/landing/components
 *
 * Anchor target for the nav "Features" link (`#features`). Presents the
 * six capabilities that distinguish WorkNest from a todo-list clone —
 * multi-tenancy, real-time, RBAC, drag-and-drop, command palette, invites —
 * each as an icon+title+body card in a responsive 1/2/3 column grid.
 *
 * Copy leans product-marketing (what you get), not engineering. The
 * `ArchitectureSection` covers the how/why for a technical audience.
 *
 * @dependencies lucide-react, @core/components/ui/card
 * @related client/src/features/landing/pages/Landing.tsx — parent
 */

import type { LucideIcon } from 'lucide-react'
import {
  Command,
  GripVertical,
  Mail,
  Shield,
  Users,
  Zap,
} from 'lucide-react'

import { Card, CardContent } from '@core/components/ui/card'
import { cn } from '@core/lib'

// ─── Feature Data ──────────────────────────────────────────────

interface Feature {
  icon: LucideIcon
  title: string
  body: string
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: 'Multi-tenant workspaces',
    body:
      'One login, many workspaces. Every row in every table is scoped to a workspace_id so data never bleeds between tenants.',
  },
  {
    icon: Zap,
    title: 'Real-time sync',
    body:
      'Supabase Realtime pushes task changes to every connected client. Drag a card on one screen, watch it move on the other.',
  },
  {
    icon: Shield,
    title: 'Role-based access',
    body:
      'Four roles — owner, admin, member, viewer — enforced at three layers: UI, Express middleware, and Postgres RLS.',
  },
  {
    icon: GripVertical,
    title: 'Drag-and-drop kanban',
    body:
      'Fractional indexing keeps positions conflict-free across concurrent moves. Cards never jump to the wrong place.',
  },
  {
    icon: Command,
    title: 'Instant command palette',
    body:
      'Cmd+K opens a cached search across every task, project, and member — zero network round-trip.',
  },
  {
    icon: Mail,
    title: 'Team invitations',
    body:
      'Magic-link invitations via Resend. Recipients sign up with a 6-digit email OTP and auto-join the workspace.',
  },
]

// ─── Component ─────────────────────────────────────────────────

export function FeaturesSection(): JSX.Element {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* ─── Header ────────────────────────────────────── */}
        <div className="mb-12 text-center md:mb-14">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-text-muted md:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for real team workflows
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl">
            Everything a small team needs
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-sm leading-relaxed text-text-muted md:text-lg">
            Opinionated defaults, strict data boundaries, and zero ceremony.
            The pieces that normally take a quarter to assemble — already stitched together.
          </p>
        </div>

        {/* ─── Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Card ──────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: Feature }): JSX.Element {
  const Icon = feature.icon
  return (
    <Card
      className={cn(
        'border-border/60 bg-surface/40 backdrop-blur-sm',
        'transition-colors hover:border-primary/40 hover:bg-surface/60',
      )}
    >
      <CardContent className="p-6">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          {feature.body}
        </p>
      </CardContent>
    </Card>
  )
}
