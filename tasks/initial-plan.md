# WorkNest — Initial Implementation Plan

> From zero to a fully functional multi-tenant SaaS project management tool.
> 12 phases. Each phase is independently testable and builds on the previous.

---

## Architecture Summary

```
React (Vite + TS + Tailwind) ←→ Express API (TS + Zod) ←→ PostgreSQL (Supabase + RLS)
                              ↕ Supabase Realtime (WebSocket)
```

**Monorepo:** `client/` + `server/` + `shared/`
**10 Tables:** users, workspaces, members, invitations, projects, tasks, labels, task_labels, comments, activity_log
**37 API Endpoints** across 10 resource groups
**4 Roles:** owner > admin > member > viewer
**3 Auth Layers:** Frontend (cosmetic) → Middleware (primary) → RLS (safety net)

---

## Phase 1: Monorepo Foundation + Shared Types

**Goal:** Three linked packages with all TypeScript types, Zod validators, and dev tooling. Both dev servers start with zero errors.

**What you learn:** Monorepo setup, TypeScript strict mode, Zod schema-first validation, path aliases, design token configuration.

### Step 1.1 — Root Configuration
| File | Purpose |
|------|---------|
| `package.json` | npm workspaces: `["client", "server", "shared"]` |
| `tsconfig.base.json` | Shared strict TS config (all packages extend this) |
| `.gitignore` | node_modules, dist, .env, coverage, .turbo |
| `.nvmrc` | Pin Node 20.x |

### Step 1.2 — Shared Package (`shared/`)
| File | Purpose |
|------|---------|
| `package.json` | `@worknest/shared`, no deps (types + Zod only) |
| `tsconfig.json` | Extends base, `composite: true` for project references |
| `src/types/enums.ts` | `Role`, `TaskStatus`, `Priority`, `InvitationStatus`, `ActivityAction`, `EntityType` as `const` objects |
| `src/types/user.types.ts` | `User`, `CreateUserInput` |
| `src/types/workspace.types.ts` | `Workspace`, `CreateWorkspaceInput`, `UpdateWorkspaceInput` |
| `src/types/member.types.ts` | `Member`, `MemberWithUser` |
| `src/types/invitation.types.ts` | `Invitation`, `CreateInvitationInput` |
| `src/types/project.types.ts` | `Project`, `CreateProjectInput`, `UpdateProjectInput` |
| `src/types/task.types.ts` | `Task`, `CreateTaskInput`, `UpdateTaskInput`, `MoveTaskInput` |
| `src/types/label.types.ts` | `Label`, `CreateLabelInput` |
| `src/types/comment.types.ts` | `Comment`, `CreateCommentInput`, `UpdateCommentInput` |
| `src/types/activity.types.ts` | `ActivityLog` |
| `src/types/api.types.ts` | `ApiSuccessResponse<T>`, `ApiErrorResponse`, `PaginatedResponse<T>` |
| `src/types/index.ts` | Barrel export |
| `src/validators/common.validators.ts` | `uuidSchema`, `slugSchema`, `paginationSchema` |
| `src/validators/auth.validators.ts` | `updateProfileSchema` |
| `src/validators/workspace.validators.ts` | `createWorkspaceSchema`, `updateWorkspaceSchema` |
| `src/validators/project.validators.ts` | `createProjectSchema`, `updateProjectSchema` |
| `src/validators/task.validators.ts` | `createTaskSchema`, `updateTaskSchema`, `moveTaskSchema` |
| `src/validators/comment.validators.ts` | `createCommentSchema`, `updateCommentSchema` |
| `src/validators/label.validators.ts` | `createLabelSchema`, `updateLabelSchema` |
| `src/validators/invitation.validators.ts` | `createInvitationSchema` |
| `src/validators/index.ts` | Barrel export |
| `src/index.ts` | Top-level barrel re-exporting everything |

### Step 1.3 — Server Package (`server/`)
| File | Purpose |
|------|---------|
| `package.json` | Express, Drizzle, Zod, cors, http-errors, dotenv, etc. |
| `tsconfig.json` | Extends base, path alias for `@shared/` |
| `nodemon.json` | Watch `src/`, restart on `.ts` change |
| `.env.example` | All server env vars with placeholders |
| `src/index.ts` | Express hello world (imports from `@worknest/shared` to verify resolution) |

