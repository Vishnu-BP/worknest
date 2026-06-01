/**
 * @file Landing.tsx — Public marketing landing page at `/`
 * @module client/features/landing/pages
 *
 * First-touch page for anyone hitting the WorkNest root URL. Also
 * accessible when authenticated — the nav + hero swap their CTA to
 * "Open workspace" in that case.
 *
 * Scroll behavior on mount:
 *   - Browser scroll restoration is switched to `manual` so a refresh
 *     always starts at the top instead of snapping back to wherever the
 *     user last was (the default `auto` broke expectations for a
 *     marketing page).
 *   - If a hash is present (e.g. `/#features` from the /contact page's
 *     nav), we resolve the element and smooth-scroll to it, deferred
 *     via requestAnimationFrame so the section's final layout has
 *     settled before we measure it.
 *   - Without a hash, we explicitly `scrollTo(0, 0)` — this defeats any
 *     focus-triggered scroll (e.g. cmdk's Command.Input in the Palette
 *     demo) that could otherwise land the user mid-page on boot.
 *
 * @dependencies react, react-router-dom
 * @related client/src/App.tsx — mounts this at path="/"
 */

import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { AboutSection } from '../components/AboutSection'
import { ArchitectureSection } from '../components/ArchitectureSection'
import { DemoSection } from '../components/DemoSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { Footer } from '../components/Footer'
import { Hero } from '../components/Hero'
import { LandingNav } from '../components/LandingNav'

// ─── Page ──────────────────────────────────────────────────────

export function Landing(): JSX.Element {
  const { hash } = useLocation()

  // Force the page to start at the top before paint so the user never
  // sees a mid-page flash. Only applies when there's no hash — hash
  // navigations still scroll to the target via the effect below.
  //
  // Belt and suspenders: we re-snap to 0 across the first two animation
  // frames too, because React's incremental rendering + font loading can
  // shift layout and nudge the scroll position after our initial reset.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    if (hash) return

    let cancelF2: number | undefined
    window.scrollTo(0, 0)
    const f1 = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      cancelF2 = requestAnimationFrame(() => window.scrollTo(0, 0))
    })
    return () => {
      cancelAnimationFrame(f1)
      if (cancelF2 !== undefined) cancelAnimationFrame(cancelF2)
    }
  }, [hash])

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hash])

  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <LandingNav />
      <main>
        <Hero />
        <FeaturesSection />
        <DemoSection />
        <ArchitectureSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  )
}
