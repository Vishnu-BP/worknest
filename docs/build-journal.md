# WorkNest — Build Journal (Phases 1-9)

> Detailed record of everything built, every decision made, and why.
> Written after completing Phases 1-9 as a retrospective document.

---

## Project Overview

**WorkNest** is a multi-tenant SaaS project management tool (simplified Linear/Jira) built as a portfolio project for full-stack interviews. It demonstrates: multi-tenancy with PostgreSQL RLS, role-based access control at three layers (frontend → middleware → database), real-time collaboration via WebSockets, optimistic UI updates, and fractional indexing for drag-and-drop ordering.

**Monorepo:** `client/` (React) + `server/` (Express) + `shared/` (types + validators)

---

## Phase 1 — Monorepo Foundation + Shared Types

### What Was Done
- Created npm workspaces monorepo linking three packages
- Set up TypeScript strict mode across all packages via `tsconfig.base.json`
- Defined all 6 enum groups (Role, TaskStatus, Priority, InvitationStatus, ActivityAction, EntityType) as const objects with derived union types
- Created 10 entity type interfaces (User, Workspace, Member, Invitation, Project, Task, Label, Comment, ActivityLog, API responses)
- Created 8 Zod validator schemas for API request validation (shared between frontend forms and backend routes)
- Set up Vite (client) and Express (server) with cross-package import resolution

### Why
Everything else depends on this foundation. The shared types are the **contract** between frontend and backend — a single `Task` type imported by both ensures they agree on data shape. Zod schemas validate the same data in two places (browser forms and API routes) from one definition. Without this, you'd have drift between what the frontend sends and what the backend expects.

