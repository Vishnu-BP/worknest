/**
 * @file tailwind.config.ts — Tailwind CSS configuration with design tokens
 * @module client
 *
 * All colors, fonts, spacing, and border radii from docs/design-tokens.md
 * are defined here as CSS variable references. Dark theme is the default
 * and only theme — light theme is a future enhancement.
 *
 * @dependencies tailwindcss
 * @related client/src/index.css — CSS variable definitions
 */

import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Base Colors ─────────────────────────────────
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-dim': 'var(--color-text-dim)',

        // ─── Semantic Colors ─────────────────────────────
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',

        // ─── Priority Colors ─────────────────────────────
        'priority-urgent': 'var(--color-priority-urgent)',
        'priority-high': 'var(--color-priority-high)',
        'priority-medium': 'var(--color-priority-medium)',
        'priority-low': 'var(--color-priority-low)',
        'priority-none': 'var(--color-priority-none)',

        // ─── Status Colors ──────────────────────────────
        'status-backlog': 'var(--color-status-backlog)',
        'status-todo': 'var(--color-status-todo)',
        'status-in-progress': 'var(--color-status-in-progress)',
        'status-in-review': 'var(--color-status-in-review)',
        'status-done': 'var(--color-status-done)',
        'status-cancelled': 'var(--color-status-cancelled)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
