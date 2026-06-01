/**
 * @file LandingNav.tsx — Sticky top nav for the public landing page
 * @module client/features/landing/components
 *
 * Desktop: logo on the left, Features/Architecture/GitHub middle links,
 * and (ThemeToggle · Sign in · Get started) CTAs on the right.
 *
 * Mobile (<md): middle links hide and become a hamburger that opens
 * a Sheet drawer containing them stacked vertically, plus the CTAs.
 * ThemeToggle stays visible at every size so the user can switch
 * palette regardless of screen width.
 *
 * @dependencies react-router-dom, lucide-react, @core/stores, @core/components/ui/{button,sheet}
 * @related client/src/features/landing/pages/Landing.tsx — parent page
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Layers, Menu } from 'lucide-react'

import { ROUTES } from '@core/config'
import { cn } from '@core/lib'
import { useAuthStore } from '@core/stores'
import { Button } from '@core/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@core/components/ui/sheet'

import { useHideOnScrollDown } from '../hooks/useHideOnScrollDown'

import { ThemeToggle } from './ThemeToggle'

// ─── Nav Links (shared by desktop + mobile drawer) ─────────────

/**
 * Hash targets are prefixed with `/` so they work from any route, not
 * just the landing. When clicked from `/contact`, React Router navigates
 * to the landing page and `Landing.tsx`'s hash-scroll effect smooth-scrolls
 * to the matching section on mount.
 */
const NAV_LINKS: {
  to: string
  label: string
  external?: boolean
}[] = [
  { to: '/#features',     label: 'Features' },
  { to: '/#demo',         label: 'Demo' },
  { to: '/#architecture', label: 'Architecture' },
  { to: '/#about',        label: 'About' },
  { to: ROUTES.CONTACT,   label: 'Contact' },
  { to: 'https://github.com/Vishnu-BP/worknest', label: 'GitHub', external: true },
]

// ─── Component ─────────────────────────────────────────────────

export function LandingNav(): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mobileOpen, setMobileOpen] = useState(false)
  // Auto-hide the nav when the user scrolls down, reveal it on scroll up.
  // Always visible near the top and when the mobile drawer is open.
  const isHidden = useHideOnScrollDown() && !mobileOpen

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl',
        'transition-transform duration-300 will-change-transform',
        isHidden ? '-translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* ─── Logo + Wordmark ───────────────────────────── */}
        <Link to={ROUTES.LANDING} className="flex items-center gap-2 text-text">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">WorkNest</span>
        </Link>

        {/* ─── Desktop middle links ──────────────────────── */}
        <div className="hidden items-center gap-8 text-sm text-text-muted md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-text"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        {/* ─── Right cluster ─────────────────────────────── */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop CTAs (Sign-in + Get-started before the toggle) */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link to={ROUTES.HOME}>
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.AUTH}>Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={ROUTES.AUTH}>
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Theme toggle sits at the far-right edge of the bar.
              Big left margin on desktop so it visually detaches from
              the CTA cluster — feels like its own utility control. */}
          <div className="md:ml-16">
            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-6 bg-background">
              <span className="text-xs uppercase tracking-widest text-text-dim">
                Menu
              </span>

              {/* Stacked nav links */}
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-text"
                      >
                        {link.label}
                      </Link>
                    )}
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border/60 pt-4">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link to={ROUTES.HOME}>
                        Open workspace
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={ROUTES.AUTH}>Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link to={ROUTES.AUTH}>
                          Get started
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