### Step 1.4 — Client Package (`client/`)
| File | Purpose |
|------|---------|
| `package.json` | React, Vite, Tailwind, shadcn/ui, TanStack Query, Zustand, etc. |
| `tsconfig.json` | Extends base, paths: `@/` → `src/`, `@shared/` → `../shared/src/` |
| `vite.config.ts` | Alias resolution matching tsconfig paths |
| `tailwind.config.ts` | All design tokens from `docs/design-tokens.md` as CSS variables |
| `postcss.config.js` | Tailwind + autoprefixer |
| `index.html` | Root HTML with font imports (Inter, JetBrains Mono) |
| `.env.example` | All client env vars with placeholders |
| `src/main.tsx` | React root render with StrictMode |
| `src/App.tsx` | Placeholder with minimal route |
| `src/index.css` | Tailwind directives + CSS variable definitions |
| `src/vite-env.d.ts` | Vite type declarations |

### Step 1.5 — Verify
- [ ] `npm install` — all workspaces resolve, no errors
- [ ] `npx tsc --noEmit` in `shared/` — zero errors
- [ ] `cd server && npm run dev` — "Server running on port 3001"
- [ ] `cd client && npm run dev` — Vite starts, blank page, no console errors
- [ ] Import `TaskStatus` from `@worknest/shared` in both server and client — resolves

**Commit:** `feat: phase 1 — monorepo foundation with shared types and validators`

---

## Phase 2: Database Schema + Supabase Setup

**Goal:** All 10 tables created via Drizzle migrations with RLS policies active. Seed data for development.

**What you learn:** Relational database design, Drizzle ORM, PostgreSQL enums, foreign keys, indexes, RLS, migration workflow.

### Step 2.1 — Environment & DB Config
| File | Purpose |
|------|---------|
| `server/src/config/env.ts` | Zod-validated env vars (DATABASE_URL, SUPABASE_*, PORT, etc.) |
| `server/src/config/index.ts` | Barrel |
| `server/src/db/index.ts` | Drizzle client init (postgres-js driver, pooled URL) |
| `server/drizzle.config.ts` | Drizzle-kit config (schema paths, migration output, direct URL) |

### Step 2.2 — Schema Files (one per table)
| File | Table | Key Details |
|------|-------|-------------|
| `db/schema/users.schema.ts` | users | UUID PK, email UNIQUE, synced from auth |
| `db/schema/workspaces.schema.ts` | workspaces | slug UNIQUE, owner_id FK |
| `db/schema/members.schema.ts` | members | role ENUM, UNIQUE(workspace_id, user_id), ON DELETE CASCADE |
| `db/schema/invitations.schema.ts` | invitations | token UNIQUE, status ENUM, 48hr expiry |
| `db/schema/projects.schema.ts` | projects | key UNIQUE per workspace, task_counter |
| `db/schema/tasks.schema.ts` | tasks | workspace_id redundant for RLS, position REAL, assignee_id `ON DELETE SET NULL` |
| `db/schema/labels.schema.ts` | labels | UNIQUE(workspace_id, name) |
| `db/schema/task-labels.schema.ts` | task_labels | Composite PK, both CASCADE |
| `db/schema/comments.schema.ts` | comments | workspace_id for fast RLS, body markdown |
| `db/schema/activity-log.schema.ts` | activity_log | JSONB metadata, immutable (no update/delete) |
| `db/schema/relations.ts` | All relations | Drizzle `relations()` definitions |
| `db/schema/index.ts` | Barrel | Exports all tables + relations |

### Step 2.3 — RLS & Triggers (raw SQL)
| File | Purpose |
|------|---------|
| `db/migrations-pending/00001_rls_helpers.sql` | `get_current_user_id()`, `is_workspace_member()`, `get_workspace_role()` |
| `db/migrations-pending/00002_rls_policies.sql` | All RLS policies per docs/database-schema.md |
| `db/migrations-pending/00003_user_sync_trigger.sql` | `auth.users` INSERT → `public.users` row |

### Step 2.4 — Seed Script
| File | Purpose |
|------|---------|
| `db/seed.ts` | Creates: 1 user, 1 workspace (owner), 2 projects, 8 tasks (varied statuses/priorities), 4 labels, sample comments |

