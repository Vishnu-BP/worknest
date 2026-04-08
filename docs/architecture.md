# Architecture

System architecture, data flow, state management, and dependency rules for WorkNest.

---

## System Architecture

```
React (Vite + TypeScript + Tailwind)
    ↕ HTTP (REST) + WebSocket (Supabase Realtime)
Express API (TypeScript + Zod)
    ↕ SQL via Drizzle ORM
Supabase PostgreSQL (RLS enforced)
    ↕ Realtime broadcasts
Back to React (cache invalidation → re-render)
```

## Data Flow — Request Lifecycle

```
Component → Hook (TanStack Query) → API Client (api.ts with JWT header)
    → CORS → Express Rate Limiter → Auth Middleware (verify JWT)
    → Workspace Middleware (verify membership, extract role)
    → RBAC Middleware (check permission)
    → Route Handler (parse request, call service)
    → Service (business logic, NO HTTP awareness)
    → Drizzle ORM → PostgreSQL (RLS enforced)
    → Response flows back through each layer
```

Routes ONLY parse requests and call services. Services ONLY contain business logic. Services are the ONLY layer that talks to the database.

## State Management

| Data Type | Tool | Examples |
|---|---|---|
| Server data (from API) | TanStack Query | Tasks, projects, members, comments |
| UI state (browser only) | Zustand | Sidebar, filters, modals, view mode |
| Form state | React Hook Form | Task creation form, workspace settings |
| Derived data | Compute, don't store | Task count per column, filtered list |
| URL state | React Router | Workspace slug, project ID |

Never put server data in Zustand. Never put UI state in TanStack Query. Never store what you can derive.

## TanStack Query Conventions

Query key factory per resource (exported for invalidation):

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => [...taskKeys.all, projectId] as const,
  detail: (taskId: string) => ['task', taskId] as const,
}
```

Stale times: workspace/labels = long (minutes), tasks = short (30s), activity = short.

Cache invalidation sources: user mutations (`onSuccess`), Supabase Realtime events, window focus refetch.

## Zustand Store Rules

- One store per concern: `uiStore`, `filterStore`, `authStore`
- Every store MUST have a `reset()` action (for sign-out cleanup)
- Use selective subscriptions: `useUIStore((s) => s.isSidebarCollapsed)` — never `useUIStore()`
- Access outside React with `.getState()` when needed in utilities

## Sign-Out Cleanup

Centralized `cleanupOnSignOut()` in `client/src/lib/cleanup.ts`:
1. Reset ALL Zustand stores
2. Clear TanStack Query cache (`queryClient.clear()`)
3. Unsubscribe Realtime channels

Update this function every time a new store is added.

## Dependency Direction

```
shared/           ← imported by → client/, server/
client/lib/       ← imported by → hooks/, components/, pages/
client/hooks/     ← imported by → components/, pages/
client/stores/    ← imported by → hooks/, components/, pages/
server/db/        ← imported by → services/ ONLY
server/services/  ← imported by → routes/ ONLY
server/middleware/ ← imported by → routes/ ONLY
```

- `client/` NEVER imports from `server/` (and vice versa)
- `routes/` NEVER imports from `db/` — go through `services/`
- `components/` NEVER imports from `pages/`
- Feature components (board/) NEVER import from other features (member/)

## Multi-Tenancy

- Every table (except `users`) has `workspace_id`
- Every query MUST filter by `workspace_id`
- `workspace_id` on `tasks` is intentionally redundant (for fast RLS)
- Application code is primary defense, RLS is the safety net

## Three-Layer Authorization

1. **Frontend:** Hide UI elements by role (cosmetic only — never trust)
2. **Express middleware:** Verify JWT → check membership → check role (primary)
3. **Database RLS:** Enforce tenant isolation (safety net)

## Error Resilience

- Isolated try/catch per service — one failure never blocks another
- Graceful degradation — if Realtime fails, board still works via refetch
- Retry with backoff for network errors — never retry auth errors (401/403)
- Centralized Express error handler catches all errors via `next(error)`

## Optimistic Updates — Use ONLY For

- Drag-and-drop task moves (must feel instant)
- Reordering within a column
- Inline title editing

Everything else (create, delete, comments, member changes) uses normal loading states.
