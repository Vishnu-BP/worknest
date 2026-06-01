/**
 * @file Hero.tsx — Above-the-fold hero section for the landing page
 * @module client/features/landing/components
 *
 * Eyebrow tag, oversized headline (with gradient accent on the focus word),
 * supporting subhead, primary + secondary CTAs, and a decorative gradient
 * blob that sits behind everything. The blob is the placeholder for the
 * live embedded kanban demo coming in iteration 2.
 *
 * CTAs are auth-aware: signed-in users see "Open your workspace" → /app,
 * signed-out users see "Get started" → /auth.
 *
 * @dependencies react-router-dom, lucide-react, @core/stores
 * @related client/src/features/landing/pages/Landing.tsx — parent page
 */

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { ROUTES } from '@core/config'
import { useAuthStore } from '@core/stores'
import { Button } from '@core/components/ui/button'

// ─── Component ─────────────────────────────────────────────────

export function Hero(): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section className="relative overflow-hidden">
      {/* ─── Decorative gradient blobs ───────────────────── */}
      {/* Placeholder for the live kanban demo added in iteration 2. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
      >
        <div className="h-[640px] w-[640px] rounded-full bg-primary/25 blur-[160px]" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-64 -z-10"
      >
        <div className="h-[440px] w-[440px] rounded-full bg-secondary/20 blur-[140px]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-16 pt-20 text-center md:px-6 md:pb-20 md:pt-28 lg:pt-32">
        {/* ─── Headline ──────────────────────────────────── */}
        <h1 className="mb-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl md:text-6xl lg:text-7xl">
          Ship work,
          <br />
          <span className="bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent">
            not meetings.
          </span>
        </h1>

        {/* ─── Subhead — the hook ────────────────────────── */}
        <p className="mb-10 max-w-xl text-balance text-base leading-relaxed text-text-muted md:text-lg">
          The team workspace that tracks your way.
          <br className="hidden sm:block" />
          {' '}Real-time, stupidly simple, free — set up in 60 seconds.
        </p>

        {/* ─── CTAs ──────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          {isAuthenticated ? (
            <Button
              asChild
              className="h-14 min-w-[220px] px-10 text-base font-semibold"
            >
              <Link to={ROUTES.HOME}>
                Open your workspace
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-14 min-w-[220px] px-10 text-base font-semibold"
            >
              <Link to={ROUTES.AUTH}>
                Get started — it&apos;s free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Button asChild variant="link" className="h-auto p-0 text-base text-text hover:text-primary">
            <a href="#about">Meet the architect →</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
