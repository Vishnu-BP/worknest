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
  LANDING: '/',
  AUTH: '/auth',
  CONTACT: '/contact',
  INVITE_ACCEPT: '/invitations/accept',

  // ─── Protected ───────────────────────────────────────
  /**
   * Authenticated entry point. Renders `HomeRedirect` which forwards
   * to last-visited workspace or `/onboarding` for new users.
   * Distinct from `LANDING` so the public marketing page at `/` can
   * coexist with the authed redirect flow.
   */
  HOME: '/app',
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
  PROJECT_CHAT: (slug: string, projectId: string) =>
    `/w/${slug}/projects/${projectId}/chat`,
  PROJECT_CHAT_CHANNEL: (slug: string, projectId: string, channelId: string) =>
    `/w/${slug}/projects/${projectId}/chat/${channelId}`,
} as const