### Verify
- [ ] `npm run db:generate` — migration SQL generated
- [ ] `npm run db:migrate` — 10 tables visible in Supabase dashboard
- [ ] Apply RLS SQL files in Supabase SQL editor — policies active
- [ ] `npm run db:seed` — test data populated
- [ ] Query tasks for test project — returns expected results

**Commit:** `feat: phase 2 — database schema, RLS policies, and seed data`

---

## Phase 3: Express Server Foundation

**Goal:** Express server with full middleware chain, centralized error handling, rate limiting, tagged logger, and health check endpoint.

**What you learn:** Middleware architecture, error handling patterns, rate limiting, logging best practices, app/server separation (for testing).

### Files
| File | Purpose |
|------|---------|
| `server/src/app.ts` | Express app setup — middleware registration, route mounting, error handler (separate from index.ts for Supertest) |
| `server/src/index.ts` | Updated — imports app, starts listening |
| `middleware/errorHandler.middleware.ts` | Catches http-errors, Zod validation errors, unknown errors → standard error response |
| `middleware/rateLimiter.middleware.ts` | Three tiers: `readLimiter` (100/min), `writeLimiter` (30/min), `strictLimiter` (10/hr) |
| `middleware/validate.middleware.ts` | `validate(zodSchema)` → middleware that validates `req.body`/`req.query`/`req.params` |
| `middleware/requestLogger.middleware.ts` | Logs: `[MW] GET /api/health 200 12ms` |
| `middleware/cors.middleware.ts` | CORS config — allows `FRONTEND_URL`, credentials, standard headers |
| `middleware/index.ts` | Barrel |
| `utils/logger.ts` | `createLogger('TAG')` factory — tagged, leveled (info/warn/error/debug) |
| `utils/httpErrors.ts` | `notFound()`, `forbidden()`, `badRequest()`, `conflict()` — typed wrappers |
| `utils/index.ts` | Barrel |
| `routes/health.routes.ts` | `GET /health` — DB ping, returns `{ data: { status: "ok" } }` |
| `routes/index.ts` | Master router mounting all sub-routers |

### Middleware Chain Order
```
cors → requestLogger → rateLimiter → [routes] → errorHandler (last)
```

### Verify
- [ ] `GET /health` → `{ data: { status: "ok" } }`
- [ ] `GET /nonexistent` → 404 standard error format
- [ ] 101 rapid requests → 429 rate limit
- [ ] Logs: `[MW] GET /health 200 12ms`
- [ ] Bad JSON body → 400 with Zod error details

**Commit:** `feat: phase 3 — express foundation with middleware chain`

---

## Phase 4: Authentication System

**Goal:** Users can sign up, log in (email + Google OAuth), hit protected endpoints. Frontend has Login/Signup pages with form validation and AuthGuard.

**What you learn:** JWT auth, Supabase Auth integration, request decoration (`req.user`), route protection, React Hook Form + Zod.

### Server Files
| File | Purpose |
|------|---------|
| `middleware/auth.middleware.ts` | Verify JWT via Supabase `getUser()`, attach `req.user = { id, email }` |
| `services/auth.service.ts` | `ensureUserExists()`, `getProfile()`, `updateProfile()` |
| `routes/auth.routes.ts` | `POST /callback`, `GET /me`, `PATCH /me` |
| `types/express.d.ts` | Augment `Request` with `user` and `membership` properties |

### Client Files
| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client init (URL + anon key from env) |
| `lib/api.ts` | Fetch wrapper — auto JWT, global error handler (401→redirect, 403→toast, 500→Sentry) |
| `lib/logger.ts` | Client-side `createLogger('TAG')` |
| `lib/utils.ts` | `cn()` for Tailwind class merging |
| `config/routes.ts` | Route path constants: `ROUTES.LOGIN`, `ROUTES.DASHBOARD`, etc. |
| `config/constants.ts` | App-wide constants |
| `stores/authStore.ts` | `currentUser`, `isAuthenticated`, `setUser()`, `reset()` |
| `hooks/useAuth.ts` | `onAuthStateChange` listener → syncs authStore |
| `hooks/useProfile.ts` | `GET /api/auth/me` via TanStack Query |
| `components/common/AuthGuard.tsx` | Session check → render or redirect to login |
| `components/ui/*` | Initial shadcn/ui: Button, Input, Card, Label, Form, Toaster (sonner) |
| `pages/Login.tsx` | Email/password + Google OAuth button |
| `pages/Signup.tsx` | Registration form |
| `App.tsx` | Updated — React Router with public + protected route groups, QueryClient provider, Toaster |

