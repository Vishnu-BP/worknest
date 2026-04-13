/**
 * @file routes.ts — Route path constants
 * @module client/core/config
 *
 * Single source of truth for all route paths used in React Router
 * navigation, AuthGuard redirects, and link components. Using constants
 * prevents typos and makes route changes a single-file edit.
 *
 * @dependencies none
 * @related client/src/App.tsx — uses these to define React Router routes
 */

export const ROUTES = {
  // ─── Public ──────────────────────────────────────────
  LOGIN: '/login',
  SIGNUP: '/signup',
  INVITE_ACCEPT: '/invitations/accept',

  // ─── Protected ───────────────────────────────────────
  HOME: '/',
  ONBOARDING: '/onboarding',

  // ─── Workspace (dynamic) ─────────────────────────────
  WORKSPACE: (slug: string) => `/w/${slug}`,
  WORKSPACE_MEMBERS: (slug: string) => `/w/${slug}/members`,
  WORKSPACE_SETTINGS: (slug: string) => `/w/${slug}/settings`,
  WORKSPACE_ACTIVITY: (slug: string) => `/w/${slug}/activity`,

  // ─── Project (dynamic) ──────────────────────────────
  PROJECT_BOARD: (slug: string, projectId: string) =>
    `/w/${slug}/projects/${projectId}/board`,
  PROJECT_LIST: (slug: string, projectId: string) =>
    `/w/${slug}/projects/${projectId}/list`,
} as const
