/**
 * @file keys.ts — TanStack Query key factories
 * @module client/core/lib
 *
 * Centralized query key definitions for all resources. Each resource
 * exports a key factory object with methods that return readonly tuples.
 * These are used in useQuery/useMutation for cache management and
 * invalidation. Exported for use in mutation onSuccess callbacks.
 *
 * Pattern from CLAUDE.md:
 *   queryKey: workspaceKeys.list()
 *   queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
 *
 * @dependencies none
 * @related client/src/features/ — hook consumers of these keys
 */

// ─── Workspace Keys ────────────────────────────────────────────

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => [...workspaceKeys.all, 'list'] as const,
  detail: (slug: string) => [...workspaceKeys.all, 'detail', slug] as const,
}

// ─── Member Keys ───────────────────────────────────────────────

export const memberKeys = {
  all: ['members'] as const,
  byWorkspace: (slug: string) => [...memberKeys.all, slug] as const,
}

// ─── Project Keys (Phase 7) ────────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  byWorkspace: (slug: string) => [...projectKeys.all, slug] as const,
  detail: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
}

// ─── Task Keys (Phase 8) ──────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => [...taskKeys.all, projectId] as const,
  detail: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
}

// ─── Comment Keys (Phase 10) ──────────────────────────────────

export const commentKeys = {
  all: ['comments'] as const,
  byTask: (taskId: string) => [...commentKeys.all, taskId] as const,
}

// ─── Label Keys (Phase 10) ────────────────────────────────────

export const labelKeys = {
  all: ['labels'] as const,
  byWorkspace: (slug: string) => [...labelKeys.all, slug] as const,
}

// ─── Activity Keys (Phase 10) ─────────────────────────────────

export const activityKeys = {
  all: ['activity'] as const,
  byWorkspace: (slug: string) => [...activityKeys.all, slug] as const,
}
