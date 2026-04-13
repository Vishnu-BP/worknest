# CLAUDE.md — WorkNest

> Multi-tenant SaaS project management tool (simplified Linear/Jira).
> Monorepo: React frontend + Express backend + shared types.
> Goal: Portfolio project proving system design & architecture for full stack interviews.

## Commands

```bash
# Client (React + Vite)
cd client && npm run dev          # Start dev server
cd client && npm run build        # Production build
cd client && npm run lint         # ESLint
cd client && npm run typecheck    # TypeScript check

# Server (Express)
cd server && npm run dev          # Start with nodemon
cd server && npm run build        # Compile TypeScript
cd server && npm run lint         # ESLint
cd server && npm run typecheck    # TypeScript check

# Database
cd server && npm run db:generate  # Generate Drizzle migrations
cd server && npm run db:migrate   # Apply migrations
cd server && npm run db:seed      # Seed test data

# Testing
cd client && npm run test         # Vitest (unit)
cd server && npm run test         # Vitest + Supertest (API)
npm run test:e2e                  # Playwright (E2E)
```


## Tech Stack — USE ONLY THESE

**Frontend:** React 18, Vite, TypeScript (strict), Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Router 6, dnd-kit, React Hook Form + Zod, Supabase Realtime

**Backend:** Express, TypeScript (strict), Drizzle ORM, PostgreSQL (Supabase), Supabase Auth, Zod, Resend, express-rate-limit, http-errors, cors

**Infra:** Vercel (frontend), Render (backend), GitHub Actions, Vitest, Supertest, Playwright, Sentry, UptimeRobot

**NEVER use:** Next.js, Prisma, Redux, Styled Components, MUI, MongoDB, Passport.js, Socket.io, or any package not listed above without explicit approval.

## Environment Variables

**Server `.env`:** `PORT`, `NODE_ENV`, `DATABASE_URL` (pooled), `DIRECT_DATABASE_URL` (migrations), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL` (CORS origin), `RESEND_API_KEY`, `SENTRY_DSN`

**Client `.env`:** `VITE_API_URL` (backend URL), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`

Both packages MUST have `.env.example` files committed to git (with placeholder values, no real secrets). Real `.env` files are in `.gitignore`.

## Architecture

### System Flow

```
React (Vite + TypeScript + Tailwind)
    ↕ HTTP (REST) + WebSocket (Supabase Realtime)
Express API (TypeScript + Zod)
    ↕ SQL via Drizzle ORM
Supabase PostgreSQL (RLS enforced)
    ↕ Realtime broadcasts → React cache invalidation → re-render
```

### Data Flow — NEVER skip layers

```
Component → Hook (TanStack Query) → API Client (api.ts + JWT)
  → CORS → Rate Limiter → Auth MW → Workspace MW → RBAC MW
  → Route Handler → Service → Drizzle → PostgreSQL (RLS)
  → Response flows back
```

- Routes ONLY parse requests and call services
- Services ONLY contain business logic — NO HTTP/Express awareness
- Services are the ONLY layer that talks to the database
- Components NEVER call APIs directly — always through hooks

### State Management

| Data | Tool | Never... |
|---|---|---|
| Server data (API) | TanStack Query | ...put in Zustand |
| UI state (browser) | Zustand | ...put in TanStack Query |
| Form inputs | React Hook Form | ...put in Zustand |
| Derived data | Compute inline | ...store separately |
| URL state | React Router | ...duplicate in stores |

### TanStack Query Conventions

