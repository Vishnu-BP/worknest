/**
 * @file useScrollSpy.ts — Track which in-view section is closest to the top
 * @module client/features/landing/hooks
 *
 * Given a list of DOM ids, returns the id of the section that is currently
 * the "active" one relative to the viewport. Uses IntersectionObserver so
 * we don't pay a scroll-listener tax on every pixel moved. Active section
 * = intersecting entries whose top is closest to the viewport top — this
 * matches how a reader's eye tracks content as they scroll.
 *
 * Powers the landing page's sticky pill navigator.
 *
 * @dependencies react
 * @related client/src/features/landing/components/DemoPillNav.tsx — consumer
 */

import { useEffect, useState } from 'react'

// ─── Hook ──────────────────────────────────────────────────────

export function useScrollSpy(ids: string[]): string | null {
  // Default to the first id so the pill is never blank before the user scrolls.
  const [active, setActive] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (ids.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Pick the entry whose top is closest to the viewport top.
        const best = visible.reduce((a, b) =>
          Math.abs(a.boundingClientRect.top) < Math.abs(b.boundingClientRect.top) ? a : b,
        )
        setActive(best.target.id)
      },
      {
        // Fire when a section crosses the middle 20% band of the viewport.
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      },
    )

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
    // ids is expected to be stable — pass a memoised array from the caller
    // if it's generated inline. Depend on a JSON stringification to re-run
    // if the actual list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')])

  return active
}
