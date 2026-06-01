/**
 * @file themeStore.ts — Zustand store for dark/light theme
 * @module client/core/stores
 *
 * Single source of truth for the active color theme. The actual palette
 * flip is done via `document.documentElement.classList` — this store
 * mirrors that state so React components can subscribe.
 *
 * Initial state is read from `<html>` on first access, which is set
 * by the inline script in `index.html` (either from localStorage or
 * the user's OS preference). That keeps hydration in sync without a
 * flash of wrong theme.
 *
 * `toggleTheme` and `setTheme` update both the DOM class and
 * localStorage so the choice persists across reloads.
 *
 * @dependencies zustand
 * @related client/index.html — inline bootstrap script
 * @related client/src/features/landing/components/ThemeToggle.tsx — UI
 */

import { create } from 'zustand'

// ─── Types ─────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
}

interface ThemeActions {
  /** Flip between dark and light */
  toggleTheme: () => void
  /** Force a specific theme */
  setTheme: (theme: Theme) => void
}

// ─── Helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'worknest_theme'

/** Read the current theme from the <html> classList (set by index.html). */
function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

/** Write the theme to the DOM + localStorage. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage disabled — theme still applies for this session */
  }
}

// ─── Store ─────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState & ThemeActions>()((set, get) => ({
  theme: readInitialTheme(),

  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