Query key factory per resource (exported for invalidation):

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => [...taskKeys.all, projectId] as const,
  detail: (taskId: string) => ['task', taskId] as const,
}
```

Stale times: workspace/labels = long (minutes), tasks = short (30s).
Invalidation sources: mutation `onSuccess`, Supabase Realtime events, window focus.

### Zustand Store Rules

- One store per concern: `uiStore`, `filterStore`, `authStore`
- Every store MUST have a `reset()` action
- Selective subscriptions: `useUIStore((s) => s.isSidebarCollapsed)` — never `useUIStore()`
- Outside React: `useAuthStore.getState().currentUser`

### Sign-Out Cleanup

Centralized `cleanupOnSignOut()` in `client/src/lib/cleanup.ts` — resets ALL stores, clears query cache, unsubscribes Realtime. Update whenever a new store is added.

### Dependency Direction

```
shared/            ← imported by → client/, server/
client/lib/        ← imported by → hooks/, components/, pages/
client/hooks/      ← imported by → components/, pages/
server/db/         ← imported by → services/ ONLY
server/services/   ← imported by → routes/ ONLY
```

- `client/` NEVER imports from `server/` (and vice versa) — only `shared/`
- `routes/` NEVER imports from `db/` — go through `services/`
- `components/` NEVER imports from `pages/`
- Feature components (`board/`) NEVER import from other features (`member/`)

### Multi-Tenancy

- Every table (except `users`) has `workspace_id`. Every query filters by it.
- `workspace_id` on `tasks` is intentionally redundant for fast RLS checks.

### Three-Layer Auth

1. **Frontend:** Hide UI by role (cosmetic — never trust)
2. **Express middleware:** Verify JWT → membership → role (primary defense)
3. **Database RLS:** Enforce tenant isolation (safety net)

### Error Resilience

- Isolated try/catch — one service failure never blocks another
- Graceful degradation — Realtime fails? Board still works via refetch on focus
- Retry with backoff for network errors — never retry 401/403
- Centralized error handler catches all via `next(error)`
- **Global API error handler in `api.ts`:** 401 → attempt token refresh → if fails, `cleanupOnSignOut()` + redirect to login. 403 → toast "No permission." 500 → toast "Something went wrong" + log to Sentry.
- **Toast system:** use `sonner` (lightweight toast library) for all user-facing notifications.

### Optimistic Updates — ONLY for:

Drag-and-drop moves, column reordering, inline title edits. Everything else uses normal loading states.

### Design Principles
- **Write code like a senior engineer. Every file must be:**
    - **Understandable** — someone new should read it and get it without asking anyone
    - **Scalable** — easy to extend without modifying existing code
    - **Maintainable** — clear structure, proper comments, no magic numbers
    - **Properly commented** — explain WHY, not WHAT (the code shows what)

- **Single Responsibility** — one file, one job. A route doesn't validate, query, and format. Each layer does one thing.
- **Separation of Concerns** — routes handle HTTP, services handle logic, Drizzle handles data. Never mix layers.
- **Defense in Depth** — three auth layers (frontend → middleware → RLS). No single point of failure.
- **Fail Gracefully** — if a non-critical service breaks, the app continues with reduced functionality, never crashes.
- **Composition over Inheritance** — small components composed together, not deep class hierarchies.
- **DRY (Don't Repeat Yourself)** — shared types in `/shared`, shared validation via Zod, barrel exports for reuse.
-
## Coding Standards — Apply to EVERY file

### File Headers

Every file MUST start with:

```typescript
/**
 * @file filename.ts — one-line purpose
 * @module client/hooks | server/services | etc.
 *
 * 2-3 sentences: what it does, why it exists, its architectural role.
 *
 * @dependencies key external deps
 * @related related files
 */
```

### Section Separators

Files over 50 lines use: `// ─── Section Name ─────────────────────────────────`

### Naming