### Key Decisions
- **Const objects over TS enums** — better tree-shaking, works as both runtime values AND types. `TASK_STATUS.TODO` gives you the string `'todo'` at runtime; `TaskStatus` gives you the union type at compile time.
- **No build step for shared/** — consumed as raw TypeScript via project references. Simpler dev loop.
- **`workspace:*`** initially used for npm workspace linking — changed to `"*"` because npm 10 doesn't support the `workspace:` protocol (that's pnpm/yarn).
- **Removed `"type": "module"`** from server and client packages — `tsx` (server) and Vite (client) handle ESM natively; the flag caused resolution issues with the shared package.

### Issues Encountered
- `workspace:*` protocol not supported by npm → fixed with `"*"`
- `"type": "module"` forced strict ESM, breaking `tsx`'s cross-package resolution → removed

---

## Phase 2 — Database Schema + Supabase Setup

### What Was Done
- Created Zod-validated environment config (`server/src/config/env.ts`) that fails fast on startup if any required env var is missing
- Set up Drizzle ORM client with pooled connection (port 6543)
- Created all 10 PostgreSQL tables via Supabase MCP migration: users, workspaces, members, invitations, projects, tasks, labels, task_labels, comments, activity_log
- Created 6 PostgreSQL ENUMs matching the shared type enums exactly
- Created 3 RLS helper functions (SECURITY DEFINER) for tenant isolation
- Created 35 RLS policies enforcing row-level security per the RBAC permission matrix
- Created 2 trigger functions: user sync (auth.users → public.users) and auto-updated_at
- Wrote Drizzle schema files (one per table) mapping TypeScript to the existing PostgreSQL tables
- Wrote Drizzle relations for the relational query API
- Created a seed script populating realistic test data (2 users, 1 workspace, 2 projects, 8 tasks, labels, comments, activity)

### Why
The database is the foundation of multi-tenancy. RLS ensures tenant isolation at the database level — even if the application code has a bug and forgets to filter by workspace_id, the database rejects unauthorized queries. The trigger functions guarantee data consistency (user sync, timestamps) regardless of how data is modified (API, SQL, migration).

### Key Decisions
- **MCP-first approach** — created tables/RLS/triggers via raw SQL through Supabase MCP, then wrote Drizzle schemas to match. This is simpler than Drizzle migrations because RLS and triggers can't be managed by Drizzle.
- **`tasks.workspace_id` intentionally redundant** — derivable from `project_id` but stored directly for fast RLS checks (avoids expensive joins in policies).
- **`assignee_id ON DELETE SET NULL`** — not CASCADE. If a user is deleted, their assigned tasks become unassigned, not deleted.
- **`SECURITY DEFINER` on helper functions** — prevents infinite recursion when RLS policies call `is_workspace_member()` which queries the RLS-protected `members` table.
- **Connection pooler host** — `aws-1-ap-southeast-2.pooler.supabase.com` (NOT `aws-0`). The shard number is project-specific and must come from the Supabase dashboard.

### Issues Encountered
- Wrong pooler hostname (`aws-0` vs `aws-1`) → "Tenant or user not found" errors. Fixed by getting the exact connection string from the Supabase dashboard.
- Password with `@` symbols caused URL parsing issues → reset to a simpler password without special characters.
- Direct database host (`db.xxx.supabase.co`) is IPv6-only → doesn't work on IPv4 home networks. Both `DATABASE_URL` and `DIRECT_DATABASE_URL` now use the pooler.
- Drizzle 0.33 API for `pgTable` extra config uses `(table) => ({...})` object format, not array. Fixed in 5 schema files.

---

## Phase 3 — Express Server Foundation

### What Was Done
- Created `app.ts` separate from `index.ts` (for Supertest testability)
- Built the full middleware chain: CORS → JSON parser → request logger → routes → 404 catch-all → error handler
- Created tagged logger factory (`createLogger('TAG')`) with 10 tags and 4 log levels
- Created 6 HTTP error helper functions (badRequest, unauthorized, forbidden, notFound, conflict, tooManyRequests)
- Created 3-tier rate limiting: read (100/min), write (30/min), strict (20/hr)
- Created Zod validation middleware factory (`validate(schema, source)`)
- Created centralized error handler catching HttpError, ZodError, and unknown errors
- Created health check endpoint with database ping

### Why
Every API endpoint for the next 9 phases plugs into this middleware chain. Without centralized error handling, each route would need its own try/catch formatting. Without rate limiting, the API is vulnerable to brute-force attacks. Without the tagged logger, debugging production issues is impossible.

### Key Decisions
- **Rate limiters applied per-route, not globally** — GET endpoints get 100/min (generous for browsing), POST/PATCH/DELETE get 30/min (moderate for writes), auth/invitations get 20/hr (strict for security-sensitive operations).
- **Error handler has exactly 4 parameters** — Express identifies error handlers by their 4-parameter signature `(err, req, res, next)`. Removing `next` (even unused) breaks error routing entirely.
- **Health check always returns 200** — even if the database is down, it returns `{ status: "degraded", database: false }`. This lets monitoring tools (UptimeRobot) distinguish "app is up but DB is down" from "app is down entirely."

---

## Phase 4 — Authentication + Codebase Restructure

### What Was Done

**Codebase Restructure:**
- Moved from layer-based (`routes/`, `services/`, `middleware/`) to feature-based (`core/` + `modules/` on server, `core/` + `features/` on client)
- `core/` contains shared infrastructure: config, db, middleware, utils (server) and lib, config, stores, components/ui, components/common (client)
- `modules/` (server) and `features/` (client) contain self-contained business features

**Server Auth:**
- Created Express type augmentation (`types/express.d.ts`) extending Request with `user` and `membership`
- Created auth middleware using Supabase `getUser()` to verify JWTs
- Created auth module: `ensureUserExists()` (upsert), `getProfile()`, `updateProfile()`
- 3 API endpoints: POST /auth/callback, GET /auth/me, PATCH /auth/me

**Client Auth:**
- Created Supabase client init, API fetch wrapper with global error handling (401→refresh→redirect, 403→toast, 500→log)
- Created TanStack Query client config (30s default staleTime, no retry on 401/403)
- Created Zustand auth store, useAuth hook syncing Supabase `onAuthStateChange`
- Created AuthGuard component (session check → render or redirect)
- Created Login + Signup pages with React Hook Form + Zod + Google OAuth
- Set up React Router with public/protected route groups

### Why the Restructure
The layer-based structure (`routes/`, `services/`) works for small apps but becomes unwieldy with 10+ resources. In feature-based organization, everything about "auth" lives in `modules/auth/` (server) or `features/auth/` (client). A new developer opens the folder and sees the complete feature. Adding a feature = create one folder. Deleting = remove one folder.

### Key Decisions
- **Supabase `getUser()` over local JWT verification** — simpler (no extra dependency or env var), more secure (checks if user is still active, not just if token is valid), acceptable latency (~50ms per request).
- **`@core/` and `@features/` path aliases** — added to Vite config + tsconfig for clean imports. `import { api } from '@core/lib'` instead of `'../../../core/lib'`.
- **Global error handler in `api.ts`** — single place handling 401 (refresh → retry → redirect), 403 (toast), 500 (toast + Sentry). All hooks inherit this automatically.
- **`cleanupOnSignOut()` centralized** — resets ALL Zustand stores, clears query cache, signs out from Supabase. Must be updated whenever a new store is added.

---

## Phase 5 — Workspace + Members Backend

### What Was Done
- Created slug generation utility with uniqueness check (retries with counter: "acme-corp" → "acme-corp-2")
- Created RBAC permissions map — single source of truth for all 23 permissions across 4 roles
- Created workspace middleware (extract slug → verify membership → attach `req.membership`)
- Created RBAC middleware (`rbac('permission')` factory)
- Created workspace module: 5 endpoints (create with transaction, CRUD, delete with cascade)
- Created member module: 3 endpoints (list with JOIN, updateRole with 4 guards, removeMember)
- Created member validator schema (updateMemberRoleSchema)

### Why
Multi-tenancy and RBAC are the two most critical architectural features. The workspace middleware ensures every workspace-scoped request is verified for membership. The RBAC middleware ensures role permissions are checked. Together they form the primary defense layer (Layer 2 of the three-layer auth).

### Key Decisions
- **Workspace creation is a transaction** — INSERT workspace + INSERT owner member atomically. Both succeed or both fail.
- **Owner protection in service layer** (not middleware) — "cannot modify the workspace owner" is a business rule, not a permission check. The RBAC middleware allows owner/admin to change roles, but the service layer adds the guard: "...except you can't change the owner."
- **Permissions map uses `Set<string>`** — O(1) lookup for `hasPermission(role, permission)`. All RBAC decisions flow through one function.
- **Admin can't create admins** — only the owner can promote to admin. This prevents privilege escalation.

---

## Phase 6 — Frontend Shell

### What Was Done
- Installed 6 more shadcn/ui components (Avatar, Badge, DropdownMenu, Dialog, Skeleton, Tooltip)
- Created uiStore (sidebar collapse, modal state)
- Created query key factories for all resources (workspace, member, project, task, comment, label, activity)
- Created 3 workspace hooks (useWorkspaces, useWorkspace, useCreateWorkspace)
- Created 3 member hooks (useMembers, useUpdateMemberRole, useRemoveMember)
- Created WorkspaceLayout (Sidebar + Header + Outlet), OnboardingLayout
- Created Sidebar (WorkspaceSwitcher, project list, settings link, collapse toggle)
- Created Header (breadcrumb + UserMenu), WorkspaceSwitcher, UserMenu, EmptyState
- Created workspace feature: CreateWorkspaceForm, WorkspaceSettings (with delete confirmation), Onboarding, WorkspaceDashboard, Settings pages
- Created member feature: MemberList (with role management), RoleBadge, Members page
- Updated App.tsx with nested routing and last workspace persistence via localStorage

### Why
This is where the app becomes navigable. Without layouts, every page would need to render its own sidebar/header. React Router's `<Outlet />` pattern lets the sidebar and header persist while only the content area swaps — no re-renders of the shell on navigation.

### Key Decisions
- **Last workspace persistence via localStorage** — `LAST_WORKSPACE_KEY` stores the slug of the last visited workspace. On login, the HomeRedirect component reads this and navigates to it. Simple, no database change needed.
- **TanStack Query key factories** — predefined for all resources (even future ones). `workspaceKeys.list()`, `taskKeys.byProject(id)`. Ensures consistent cache invalidation.
- **Smart vs dumb pattern** — Pages (smart) fetch data and pass props to components (dumb). MemberList receives `members` prop; Members page calls `useMembers()`. This makes components reusable and testable.
- **Global modals via uiStore** — CreateWorkspaceDialog is rendered in App.tsx, controlled by `uiStore.activeModal`. This avoids prop drilling and lets any component trigger it.

---

## Phase 7 — Projects (Full-Stack)

### What Was Done
- Created project server module: 5 endpoints (create with key uniqueness, CRUD)
- Created 5 client hooks (useProjects, useProject, useCreateProject, useUpdateProject, useDeleteProject)
- Created CreateProjectDialog (name + key auto-suggest + color picker + description)
- Created ProjectCard (grid card with color dot, name, key badge, task count)
- Created ProjectSidebarItem (color dot + name, active state, collapse-aware)
- Created ProjectBoard placeholder page
- Updated Sidebar to render project list from useProjects
- Updated WorkspaceDashboard to show project grid
- Added project board route to App.tsx
- Added 'createProject' to uiStore modal types

### Why
This was the first end-to-end feature module — establishing the pattern that every future feature follows: `service → routes → hooks → components → page`. Projects are containers for tasks, so they must exist before the Kanban board (Phase 9) can work.

### Key Decisions
- **Key auto-suggestion** — "Engineering" → "ENG" (first 3 uppercase letters). The key is editable by the user. Server validates uniqueness per workspace via DB constraint, catches violations as 409 Conflict.
- **Color presets** — 8 predefined colors + custom picker. Default is primary indigo (#6366f1).
- **Feature isolation** — `features/project/` contains everything about projects: hooks, components, pages, barrel. No imports from `features/member/` or `features/workspace/` (per CLAUDE.md dependency direction).

---

## Phase 8 — Tasks Backend

### What Was Done
- Created position utility (calculatePosition, shouldRebalance, rebalanceColumn) for fractional indexing
- Created activity service (logActivity — writes immutable audit trail entries)
- Created task service: 6 functions with `FOR UPDATE` lock for race-safe task number auto-increment
- Created task routes: 6 endpoints (list filterable, create, get detail, update fields, move status+position, delete)
- All mutations log to activity trail (task_created, task_updated, task_moved, task_deleted)

### Why
Tasks are the core entity. The task_number auto-increment must be race-condition safe (concurrent creates must never produce duplicate numbers). The move operation is separate from update because drag-and-drop (status + position change) is a distinct user action logged differently in the activity trail.

### Key Decisions
- **`SELECT ... FOR UPDATE` lock** — The create transaction locks the project row before reading `task_counter`. This prevents two concurrent requests from both reading counter=5 and creating task #6. The second request waits for the lock, reads counter=6, creates task #7.
- **Move vs Update separation** — `update()` changes task fields (title, description, priority). `move()` changes status + position. Different activity log entries, different optimistic update handling on the frontend.
- **Activity logging never blocks** — `logActivity()` catches its own errors. If activity logging fails, the user's action still succeeds. Activity is important but not critical enough to fail a task creation over.
- **Fractional indexing rebalancing** — After each move, checks if any gap between consecutive positions in the column is < 0.001. If so, resets all positions to clean integers (1.0, 2.0, 3.0...) in a transaction. This is rare — typically after 30+ nested insertions in one column.

---

## Phase 9 — Kanban Board UI

### What Was Done
- Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Created filterStore (Zustand: status, priority, assignee filters)
- Created 5 task hooks: useTasks, useCreateTask, useMoveTask (with optimistic updates), useUpdateTask, useDeleteTask
- Created PriorityBadge (colored icons per priority) and StatusBadge (colored dots per status)
- Created TaskCard (lightweight, no hooks: task number, title, priority, due date)
- Created TaskQuickCreate (inline input at column bottom, Enter to create)
- Created KanbanColumn (SortableContext wrapper, header with count, droppable zone)
- Created KanbanDragOverlay (floating card clone following cursor during drag)
- Created KanbanView (DndContext, 6 columns, client-side filtering, drag handlers with fractional position calculation)
- Created BoardHeader (project info + filter toggle) and BoardFilters (status/priority chip toggles)
- Replaced ProjectBoard placeholder with real Kanban board

### Why
This is the visual heart of WorkNest. The board must feel instant — drag a card and it moves immediately (optimistic update). The server round-trip happens in the background. If it fails, the card snaps back (rollback). This is the single most impressive feature for interviews because it demonstrates optimistic UI, fractional indexing, and real-time state management.

### Key Decisions
- **Optimistic move mutation** — `onMutate`: snapshot cache → cancel refetches → update cache optimistically → return snapshot. `onError`: restore snapshot → toast error. `onSettled`: invalidate cache (background refetch for consistency). User perceives instant response.
- **Client-side filtering** — Filters are applied to the already-cached task list (from TanStack Query). No API call needed — toggling a filter re-renders instantly. This works because we fetch ALL tasks for a project (typical project has <500 tasks).
- **TaskCard has NO hooks** — The card component receives all data via props. `useSortable` is applied by a `SortableTaskCard` wrapper in KanbanColumn, keeping the card itself pure and lightweight (critical when 50-100 cards render simultaneously).
- **`closestCorners` collision detection** — Better for column-based layouts than `closestCenter`. Detects which column the cursor is in, then which position within the column.
- **PointerSensor with 8px activation distance** — Prevents accidental drags when clicking. User must move 8px before drag starts.
- **`calculatePosition()` duplicated client-side** — Same algorithm as server's `position.ts`. The client needs it to compute the position before sending the PATCH request. This is acceptable duplication because the algorithm is tiny (4 lines) and must be in sync.

---

## Architecture Summary After 9 Phases

### File Counts
| Package | Files |
|---------|-------|
| Server (`server/src/`) | ~45 files |
| Client (`client/src/`) | ~83 files |
| Shared (`shared/src/`) | ~25 files |
| **Total source files** | **~153 files** |

### API Endpoints: 22 total
| Module | Endpoints |
|--------|-----------|
| Auth | 3 (callback, get me, patch me) |
| Workspaces | 5 (list, create, get, update, delete) |
| Members | 3 (list, update role, remove) |
| Projects | 5 (list, create, get, update, delete) |
| Tasks | 6 (list, create, get, update, move, delete) |

### Server Architecture
```
server/src/
├── core/                    ← Shared infrastructure
│   ├── config/              ← Zod-validated env vars
│   ├── db/                  ← Drizzle client + 10 table schemas + relations + seed
│   ├── middleware/           ← 8 middleware (auth, cors, errorHandler, rateLimiter, rbac, requestLogger, validate, workspace)
│   ├── utils/               ← 5 utilities (logger, httpErrors, slug, permissions, position)
│   └── health/              ← Health check endpoint
├── modules/                  ← Feature modules (each: service + routes + barrel)
│   ├── auth/
│   ├── workspace/
│   ├── member/
│   ├── project/
│   ├── task/
│   └── activity/            ← logActivity service
├── types/                    ← Express type augmentation (req.user, req.membership)
├── app.ts                    ← Middleware chain + route mounting
└── index.ts                  ← Server startup
```

### Client Architecture
```
client/src/
├── core/                     ← Shared infrastructure
│   ├── lib/                  ← supabase, api, queryClient, logger, utils, cleanup, keys
│   ├── config/               ← routes, constants (STALE_TIMES, LAST_WORKSPACE_KEY)
│   ├── stores/               ← authStore, uiStore, filterStore
│   └── components/
│       ├── ui/               ← 11 shadcn components
│       └── common/           ← AuthGuard, EmptyState, Header, Sidebar, UserMenu, WorkspaceSwitcher, Layouts
├── features/                  ← Feature modules
│   ├── auth/                 ← useAuth, Login, Signup
│   ├── workspace/            ← hooks, CreateWorkspaceForm, WorkspaceSettings, Onboarding, Dashboard, Settings
│   ├── member/               ← hooks, MemberList, RoleBadge, Members page
│   ├── project/              ← hooks, CreateProjectDialog, ProjectCard, ProjectSidebarItem, ProjectBoard
│   └── task/                 ← hooks (5, incl. optimistic move), KanbanView, KanbanColumn, TaskCard, TaskQuickCreate, DragOverlay, Badges, Board filters
├── App.tsx                    ← Route definitions + global modals
├── main.tsx                   ← Providers (Router, QueryClient, Toaster)
└── index.css                  ← 23 CSS variable design tokens
```

### Database
- **10 tables** with RLS enforced on all
- **6 PostgreSQL ENUMs** matching shared types exactly
- **35 RLS policies** (tenant isolation + RBAC)
- **3 RLS helper functions** (SECURITY DEFINER)
- **2 trigger functions** (user sync + auto updated_at)
- **12 indexes** for performance

### Middleware Chain (every workspace-scoped request)
```
CORS → JSON parser → Request logger → Auth (JWT verify) → Workspace (membership check) → RBAC (role check) → Rate limiter → Validate (Zod) → Route handler → Error handler
```

### State Management
| Data | Tool | Stale Time |
|------|------|-----------|
| Tasks | TanStack Query | 30s (SHORT) |
| Projects, Workspaces, Labels, Members | TanStack Query | 5min (LONG) |
| Comments, Activity | TanStack Query | 30s (MEDIUM) |
| Sidebar collapse, modals | Zustand (uiStore) | — |
| Board filters | Zustand (filterStore) | — |
| Current user, auth status | Zustand (authStore) | — |
| Form inputs | React Hook Form | — |

---

## What's Next: Phase 10

Task Detail Modal + Comments + Labels + Activity — clicking a task card opens a slide-over with editable properties, markdown comments, label management, and activity history. Also adds the workspace-level activity feed page.
