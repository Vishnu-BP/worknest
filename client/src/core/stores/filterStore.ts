/**
 * @file filterStore.ts — Zustand store for board filter state
 * @module client/core/stores
 *
 * Manages client-side filter state for the Kanban board. Filters are
 * applied to the cached task list — no API call needed, instant re-render.
 * Reset by cleanupOnSignOut() during sign-out.
 *
 * Rules (per CLAUDE.md):
 *   - Selective subscriptions: useFilterStore((s) => s.statusFilter)
 *   - Must have reset() action for sign-out cleanup
 *
 * @dependencies zustand
 * @related client/src/features/task/components/KanbanView.tsx — applies these filters
 */

import { create } from 'zustand'

import type { Priority, TaskStatus } from '@worknest/shared'

// ─── Types ─────────────────────────────────────────────────────

interface FilterState {
  /** Selected statuses to show (empty = show all) */
  statusFilter: TaskStatus[]
  /** Selected priorities to show (empty = show all) */
  priorityFilter: Priority[]
  /** Selected assignee user ID (null = show all) */
  assigneeFilter: string | null
}

interface FilterActions {
  setStatusFilter: (statuses: TaskStatus[]) => void
  setPriorityFilter: (priorities: Priority[]) => void
  setAssigneeFilter: (userId: string | null) => void
  /** Clear all filters — called during sign-out cleanup */
  reset: () => void
}

// ─── Initial State ─────────────────────────────────────────────

const initialState: FilterState = {
  statusFilter: [],
  priorityFilter: [],
  assigneeFilter: null,
}

// ─── Store ─────────────────────────────────────────────────────

export const useFilterStore = create<FilterState & FilterActions>()((set) => ({
  ...initialState,

  setStatusFilter: (statuses) => set({ statusFilter: statuses }),
  setPriorityFilter: (priorities) => set({ priorityFilter: priorities }),
  setAssigneeFilter: (userId) => set({ assigneeFilter: userId }),

  reset: () => set(initialState),
}))
