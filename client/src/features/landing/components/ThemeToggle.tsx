/**
 * @file ThemeToggle.tsx — Sun/Moon icon button that flips the theme
 * @module client/features/landing/components
 *
 * Subscribes to `useThemeStore`. Shows the Sun icon when the current
 * theme is dark (click → go light), Moon when light (click → go dark).
 * Intentionally minimal — no dropdown or system-preference option for
 * iter 4; system preference is already respected on first load by the
 * bootstrap script in `index.html`.
 *
 * @dependencies lucide-react, @core/stores, @core/components/ui/button
 * @related client/src/core/stores/themeStore.ts — backing state
 */

import { Moon, Sun } from 'lucide-react'

import { Button } from '@core/components/ui/button'
import { useThemeStore } from '@core/stores'

// ─── Component ─────────────────────────────────────────────────

export function ThemeToggle(): JSX.Element {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
