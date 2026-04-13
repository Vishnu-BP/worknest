# WorkNest — Task Tracker

> Active checklist for current phase + completed work log.
> Per CLAUDE.md: never delete completed items — move to Completed Work Log.

---

## Current: Phase 8 — Tasks Backend

### Step 1: Position Utility
- [x] Create `core/utils/position.ts` — calculatePosition, shouldRebalance (threshold 0.001), rebalanceColumn (transactional)
- [x] Update `core/utils/index.ts` barrel

### Step 2: Activity Service
- [x] Create `modules/activity/activity.service.ts` — logActivity() (never blocks main operation)
- [x] Create `modules/activity/index.ts` — barrel

### Step 3: Task Service
- [x] Create `modules/task/task.service.ts` — 6 functions: create (FOR UPDATE lock + auto position), getById, listByProject (multi-filter), update, move (with rebalance check), deleteTask (returns deleted for activity log)

### Step 4: Task Routes + Mount
- [x] Create `modules/task/task.routes.ts` — 6 endpoints with activity logging after each mutation
- [x] Create `modules/task/index.ts` — barrel
- [x] Update `app.ts` — mount taskRouter

### Step 5: Verify
- [x] `tsc --noEmit` — zero errors
- [x] All 6 task endpoints return 401 without token (auth protecting)
- [x] Health check still works (200 OK)

---

## Completed Work Log

### Phase 1-3 (Complete)
- [x] Monorepo, shared types/validators, database (10 tables, RLS, triggers), Express foundation

### Phase 4 — Restructure + Authentication (Complete)
- [x] Server: core/ + modules/ restructure, auth middleware, auth module (3 endpoints)
- [x] Client: core/ + features/ restructure, lib, config, stores, AuthGuard, Login/Signup

### Phase 5 — Workspace + Members Backend (Complete)
- [x] Core utils (slug, permissions), core middleware (workspace, rbac)
- [x] Workspace module (5 endpoints), member module (3 endpoints with guards)

### Phase 6 — Frontend Shell (Complete)
- [x] shadcn/ui (11 components), uiStore, query key factories
- [x] Layouts (WorkspaceLayout, OnboardingLayout), navigation (Sidebar, Header, Switcher, UserMenu)
- [x] Workspace feature (hooks, CreateWorkspaceForm, WorkspaceSettings, pages)
- [x] Member feature (hooks, MemberList, RoleBadge, Members page)

### Phase 7 — Projects Full-Stack (Complete)
- [x] Server: project module (5 endpoints, key uniqueness with 409)
- [x] Client: project hooks (5), components (CreateProjectDialog, ProjectCard, ProjectSidebarItem)
- [x] Client: ProjectBoard placeholder, Sidebar updated, Dashboard project grid, App routes