### Verify
- [ ] Sign up with email → redirected to onboarding
- [ ] `GET /api/auth/me` with token → profile. Without → 401
- [ ] Refresh page → session persists
- [ ] Log out → redirect to `/login`, protected routes blocked
- [ ] Google OAuth flow (if configured) works end-to-end

**Commit:** `feat: phase 4 — authentication with Supabase Auth`

---

## Phase 5: Workspace + Members Backend

**Goal:** Full CRUD for workspaces and members with multi-tenant middleware and RBAC enforcement.

**What you learn:** Multi-tenancy, workspace-scoped middleware, RBAC middleware pattern, service layer isolation, slug generation.

### Files
| File | Purpose |
|------|---------|
| `middleware/workspace.middleware.ts` | Extract `:slug`, query membership, attach `req.membership = { workspaceId, userId, role }` |
| `middleware/rbac.middleware.ts` | `rbac('task:create')` → checks `req.membership.role` against permissions map |
| `services/workspace.service.ts` | `create()` (transaction: workspace + owner member), `getBySlug()`, `listForUser()`, `update()`, `delete()` |
| `services/member.service.ts` | `listByWorkspace()`, `updateRole()` (with owner guard), `removeMember()` (can't remove owner) |
| `routes/workspace.routes.ts` | 5 endpoints |
| `routes/member.routes.ts` | 3 endpoints |
| `utils/slug.ts` | `generateSlug(name)` — lowercase, hyphenated, unique check |
| `utils/permissions.ts` | `PERMISSIONS` map — single source of truth for RBAC matrix |

### Verify
- [ ] `POST /api/workspaces` → creates workspace + owner member
- [ ] `GET /api/workspaces/acme-corp` as non-member → 403
- [ ] `GET /api/workspaces/acme-corp/members` → member list with roles
- [ ] `PATCH /members/:id` role change as viewer → 403
- [ ] `DELETE /members/:ownerId` → error (cannot remove owner)

**Commit:** `feat: phase 5 — workspace and member management with RBAC`

---

## Phase 6: Frontend Shell

**Goal:** Navigable app with three layouts, sidebar, workspace switcher, members page, and settings page.

**What you learn:** React Router nested layouts, Outlet pattern, Zustand stores, TanStack Query setup, query key factories.

### Files
| File | Purpose |
|------|---------|
| `lib/queryClient.ts` | TanStack QueryClient config (default staleTime, error handler) |
| `lib/cleanup.ts` | `cleanupOnSignOut()` — resets all stores, clears cache, unsubscribes Realtime |
| `stores/uiStore.ts` | `isSidebarCollapsed`, `activeModal`, `reset()` |
| `hooks/keys.ts` | Query key factories: `workspaceKeys`, `memberKeys` (+ all future keys) |
| `hooks/useWorkspaces.ts` | `GET /api/workspaces` |
| `hooks/useWorkspace.ts` | `GET /api/workspaces/:slug` |
| `hooks/useCreateWorkspace.ts` | `POST /api/workspaces` mutation |
| `hooks/useMembers.ts` | `GET /api/workspaces/:slug/members` |
| `hooks/useUpdateMemberRole.ts` | `PATCH` mutation |
| `hooks/useRemoveMember.ts` | `DELETE` mutation |
| `components/ui/*` | Avatar, Badge, DropdownMenu, Dialog, Sheet, Separator, Skeleton, Tooltip |
| `components/common/WorkspaceLayout.tsx` | Sidebar + Header + `<Outlet />` |
| `components/common/PublicLayout.tsx` | Centered, no sidebar |
| `components/common/OnboardingLayout.tsx` | First-time user flow |
| `components/common/Sidebar.tsx` | Workspace switcher, project list, settings link |
| `components/common/Header.tsx` | Breadcrumb, search trigger, user avatar |
| `components/common/WorkspaceSwitcher.tsx` | Dropdown: workspaces list + "Create new" |
| `components/common/UserMenu.tsx` | Avatar dropdown: profile, sign out |
| `components/common/EmptyState.tsx` | Reusable: icon, title, description, CTA |
| `components/workspace/CreateWorkspaceForm.tsx` | Name + slug preview + submit |
| `components/workspace/WorkspaceSettings.tsx` | Edit name/logo, danger zone |
| `components/member/MemberList.tsx` | Table: avatar, name, role badge, actions |
| `components/member/RoleBadge.tsx` | Colored badge per role |
| `pages/Onboarding.tsx` | "Create your first workspace" |
| `pages/WorkspaceDashboard.tsx` | Project list (or empty state) |
| `pages/Members.tsx` | Fetches members, renders MemberList |
| `pages/Settings.tsx` | Fetches workspace, renders WorkspaceSettings |

### Verify
- [ ] No workspaces → Onboarding page
- [ ] Create workspace → sidebar appears with name
- [ ] `/w/acme-corp/members` → member list
- [ ] `/w/acme-corp/settings` → editable settings
- [ ] Workspace switcher works
- [ ] Sign out → stores reset, redirect to login

**Commit:** `feat: phase 6 — frontend shell with layouts and workspace UI`

---

## Phase 7: Projects (Full-Stack)

**Goal:** Full project CRUD end-to-end. Projects appear in sidebar. Navigating to a project shows a board placeholder.

**What you learn:** Complete feature lifecycle: service → route → hook → component → page.

### Server
| File | Purpose |
|------|---------|
| `services/project.service.ts` | `create()` (key validation, auto-suggest), `getById()`, `listByWorkspace()`, `update()`, `delete()`, `archive()` |
| `routes/project.routes.ts` | 5 endpoints |

### Client
| File | Purpose |
|------|---------|
| `hooks/useProjects.ts`, `useProject.ts` | GET queries (long staleTime) |
| `hooks/useCreateProject.ts`, `useUpdateProject.ts`, `useDeleteProject.ts` | Mutations |
| `components/project/CreateProjectDialog.tsx` | Name, key (auto-suggest), color picker, description |
| `components/project/ProjectCard.tsx` | Card in project grid |
| `components/project/ProjectSidebarItem.tsx` | Sidebar entry: color dot + name |
| `pages/ProjectBoard.tsx` | Placeholder: "Kanban board coming soon" |

### Updates
- `Sidebar.tsx` — render projects from `useProjects()`
- `WorkspaceDashboard.tsx` — project grid or empty state
- `App.tsx` — add routes: `/w/:slug/projects/:projectId/board`
- `keys.ts` — add `projectKeys`

### Verify
- [ ] "New Project" → dialog with auto-suggested key
- [ ] Create "Engineering" → key "ENG", appears in sidebar
- [ ] Click project → navigates to board route (placeholder)
- [ ] Edit project name → sidebar updates
- [ ] Delete project → removed from sidebar

**Commit:** `feat: phase 7 — project management (full-stack)`

---

## Phase 8: Tasks Backend

**Goal:** Complete task CRUD with auto-incrementing numbers, fractional positioning, filtering, and activity logging.

**What you learn:** Complex service logic, transaction locking (`FOR UPDATE`), fractional indexing math, activity audit trail.

### Files
| File | Purpose |
|------|---------|
| `services/task.service.ts` | `create()` (locked counter + position calc), `getById()`, `listByProject()` (filterable), `update()`, `move()` (status + position), `delete()` |
| `services/activity.service.ts` | `logActivity(workspaceId, actorId, action, entityType, entityId, metadata)` |
| `routes/task.routes.ts` | 6 endpoints |
| `utils/position.ts` | `calculatePosition(above?, below?)`, `shouldRebalance(positions[])`, `rebalanceColumn(projectId, status)` |

### Key Implementation Details
- `create()`: `BEGIN → SELECT task_counter FOR UPDATE → INCREMENT → INSERT task → COMMIT`
- `move()`: Calculate new position via fractional indexing → UPDATE status + position → log activity
- `listByProject()`: Filter by `status`, `priority`, `assigneeId` via query params → paginated response
- `rebalanceColumn()`: When gap < 0.001, reset all positions in column to 1.0, 2.0, 3.0, ... in single transaction

### Verify
- [ ] Create tasks → ENG-1, ENG-2, ENG-3 (never reuses after delete)
- [ ] `GET tasks?status=todo&priority=high` → filtered results
- [ ] `PATCH /move` → status and position change, activity logged
- [ ] Position math: between 1.0 and 2.0 → 1.5
- [ ] `GET /activity` → shows task_created, task_moved entries

**Commit:** `feat: phase 8 — task backend with fractional indexing and activity log`

---

## Phase 9: Kanban Board UI

**Goal:** Interactive 6-column board with drag-and-drop, optimistic updates, quick create, and filters.

**What you learn:** dnd-kit (DndContext, SortableContext, useSortable), optimistic cache updates, drag overlay, client-side filtering.

### Files
| File | Purpose |
|------|---------|
| `hooks/useTasks.ts` | GET tasks by project (30s staleTime) |
| `hooks/useCreateTask.ts` | POST mutation |
| `hooks/useMoveTask.ts` | PATCH `/move` with optimistic update (snapshot → update → rollback on error) |
| `hooks/useUpdateTask.ts` | PATCH mutation |
| `hooks/useDeleteTask.ts` | DELETE mutation |
| `stores/filterStore.ts` | `statusFilter[]`, `priorityFilter[]`, `assigneeFilter`, `labelFilter`, `reset()` |
| `components/board/KanbanView.tsx` | DndContext wrapper, `onDragStart`/`onDragOver`/`onDragEnd` handlers |
| `components/board/KanbanColumn.tsx` | Droppable zone: header (name + count), sorted task list, TaskQuickCreate |
| `components/board/TaskCard.tsx` | Draggable card (lightweight — no hooks). Shows: number, title, priority, assignee, labels, comment count |
| `components/board/TaskQuickCreate.tsx` | Inline input at column bottom, Enter to create |
| `components/board/DragOverlay.tsx` | Floating card clone following cursor |
| `components/board/BoardHeader.tsx` | Project name, view toggle, filter button |
| `components/board/BoardFilters.tsx` | Filter dropdowns: status, priority, assignee, labels |
| `components/common/PriorityBadge.tsx` | Colored icon per priority |
| `components/common/StatusBadge.tsx` | Colored dot per status |
| `pages/ProjectBoard.tsx` | Updated — renders BoardHeader + KanbanView |

### Optimistic Move Pattern
```
onMutate:  snapshot = queryClient.getQueryData(taskKeys)
           queryClient.cancelQueries(taskKeys)
           queryClient.setQueryData(taskKeys, optimisticUpdate)
onError:   queryClient.setQueryData(taskKeys, snapshot)
           toast.error('Move failed')
onSettled: queryClient.invalidateQueries(taskKeys)
```

### Verify
- [ ] 6 columns with seeded tasks
- [ ] Drag between columns → instant move, PATCH in network tab
- [ ] Reorder within column → position updates
- [ ] QuickCreate at column bottom → card appears
- [ ] Filters → only matching cards shown
- [ ] One PATCH per drag — no unnecessary refetches during drag

**Commit:** `feat: phase 9 — kanban board with drag-and-drop`

---

## Phase 10: Task Detail + Comments + Labels + Activity

**Goal:** Task detail modal with full editing, comments thread, labels, and activity feed page.

**What you learn:** Slide-over modals, inline editing, markdown rendering, many-to-many relationships, paginated feeds.

### Server
| File | Purpose |
|------|---------|
| `services/comment.service.ts` | `create()`, `listByTask()` (paginated), `update()`, `delete()` |
| `services/label.service.ts` | `create()`, `listByWorkspace()`, `update()`, `delete()` |
| `services/taskLabel.service.ts` | `addLabel()`, `removeLabel()`, `getLabelsForTask()` |
| `routes/comment.routes.ts` | 4 endpoints |
| `routes/label.routes.ts` | 4 endpoints |
| `routes/taskLabel.routes.ts` | 2 endpoints |
| `routes/activity.routes.ts` | 1 endpoint (paginated, filterable) |

### Client
| File | Purpose |
|------|---------|
| `hooks/useComments.ts`, `useCreateComment.ts`, `useUpdateComment.ts`, `useDeleteComment.ts` | Comment queries + mutations |
| `hooks/useLabels.ts`, `useCreateLabel.ts` | Label queries + mutations |
| `hooks/useTaskLabels.ts` | Add/remove label mutations |
| `hooks/useActivity.ts` | GET activity (paginated) |
| `components/task/TaskDetailModal.tsx` | Sheet slide-over. URL updates to `?task=:id` for shareability |
| `components/task/TaskTitle.tsx` | Inline editable (click → input → Enter saves, Esc cancels). Optimistic. |
| `components/task/TaskDescription.tsx` | Markdown editor (write) + `react-markdown` renderer (read) |
| `components/task/TaskProperties.tsx` | Status, priority, assignee, due date, labels dropdowns |
| `components/task/TaskComments.tsx` | Comment list + compose form |
| `components/task/CommentItem.tsx` | Author avatar, timestamp, markdown body, edit/delete |
| `components/task/TaskActivity.tsx` | Activity entries for this task |
| `components/label/LabelBadge.tsx` | Colored pill |
| `components/label/LabelSelector.tsx` | Popover: checkbox list of workspace labels |
| `components/label/LabelManager.tsx` | Dialog for workspace-level label CRUD |
| `pages/Activity.tsx` | Full workspace activity feed with filters |

### Verify
- [ ] Click card → detail modal opens with all properties
- [ ] Edit title inline → saves on Enter, card updates on board
- [ ] Change priority → badge on card updates
- [ ] Add comment → appears in thread
- [ ] Add label → dots appear on card
- [ ] `/w/acme-corp/activity` → chronological activity entries
- [ ] Markdown in comments renders safely (no XSS)

**Commit:** `feat: phase 10 — task detail, comments, labels, and activity`

---

## Phase 11: Realtime + Invitations + Command Palette

**Goal:** Multi-user real-time sync, email invitations, and Cmd+K search.

**What you learn:** WebSocket subscriptions, cache invalidation, email delivery (Resend), token-based flows, command palette UI.

### Server
| File | Purpose |
|------|---------|
| `services/invitation.service.ts` | `create()` (token + email), `listPending()`, `accept()`, `revoke()` |
| `services/email.service.ts` | `sendInvitationEmail()` via Resend |
| `routes/invitation.routes.ts` | 4 endpoints |
| `utils/token.ts` | `generateInviteToken()` — `crypto.randomUUID()`, 48hr expiry calc |

### Client
| File | Purpose |
|------|---------|
| `hooks/useRealtimeSync.ts` | Subscribe per project → invalidate `taskKeys` on INSERT/UPDATE/DELETE events |
| `hooks/useInvitations.ts` | GET pending invitations |
| `hooks/useCreateInvitation.ts` | POST mutation (send invite) |
| `hooks/useAcceptInvitation.ts` | POST `/api/invitations/accept` |
| `hooks/useRevokeInvitation.ts` | DELETE mutation |
| `hooks/useSearch.ts` | Client-side search across TanStack Query cache (tasks, projects, members) |
| `components/common/CommandPalette.tsx` | Cmd+K dialog: search input, grouped results, keyboard navigation |
| `components/common/RealtimeProvider.tsx` | Context managing Realtime subscriptions per active project |
| `components/member/InviteDialog.tsx` | Email + role selector form |
| `components/member/InvitationList.tsx` | Pending invitations with revoke button |
| `pages/InviteAccept.tsx` | Public page: reads token from URL, handles accept (existing/new user) |

### Updates
- `Members.tsx` — add InviteDialog + InvitationList
- `Signup.tsx` — handle `?invite=` query param, auto-accept after signup
- `ProjectBoard.tsx` — wrap with RealtimeProvider

### Verify
- [ ] **Realtime:** Two browser windows, same project. Create/drag task in one → appears/moves in other within 2s
- [ ] **Invite:** Send invite → email arrives (check Resend dashboard). Accept → user joins workspace
- [ ] **Edge cases:** Expired token → error. Revoked → error. Already member → error
- [ ] **Cmd+K:** Search tasks/projects — results appear, Enter navigates
- [ ] **Resilience:** Disconnect WiFi → reconnect → board recovers via refetch

**Commit:** `feat: phase 11 — realtime sync, invitations, and command palette`

---

## Phase 12: Testing + CI/CD + Deployment

**Goal:** Test coverage on critical paths. CI pipeline. Production deployment with error monitoring.

**What you learn:** Test strategy (unit/integration/e2e), CI pipeline design, Sentry, deployment architecture.

### Tests
| File | What It Tests |
|------|---------------|
| `server/__tests__/services/task.service.test.ts` | Task creation (counter lock), move, position calc |
| `server/__tests__/services/workspace.service.test.ts` | Create (with owner), slug generation |
| `server/__tests__/services/member.service.test.ts` | Role changes, owner protection, self-demotion |
| `server/__tests__/routes/auth.routes.test.ts` | Supertest: auth endpoints |
| `server/__tests__/routes/workspace.routes.test.ts` | Supertest: CRUD + permission checks |
| `server/__tests__/routes/task.routes.test.ts` | Supertest: CRUD, move, filters |
| `server/__tests__/utils/position.test.ts` | Fractional indexing math |
| `server/__tests__/utils/slug.test.ts` | Slug generation edge cases |
| `server/__tests__/utils/permissions.test.ts` | RBAC matrix completeness |
| `client/__tests__/hooks/useMoveTask.test.ts` | Optimistic update + rollback |
| `client/__tests__/components/AuthGuard.test.tsx` | Redirect when unauthenticated |
| `e2e/tests/auth.spec.ts` | Signup → login → see workspace |
| `e2e/tests/kanban.spec.ts` | Create project → create tasks → drag between columns |

### CI/CD
| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | On push: install → lint → typecheck → test (parallel) → build |
| `.github/workflows/deploy.yml` | On main merge: Vercel (frontend) + Render (backend) |

### Monitoring & Config
| File | Purpose |
|------|---------|
| `client/src/lib/sentry.ts` | Sentry init for frontend |
| `server/src/config/sentry.ts` | Sentry init for backend |
| `vercel.json` | Root directory: `client/`, SPA rewrites |
| `render.yaml` | Build command, start command, env vars |

### Verify
- [ ] `cd server && npm run test` — all pass
- [ ] `cd client && npm run test` — all pass
- [ ] `npm run test:e2e` — Playwright critical paths pass
- [ ] Push to branch → GitHub Actions green
- [ ] Merge to main → auto-deploy to Vercel + Render
- [ ] Production URL loads, login works, board renders
- [ ] Trigger error → Sentry captures with context

**Commit:** `feat: phase 12 — tests, CI/CD, and production deployment`

---

## Pre-Implementation Fixes (Before Phase 1)

These doc inconsistencies should be fixed first:

| Fix | File | What |
|-----|------|------|
| 1 | `docs/coding-standards.md` | Sync file deletion rule with CLAUDE.md ("allowed during early phases") |
| 2 | `docs/architecture.md` | Add CORS to middleware chain |
| 3 | `docs/api-design.md` | Add CORS to middleware chain |
| 4 | `docs/database-schema.md` | Fix `assignee_id` → `ON DELETE SET NULL` (not CASCADE) |

---

## File Count by Phase

| Phase | New Files | Running Total |
|-------|-----------|---------------|
| Pre-fix | 0 (edits) | 0 |
| 1 | ~35 | 35 |
| 2 | ~17 | 52 |
| 3 | ~12 | 64 |
| 4 | ~18 | 82 |
| 5 | ~10 | 92 |
| 6 | ~28 | 120 |
| 7 | ~12 | 132 |
| 8 | ~6 | 138 |
| 9 | ~16 | 154 |
| 10 | ~22 | 176 |
| 11 | ~14 | 190 |
| 12 | ~20 | 210 |

**Total: ~210 files across 12 phases**

---

## Execution Rules

1. Start each phase by writing a checklist to `tasks/todo.md`
2. **STOP and wait for approval** before coding
3. Implement one item at a time, marking done
4. Explain what changed and why after each step
5. Move completed items to "Completed Work Log" in `tasks/todo.md`
6. Read the relevant reference doc before starting any phase
7. Follow all coding standards from file 1 (headers, loggers, barrels, naming)
8. Keep changes minimal — simplicity over cleverness
