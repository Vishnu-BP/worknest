/**
 * @file DemoSubSection.tsx — Shared shell for each sub-demo
 * @module client/features/landing/components
 *
 * Every sub-demo (Flow, Board, Palette, Roles) wraps its content in this
 * wrapper so the four surfaces share a visual rhythm and so the pill
 * navigator has a stable `id` to scroll-spy against. `scroll-mt-32`
 * offsets the pill+nav height so smooth-scroll anchoring doesn't hide
 * the eyebrow under the sticky chrome.
 *
 * @dependencies react
 * @related client/src/features/landing/components/DemoSection.tsx — parent
 */

import type { ReactNode } from 'react'

// ─── Types ─────────────────────────────────────────────────────

interface DemoSubSectionProps {
  /** DOM id — used by the sticky pill to scroll-spy and jump. */
  id: string
  /** Small uppercase caption above the title, e.g. "01 · Flow". */
  eyebrow: string
  /** Main heading for this sub-demo. */
  title: string
  /** One-line explainer under the title. */
  caption: string
  /** The actual interactive demo component. */
  children: ReactNode
}

// ─── Component ─────────────────────────────────────────────────

export function DemoSubSection({
  id,
  eyebrow,
  title,
  caption,
  children,
}: DemoSubSectionProps): JSX.Element {
  return (
    <section id={id} className="scroll-mt-32 py-14 md:py-20">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="mb-8 text-center md:mb-10">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary md:text-xs">
          {eyebrow}
        </p>
        <h3 className="mb-3 text-balance text-2xl font-bold tracking-tight text-text sm:text-3xl md:text-4xl">
          {title}
        </h3>
        <p className="mx-auto max-w-2xl text-balance text-sm leading-relaxed text-text-muted md:text-base">
          {caption}
        </p>
      </div>

      {/* ─── Demo slot ──────────────────────────────────── */}
      <div className="relative">{children}</div>
    </section>
  )
}
