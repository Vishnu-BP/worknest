/**
 * @file DemoSection.tsx — Four stacked interactive demos with sticky pill navigator
 * @module client/features/landing/components
 *
 * Anchored at `#demo`. Instead of the previous tabbed single-surface,
 * we now stack all four surfaces vertically — Flow · Board · Command
 * palette · Roles — each inside its own `DemoSubSection` shell. A
 * `DemoPillNav` sits sticky at the top of this section, tracking
 * scroll position so the active pill always reflects what the reader
 * is currently looking at.
 *
 * @dependencies @features/landing/components/{DemoPillNav, DemoBoard, DemoPalette, DemoRoleSwitcher, FlowDemo, DemoSubSection}
 * @related client/src/features/landing/pages/Landing.tsx — parent
 */

import { DemoBoard } from './DemoBoard'
import { DemoPalette } from './DemoPalette'
import { DemoPillNav } from './DemoPillNav'
import { DemoRoleSwitcher } from './DemoRoleSwitcher'
import { DemoSubSection } from './DemoSubSection'
import { FlowDemo } from './FlowDemo'

// ─── Component ─────────────────────────────────────────────────

export function DemoSection(): JSX.Element {
  return (
    <section id="demo" className="relative scroll-mt-20">
      {/* ─── Sticky pill navigator ─────────────────────── */}
      <DemoPillNav />

      {/* ─── Stacked sub-demos ─────────────────────────── */}
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <DemoSubSection
          id="demo-flow"
          eyebrow="01 · Flow"
          title="How your work nests"
          caption="Workspace → Project → Team → Task, bolted together by workspace_id."
        >
          <FlowDemo />
        </DemoSubSection>

        <DemoSubSection
          id="demo-board"
          eyebrow="02 · Board"
          title="Drag cards across statuses"
          caption="Fractional indexing keeps positions conflict-free across concurrent drags."
        >
          <div className="rounded-xl border border-border/60 bg-background/50 p-3 shadow-2xl shadow-primary/10 backdrop-blur-sm md:p-6">
            <DemoBoard />
          </div>
        </DemoSubSection>

        <DemoSubSection
          id="demo-palette"
          eyebrow="03 · Palette"
          title="Cmd+K, no round-trip"
          caption="Client-side fuzzy search over cached tasks, projects, and members."
        >
          <DemoPalette />
        </DemoSubSection>

        <DemoSubSection
          id="demo-roles"
          eyebrow="04 · Roles"
          title="Same UI, different powers"
          caption={'Click any role to see exactly what it can and can\u2019t do.'}
        >
          <DemoRoleSwitcher />
        </DemoSubSection>
      </div>
    </section>
  )
}