| Type | Convention | Example |
|---|---|---|
| Component file | PascalCase.tsx | `TaskCard.tsx` |
| Hook file | camelCase with "use" | `useTasks.ts` |
| Store file | camelCase + "Store" | `uiStore.ts` |
| Service/Route/Middleware | resource.suffix.ts | `task.service.ts`, `task.routes.ts`, `auth.middleware.ts` |
| Schema/Validator/Type | resource.suffix.ts | `task.schema.ts`, `task.validators.ts`, `task.types.ts` |
| Variables | camelCase | `taskList`, `isLoading` |
| Functions | camelCase, verb-first | `createTask()`, `getMemberRole()` |
| Constants | UPPER_SNAKE_CASE | `MAX_INVITE_EXPIRY_HOURS` |
| Types/Interfaces | PascalCase, no "I" prefix | `Task`, `CreateTaskInput` |
| Booleans | is/has/can/should prefix | `isLoading`, `hasPermission` |
| Handlers | handle prefix | `handleDragEnd` |
| DB tables | snake_case, plural | `task_labels` |
| DB columns | snake_case | `workspace_id` |

### Tagged Loggers — No raw `console.log`. Ever.

```typescript
import { createLogger } from '@/lib/logger'
const log = createLogger('BOARD')
log.info('Optimistic update: moved task', taskId)
```

Tags: `AUTH`, `API`, `BOARD`, `WS`, `STORE`, `UI`, `DB`, `RBAC`, `MAIL`, `MW`.

### Barrel Exports

Every folder with a public API gets an `index.ts`. Import from barrel, never internal files.

### TypeScript

- `strict: true` — no exceptions
- No `any` — use `unknown` and narrow
- No `@ts-ignore` without a WHY comment
- Explicit return types on exports
- `import type` for type-only imports

### Import Order

1. External libs → 2. `@shared/` → 3. `@/` internal → 4. Relative (max 2 levels) → 5. Type-only

### File Size Limits

Components: 200 lines. Services: 300. Routes: 200. Utilities: 150. Split before continuing.

### Comments

Explain WHY, not WHAT. Never reference refactoring history.

### Code Discipline

- **Reuse before creating** — search codebase first
- **File deletion** — allowed during early phases (pre-deployment). After deployment, rename with `_DEPRECATED`
- **Simplicity over cleverness** — readable > clever
- **No magic numbers** — named constants only
- **No default exports** — named exports only
- **Isolated try/catch** — one failure never crashes another
- **File headers** required on all files > 20 lines. Optional on barrel `index.ts` re-exports.

## Workflow

1. Read the task fully before writing any code.
2. Write a plan to `tasks/todo.md` with a checklist.
3. **STOP and wait for approval** before coding.
4. Implement one item at a time, marking each done.
5. After each step, explain what changed and why.
6. Keep changes minimal — simplicity is key.
7. Never delete completed work from `tasks/todo.md` — move to "Completed Work Log" section.

**If ambiguous → ASK.** Do not assume.
**If it conflicts with this file → FLAG IT.** Do not proceed.

### Git Strategy

- **Branches:** `main` (production), `feat/description`, `fix/description`, `chore/description`
- **Commits:** conventional format — `feat(board): implement drag-and-drop`, `fix(auth): handle expired token`
- **Merge** feature branches to `main` when phase is complete and tested
- **No force pushes** to `main`

## Database Quick Reference

**Tables (10):** users, workspaces, members, invitations, projects, tasks, labels, task_labels, comments, activity_log

**Roles:** owner → admin → member → viewer

**Task statuses:** backlog, todo, in_progress, in_review, done, cancelled

**Priorities:** urgent, high, medium, low, none

## Reference Documents — Read BEFORE relevant tasks

**IMPORTANT:** Read the relevant doc below before starting any task in that area. These contain patterns, schemas, and rules that MUST be followed.

| Document | Read when... |
|---|---|
| `@docs/database-schema.md` | Any database work (full schema, RLS policies, migration workflow) |
| `@docs/api-design.md` | Adding or modifying API endpoints (full endpoint map, middleware chain, response format) |
| `@docs/kanban-architecture.md` | Drag-and-drop, fractional indexing, optimistic updates, real-time sync |
| `@docs/auth-and-rbac.md` | Auth flows, JWT handling, role permissions, invitation system |
| `@docs/design-tokens.md` | Colors, typography, spacing, component theming |
| `@docs/component-architecture.md` | Component hierarchy, layout system, smart vs dumb components |
