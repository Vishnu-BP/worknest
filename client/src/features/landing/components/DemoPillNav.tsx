/**
 * @file DemoPillNav.tsx — Sticky scroll-spy pill for the Demo section
 * @module client/features/landing/components
 *
 * Slack-style rounded pill bar that pins below the top nav while the
 * Demo section is in view. Four pills (Flow · Board · Palette · Roles)
 * track scroll position via IntersectionObserver. An absolute-positioned
 * indicator slides under the active pill with a 300ms CSS transition —
 * no animation library required.
 *
 * Because the pill lives INSIDE the Demo section, `position: sticky`
 * naturally un-pins when the user scrolls past Demo. Mounted once; the
 * sub-demos provide the scroll targets via their `id` props.
 *
 * @dependencies react, @core/lib
 * @related client/src/features/landing/hooks/useScrollSpy.ts — active-id source
 * @related client/src/features/landing/components/DemoSubSection.tsx — ids
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@core/lib'

import { useHideOnScrollDown } from '../hooks/useHideOnScrollDown'
import { useScrollSpy } from '../hooks/useScrollSpy'

// ─── Pill Config ───────────────────────────────────────────────

interface Pill {
  id: string
  label: string
}

const PILLS: Pill[] = [
  { id: 'demo-flow',    label: 'Flow' },
  { id: 'demo-board',   label: 'Board' },
  { id: 'demo-palette', label: 'Command palette' },
  { id: 'demo-roles',   label: 'Roles' },
]

const PILL_IDS = PILLS.map((p) => p.id)

// ─── Component ─────────────────────────────────────────────────

export function DemoPillNav(): JSX.Element {
  const activeId = useScrollSpy(PILL_IDS) ?? PILLS[0]!.id
  // When the top nav auto-hides, fill the gap by snapping the pill to
  // the very top of the viewport. When the nav is visible, sit below it.
  const isNavHidden = useHideOnScrollDown()

  // Refs for each pill button so we can measure its position.
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  })

  // Measure the active pill and animate the indicator.
  // useLayoutEffect so the indicator position is written before paint
  // (avoids a one-frame flash at the old position on first render).
  useLayoutEffect(() => {
    const activeEl = pillRefs.current[activeId]
    if (!activeEl) return
    setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth })
  }, [activeId])

  // Re-measure on window resize so the indicator stays aligned.
  useEffect(() => {
    const onResize = (): void => {
      const activeEl = pillRefs.current[activeId]
      if (!activeEl) return
      setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeId])

  // Clicking a pill smooth-scrolls to its section.
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div
      className={cn(
        'sticky z-30 flex justify-center px-4 py-3',
        'transition-[top] duration-300 ease-out',
        isNavHidden ? 'top-0' : 'top-16',
      )}
    >
      <div className="relative inline-flex items-center gap-1 overflow-x-auto rounded-full border border-border/60 bg-background/80 p-1 shadow-lg backdrop-blur-xl">
        {/* Sliding active-pill indicator. Anchor with `left` directly
            (not translateX) so it measures from the container's inner
            edge and lines up with the active button's `offsetLeft`.
            Solid primary fill — the active label reads white on top. */}
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-full bg-primary shadow-md transition-all duration-300 ease-out"
          style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }}
        />

        {PILLS.map((pill) => {
          const isActive = pill.id === activeId
          return (
            <button
              key={pill.id}
              ref={(el) => {
                pillRefs.current[pill.id] = el
              }}
              type="button"
              onClick={() => scrollToId(pill.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:px-4 md:text-sm',
                isActive ? 'text-white' : 'text-text-muted hover:text-text',
              )}
            >
              {pill.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
