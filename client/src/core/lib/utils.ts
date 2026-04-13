/**
 * @file utils.ts — Shared client utility functions
 * @module client/core/lib
 *
 * General-purpose utilities used across the frontend.
 * cn() merges Tailwind CSS classes with conflict resolution —
 * required by shadcn/ui components for conditional class application.
 *
 * @dependencies clsx, tailwind-merge
 * @related client/src/core/components/ui/ — shadcn/ui components use cn()
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with intelligent conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * Example: cn('px-4 py-2', isActive && 'bg-primary', 'px-6')
 * Result: 'py-2 bg-primary px-6' (px-4 overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
