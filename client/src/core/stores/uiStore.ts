/**
 * @file uiStore.ts — Zustand store for UI state
 * @module client/core/stores
 *
 * Manages browser-only UI state: sidebar collapse, active modals.
 * This store holds NO server data — only visual/interaction state.
 * Reset by cleanupOnSignOut() during sign-out.
 *
 * Rules (per CLAUDE.md):
 *   - Selective subscriptions: useUIStore((s) => s.isSidebarCollapsed)
 *   - Never useUIStore() without a selector
 *   - Must have reset() action for sign-out cleanup
 *
 * @dependencies zustand
 * @related client/src/core/lib/cleanup.ts — calls reset() on sign-out
 */

import { create } from 'zustand'

// ─── Types ─────────────────────────────────────────────────────

type ModalType = 'createWorkspace' | 'createProject' | null

interface UIState {
  /** Whether the sidebar is collapsed (narrow icon-only mode) */
  isSidebarCollapsed: boolean
  /** Currently open modal, or null if none */
  activeModal: ModalType
}

interface UIActions {
  /** Toggle sidebar between expanded and collapsed */
  toggleSidebar: () => void
  /** Open a specific modal */
  openModal: (modal: ModalType) => void
  /** Close the currently open modal */
  closeModal: () => void
  /** Clear all UI state — called during sign-out cleanup */
  reset: () => void
}

// ─── Initial State ─────────────────────────────────────────────

const initialState: UIState = {
  isSidebarCollapsed: false,
  activeModal: null,
}

// ─── Store ─────────────────────────────────────────────────────

export const useUIStore = create<UIState & UIActions>()((set) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  reset: () => set(initialState),
}))
