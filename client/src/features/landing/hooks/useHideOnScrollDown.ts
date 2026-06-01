/**
 * @file useHideOnScrollDown.ts — Track scroll direction for auto-hide UI
 * @module client/features/landing/hooks
 *
 * Returns `true` when the user is scrolling DOWN past a small threshold,
 * `false` when scrolling up or within the top region. rAF-throttled so
 * the scroll listener stays cheap. A 4px movement deadzone filters
 * micro-jitter from trackpads and inertia flicks.
 *
 * Shared by `LandingNav` (auto-hide itself) and `DemoPillNav` (snap to
 * top-0 when nav is hidden so there's no 64-px dead strip). Both
 * compute the result independently from the same scrollY — no store
 * coupling required.
 *
 * @dependencies react
 * @related client/src/features/landing/components/LandingNav.tsx
 * @related client/src/features/landing/components/DemoPillNav.tsx
 */

import { useEffect, useRef, useState } from 'react'

// ─── Hook ──────────────────────────────────────────────────────

export function useHideOnScrollDown(threshold = 80): boolean {
  const [isHidden, setIsHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = (): void => {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY
        if (y < threshold) {
          setIsHidden(false)
          lastY.current = y
        } else if (Math.abs(y - lastY.current) > 4) {
          setIsHidden(y > lastY.current)
          lastY.current = y
        }
        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  return isHidden
}
