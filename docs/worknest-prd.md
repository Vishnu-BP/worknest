# WorkNest — Product Requirements Document

**Version:** 1.0  
**Date:** April 6, 2026  
**Author:** Vishnu  
**Status:** Finalized — Ready for Implementation

---

## Table of Contents

1. Project Overview
2. Purpose & Goals
3. Tech Stack Summary
4. High-Level Design (HLD)
   - 4.1 Frontend
   - 4.2 Backend
   - 4.3 Infrastructure & DevOps
5. Low-Level Design (LLD)
   - 5.1 Project Structure
   - 5.2 Database Schema
   - 5.3 Row-Level Security (RLS) Policies
   - 5.4 Authentication Flow
   - 5.5 RBAC System
   - 5.6 API Design
   - 5.7 Invitation Flow
   - 5.8 Frontend Component Architecture
   - 5.9 State Management Architecture
   - 5.10 Kanban Board Architecture
6. Interview Talking Points

---

## 1. Project Overview

**WorkNest** is a multi-tenant SaaS project management tool — a simplified version of Linear or Jira. Multiple companies (tenants) sign up to the same application, each gets their own isolated workspace. Inside a workspace, teams create projects, organize tasks on a Kanban board with drag-and-drop, assign work to members with role-based permissions, and track activity — all synchronized in real time across connected clients.

**What makes it technically significant:** Multi-tenancy with Row-Level Security, role-based access control enforced at three layers (frontend, middleware, database), real-time collaboration via WebSockets, optimistic updates with rollback for perceived performance, and fractional indexing for drag-and-drop ordering. These are problems companies pay senior engineers to solve.

---

## 2. Purpose & Goals

**Primary goal:** Get hired as a full stack developer by demonstrating system design and architecture understanding through a production-quality project.

**Why this project:** Every interviewer has used Jira, Linear, or Asana. They immediately understand what WorkNest is. The conversation jumps straight to architecture decisions — multi-tenancy strategy, permission enforcement, real-time sync, optimistic updates — which is where candidates score points.

**Target timeline:** Weeks 4–7 of a two-project portfolio plan, at 2–3 hours per day.

**Constraints:** Entirely free-tier. No paid services, no custom domain required for core functionality.

**Success criteria:** Deployed, functional, well-documented application with clean code, CI/CD, tests, and an architecture-focused README that demonstrates full stack competency.

---

## 3. Tech Stack Summary

### Frontend

| Segment | Tool | Purpose |
|---|---|---|
| Framework | React + Vite + TypeScript | Component rendering, fast builds, type safety |
| Styling | Tailwind CSS | Utility-first CSS with centralized design tokens |
| Component Library | shadcn/ui (on Radix primitives) | Pre-built accessible UI components, fully customizable |
| Server State | TanStack Query (React Query) | API data caching, background refetch, optimistic updates |
| Client State | Zustand | UI state (sidebar, filters, modals) |
| Routing | React Router | Client-side navigation, nested layouts, route guards |
| Drag & Drop | dnd-kit | Kanban board drag interactions |
| Forms | React Hook Form + Zod | Form state management, schema-based validation |
| Real-time | Supabase Realtime (WebSocket) | Live board sync across connected clients |

### Backend

| Segment | Tool | Purpose |
|---|---|---|
| Framework | Express + TypeScript | HTTP server, middleware chain, API routes |
| Auth | Supabase Auth | User identity, JWT tokens, Google OAuth |
| Authorization | Express RBAC middleware + Supabase RLS | Three-layer permission enforcement |
| Database | PostgreSQL (Supabase) | Relational data storage, RLS, real-time triggers |
| ORM | Drizzle ORM | Type-safe queries, schema definition, migrations |
| Email | Resend (free tier, shared sender) | Workspace invitation emails |
| Rate Limiting | express-rate-limit | API abuse prevention |
| API Style | REST | Resource-based endpoints, standard HTTP methods |
| Validation | Zod | Request body validation (shared with frontend forms) |
| Error Handling | Centralized Express error middleware + http-errors | Consistent error responses |

### Infrastructure & DevOps

| Segment | Tool | Purpose |
|---|---|---|
| Frontend Hosting | Vercel | Auto-deploy from GitHub, global CDN, preview URLs |
| Backend Hosting | Render (free tier) | Node.js server hosting, auto-deploy from GitHub |
| CI/CD | GitHub Actions | Automated lint, type-check, test on every push |
| Unit/Integration Testing | Vitest + Supertest | Fast tests for logic and API routes |
| E2E Testing | Playwright | Browser-based testing of critical user flows |
| Error Monitoring | Sentry | Automatic error capture, stack traces, context |
| Performance Monitoring | Vercel Analytics | Page load times, Web Vitals |
| Uptime Monitoring | UptimeRobot | Availability checks, keeps Render backend awake |
| Version Control | Git + GitHub | Code management, Issues, project board |

---

## 4. High-Level Design (HLD)

### System Architecture

The system follows a three-tier architecture with a separate frontend and backend communicating over HTTP and WebSocket.

```
React (Vite + TypeScript + Tailwind)
    ↕ HTTP requests (REST API)
    ↕ WebSocket (Supabase Realtime)
Express API (TypeScript + Zod)
    ↕ SQL queries via Drizzle ORM
Supabase PostgreSQL (RLS enforced)
    ↕ Realtime channel (WebSocket)
Back to React (live updates via cache invalidation)
```

### 4.1 Frontend

**React + Vite + TypeScript** was chosen over Next.js to understand each layer independently. React handles the UI, Vite provides the fast build tooling, and TypeScript enforces type safety across a complex data model (workspaces, members, projects, tasks, labels, comments).

**Tailwind CSS** provides utility-first styling with a centralized design token system defined in `tailwind.config.js`. All colors, fonts, spacing, and border radii are configured once and referenced via utility classes — no raw hex codes anywhere in the codebase.

**shadcn/ui** provides pre-built, accessible UI components (dialogs, dropdowns, tooltips, command palettes) built on Radix UI primitives and styled with Tailwind. The component source code is copied into the project — fully owned and customizable.

**TanStack Query** manages all server state — fetching, caching, background refetching, deduplication, and optimistic updates with rollback. This is critical for the Kanban board's drag-and-drop performance.

**Zustand** manages client-only UI state — sidebar collapse, active filters, modal visibility, view mode toggles. Small, focused stores with no boilerplate.

**React Router** handles client-side routing with nested layouts. The workspace layout (sidebar + header) persists while child routes (board, settings, members) swap in the content area.

**dnd-kit** provides the drag-and-drop interaction layer for the Kanban board. Modular architecture with sensors, collision detection, and sortable presets.

**React Hook Form + Zod** handles all form state and validation. Zod schemas are shared between frontend forms and backend request validation — single source of truth.

**Supabase Realtime** provides WebSocket-based live updates. When any client modifies a task, all connected clients receive the change event and invalidate their local cache.

### 4.2 Backend

**Express + TypeScript** provides the API server with a middleware-based architecture. The middleware chain runs in order on every request: rate limiter → auth check → workspace membership check → role permission check → route handler.

**Supabase Auth** handles authentication — user identity, password hashing, JWT issuance, Google OAuth, session management. The Express backend verifies JWTs on every request.

**Three-layer authorization:** Frontend hides unauthorized UI elements (cosmetic). Express middleware enforces permissions with proper HTTP error responses (primary defense). Supabase RLS enforces tenant isolation at the database level (safety net).

**Drizzle ORM** provides type-safe database queries and migration management. Schema is defined in TypeScript — the same language as the rest of the backend. Generates readable SQL and handles migration diffing automatically.

**REST API** follows resource-based URL conventions. Endpoints are grouped by resource (workspaces, projects, tasks, members, comments, invitations). HTTP methods define actions (GET, POST, PATCH, DELETE).

**Zod** validates all incoming request bodies. The same schemas used in frontend forms validate backend requests — one definition, enforced everywhere.

**Resend** sends invitation emails using the free shared sender (`onboarding@resend.dev`). No custom domain required.

**express-rate-limit** prevents API abuse with configurable limits per route — generous for reads, strict for writes, very strict for invitations and auth attempts.

### 4.3 Infrastructure & DevOps

**Vercel** hosts the React frontend with automatic deployment from GitHub, global CDN distribution, and preview URLs for every pull request.

**Render** hosts the Express backend on the free tier. The backend spins down after 15 minutes of inactivity — UptimeRobot pings it every 14 minutes to keep it awake.

**GitHub Actions** runs CI/CD — on every push: install dependencies → lint → type-check → run tests. If all pass and the branch is main, Vercel and Render auto-deploy.

**Vitest + Supertest** test unit logic (fractional indexing, permission checks) and API routes (endpoint behavior against a test database).

**Playwright** tests the critical end-to-end flow: signup → create workspace → create project → create task → drag task on board.

**Sentry** captures errors in production (frontend and backend) with full context — stack traces, breadcrumbs, environment info.

**UptimeRobot** monitors app availability and prevents Render cold starts.

---

## 5. Low-Level Design (LLD)

### 5.1 Project Structure

WorkNest uses a **monorepo** — one GitHub repository containing frontend, backend, and shared code. This enables shared TypeScript types and Zod schemas between client and server.

```
worknest/
├── client/                          # React frontend
│   └── src/
│       ├── pages/                   # Route-level components
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   ├── WorkspaceDashboard.tsx
│       │   ├── ProjectBoard.tsx
│       │   ├── ProjectList.tsx
│       │   ├── Settings.tsx
│       │   ├── Members.tsx
│       │   └── InviteAccept.tsx
│       ├── components/              # Reusable UI components
│       │   ├── ui/                  # shadcn/ui base components
│       │   ├── common/              # Shared (AppSidebar, Header, EmptyState)
│       │   ├── board/               # Kanban (KanbanColumn, TaskCard, DragOverlay)
│       │   └── workspace/           # Workspace (WorkspaceSwitcher, WorkspaceCard)
│       ├── hooks/                   # TanStack Query wrappers
│       │   ├── useTasks.ts
│       │   ├── useCreateTask.ts
│       │   ├── useMoveTask.ts
│       │   ├── useProjects.ts
│       │   ├── useMembers.ts
│       │   └── useWorkspaces.ts
│       ├── stores/                  # Zustand stores
│       │   ├── uiStore.ts           # Sidebar, modal, command palette state
│       │   ├── filterStore.ts       # Board filters (status, priority, assignee)
│       │   └── authStore.ts         # Current user session
│       ├── lib/                     # Utilities
│       │   ├── api.ts               # Fetch wrapper with auth headers
│       │   ├── supabase.ts          # Supabase client for Realtime
│       │   └── utils.ts             # cn(), helpers
│       └── config/                  # Constants, route paths, feature flags
│
├── server/                          # Express backend
│   └── src/
│       ├── routes/                  # API endpoint handlers
│       │   ├── workspace.routes.ts
│       │   ├── project.routes.ts
│       │   ├── task.routes.ts
│       │   ├── comment.routes.ts
│       │   ├── member.routes.ts
│       │   └── invitation.routes.ts
│       ├── services/                # Business logic (no HTTP awareness)
│       │   ├── workspace.service.ts
│       │   ├── task.service.ts
│       │   ├── invitation.service.ts
│       │   ├── member.service.ts
│       │   └── activity.service.ts
│       ├── middleware/              # Request processing chain
│       │   ├── auth.middleware.ts
│       │   ├── workspace.middleware.ts
│       │   ├── rbac.middleware.ts
│       │   ├── rateLimiter.middleware.ts
│       │   └── errorHandler.middleware.ts
│       ├── db/                      # Database layer
│       │   ├── schema/              # Drizzle table definitions
│       │   ├── migrations/          # Auto-generated SQL migrations
│       │   ├── seed.ts              # Test data population
│       │   └── index.ts             # Drizzle client initialization
│       ├── validators/              # Zod request schemas
│       ├── utils/                   # Token generation, slug generation, position calc
│       └── config/                  # Env vars, DB connection, rate limit config
│
├── shared/                          # Shared TypeScript types & Zod schemas
│   ├── types/                       # Type definitions used by both client & server
│   └── validators/                  # Zod schemas used by both frontend forms & API
│
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD
├── package.json
└── README.md
```

**Key structural decisions:**

- **Routes vs Services separation:** Routes handle HTTP (parse request, send response). Services contain business logic (no Express dependency). Services are independently testable.
- **Shared folder:** TypeScript types and Zod schemas are defined once and imported by both client and server. Vercel builds from `/client`, Render builds from `/server`, both access `/shared` during build time. The shared folder is never deployed independently.
- **Co-location:** Components used only within one feature live next to that feature. Components used across features live in `/components/common/`.

---

### 5.2 Database Schema

WorkNest has **10 tables**. Every table except `users` has a `workspace_id` column for tenant isolation.

#### Table 1: users

Stores app-specific user data. Synced from Supabase Auth via a database trigger on signup.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Matches Supabase Auth user ID |
| email | TEXT, UNIQUE | User email |
| full_name | TEXT | Display name |
| avatar_url | TEXT, nullable | Profile image URL |
| created_at | TIMESTAMPTZ | Account creation |
| updated_at | TIMESTAMPTZ | Last profile edit |

No password column — Supabase Auth handles credential storage separately and securely.

#### Table 2: workspaces

Each tenant in the system. The slug is used in URLs (`app.com/w/acme-corp`).

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| name | TEXT | Display name |
| slug | TEXT, UNIQUE | URL-friendly identifier |
| owner_id | UUID (FK → users) | Creator of the workspace |
| logo_url | TEXT, nullable | Workspace logo |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last edit |

#### Table 3: members

Join table between users and workspaces. Defines multi-tenancy membership and roles.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | ON DELETE CASCADE |
| user_id | UUID (FK → users) | Clerk user ID |
| role | ENUM (owner, admin, member, viewer) | Default: member |
| joined_at | TIMESTAMPTZ | Join timestamp |

Constraints: UNIQUE(workspace_id, user_id) — one membership per workspace per user. Indexes on both `workspace_id` and `user_id` for fast membership lookups.

#### Table 4: invitations

Tracks pending workspace invitations with secure tokens.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | Target workspace |
| email | TEXT | Invitee's email |
| role | ENUM (member, viewer) | Role assigned on acceptance |
| token | TEXT, UNIQUE | Cryptographically secure invite token |
| invited_by | UUID (FK → users) | Who sent the invitation |
| status | ENUM (pending, accepted, expired, revoked) | Invitation lifecycle |
| expires_at | TIMESTAMPTZ | 48-hour expiry window |
| created_at | TIMESTAMPTZ | Creation time |

#### Table 5: projects

Workspace-level containers for tasks. Each project has a key prefix for task numbering.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | Tenant scope |
| name | TEXT | Project display name |
| description | TEXT, nullable | Optional description |
| key | TEXT | Task prefix (ENG → ENG-1, ENG-2) |
| color | TEXT | Accent color for UI |
| task_counter | INTEGER, DEFAULT 0 | Auto-increments on task creation, never decrements |
| is_archived | BOOLEAN, DEFAULT false | Soft archive flag |
| created_by | UUID (FK → users) | Creator |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last edit |

Constraint: UNIQUE(workspace_id, key) — keys are unique per workspace.

#### Table 6: tasks

The core table. Every Kanban card is a row here.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | Redundant but required for fast RLS checks |
| project_id | UUID (FK → projects) | Parent project |
| title | TEXT | Task title |
| description | TEXT, nullable | Markdown content |
| task_number | INTEGER | Auto-incremented per project (the "1" in ENG-1) |
| status | ENUM (backlog, todo, in_progress, in_review, done, cancelled) | Kanban column |
| priority | ENUM (urgent, high, medium, low, none) | Priority level |
| position | REAL | Fractional index for drag ordering |
| assignee_id | UUID, nullable (FK → users) | Null = unassigned |
| created_by | UUID (FK → users) | Task creator |
| parent_id | UUID, nullable (FK → tasks) | Self-reference for subtasks |
| due_date | DATE, nullable | Optional deadline |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last edit |

Constraint: UNIQUE(project_id, task_number). `workspace_id` is intentionally redundant (derivable from project_id) — placed directly on tasks so RLS policies avoid expensive joins.

#### Table 7: labels

Reusable tags defined at the workspace level, shared across all projects.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | Tenant scope |
| name | TEXT | Label name (e.g., "bug", "feature") |
| color | TEXT | Hex color for badge rendering |
| created_at | TIMESTAMPTZ | Creation time |

Constraint: UNIQUE(workspace_id, name).

#### Table 8: task_labels

Many-to-many join table between tasks and labels.

| Column | Type | Notes |
|---|---|---|
| task_id | UUID (FK → tasks) | ON DELETE CASCADE |
| label_id | UUID (FK → labels) | ON DELETE CASCADE |

Primary key: (task_id, label_id) — a label can only be applied to a task once.

#### Table 9: comments

Discussion thread per task with markdown support.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | For fast RLS checks |
| task_id | UUID (FK → tasks) | Parent task |
| author_id | UUID (FK → users) | Comment author |
| body | TEXT | Markdown content |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last edit |

#### Table 10: activity_log

Immutable audit trail of all workspace actions.

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| workspace_id | UUID (FK → workspaces) | Tenant scope |
| actor_id | UUID (FK → users) | Who performed the action |
| action | ENUM | task_created, task_updated, task_moved, task_deleted, comment_added, member_invited, member_joined, member_removed, project_created, project_archived |
| entity_type | ENUM | task, project, comment, member, invitation |
| entity_id | UUID | ID of the entity acted upon |
| metadata | JSONB | Flexible extra data (e.g., "status changed from todo to in_progress") |
| created_at | TIMESTAMPTZ | Action timestamp |

JSONB for metadata accommodates varying data shapes per action type without schema changes.

#### Relationship Map

```
Workspace
├── has many Members (via members table)
├── has many Projects
│   └── has many Tasks
│       ├── has many Comments
│       ├── has many Labels (via task_labels)
│       └── can have parent Task (subtasks)
├── has many Labels
├── has many Invitations
└── has many Activity Log entries
```

#### Required Indexes

Beyond primary keys and unique constraints: `tasks.project_id`, `tasks.status`, `tasks.assignee_id`, `members.workspace_id`, `members.user_id`, `comments.task_id`, `activity_log.workspace_id`, `activity_log.created_at`.

---

### 5.3 Row-Level Security (RLS) Policies

RLS is the database-level safety net. Even if application code has a bug and forgets to filter by workspace, the database itself rejects unauthorized queries.

#### Helper Functions

- **`get_current_user_id()`** — extracts the authenticated user's ID from the JWT token in the database session. Every policy references this.
- **`is_workspace_member(workspace_id)`** — checks if the current user has a row in the members table for the given workspace. Returns boolean. Core of tenant isolation.
- **`get_workspace_role(workspace_id)`** — returns the user's role (owner/admin/member/viewer) in the workspace. Used for role-gated policies.

#### Policy Summary by Table

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| users | Own row + shared workspace members | — (trigger) | Own row only | Blocked |
| workspaces | Member of workspace | Any authenticated user | Owner, Admin | Owner only |
| members | Member of workspace | Admin, Owner | Admin, Owner | Admin, Owner (not owner row) |
| invitations | Admin, Owner + invitee (by email/token) | Admin, Owner | Invitee (accept), Admin/Owner (revoke) | Admin, Owner |
| projects | Member of workspace | Member, Admin, Owner | Member, Admin, Owner | Admin, Owner |
| tasks | Member of workspace | Member, Admin, Owner | Member, Admin, Owner | Admin, Owner |
| labels | Member of workspace | Member, Admin, Owner | Admin, Owner | Admin, Owner |
| task_labels | Member of workspace | Member, Admin, Owner | — | Member, Admin, Owner |
| comments | Member of workspace | Member, Admin, Owner | Author only | Author, Admin, Owner |
| activity_log | Member of workspace | System (service role, bypasses RLS) | Blocked | Blocked |

**Critical pattern:** Every policy's first condition is `is_workspace_member(workspace_id)`. Membership is the primary gate. Role checks are secondary. This ensures tenant isolation is airtight regardless of role logic.

---

### 5.4 Authentication Flow

#### Token System

Supabase Auth issues two tokens on login:

- **Access token** — short-lived JWT (1 hour). Contains user ID, email, metadata. Sent with every API request via `Authorization: Bearer <token>` header. Self-contained and verifiable without calling Supabase.
- **Refresh token** — long-lived. Used to silently obtain new access tokens when the current one expires. The user stays logged in without re-entering credentials.

#### Signup Flow

1. User enters email/password or clicks "Sign in with Google"
2. Supabase Auth creates the account, hashes password, stores securely
3. Supabase returns access + refresh tokens
4. Database trigger creates a row in `public.users` (app-specific table synced from `auth.users`)
5. Frontend stores tokens
6. User redirected to workspace creation (first-time users have no workspaces)

#### Login Flow

1. User enters credentials
2. Supabase Auth verifies
3. Returns fresh tokens
4. Frontend stores tokens
5. User redirected to last active workspace

#### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Browser redirects to Google consent screen
3. User approves
4. Google redirects back with authorization code
5. Supabase exchanges code for user info
6. Creates or finds user account
7. Returns tokens, flow continues normally

#### Token Flow Through Every Request

1. **Frontend** — `api.ts` utility automatically attaches access token to every HTTP request header
2. **Express auth middleware** — extracts JWT from header, verifies signature using Supabase JWT secret, extracts user ID, attaches to `req.user`. Returns 401 if invalid/expired/missing
3. **Workspace middleware** — reads workspace slug from URL, queries members table for membership, attaches role to `req.membership`. Returns 403 if not a member
4. **RBAC middleware** — checks user's role against required permission for the action. Returns 403 if insufficient role
5. **Database (RLS)** — JWT is passed to the database session, RLS policies read `auth.uid()` to enforce row-level access

#### Token Refresh

Access token expires after 1 hour. Supabase client automatically uses the refresh token to get a new access token silently. The `onAuthStateChange` listener updates stored tokens. If the refresh token also expires (user inactive for weeks), redirect to login.

#### Route Protection

An `AuthGuard` component wraps protected routes in React Router. Checks for valid Supabase session. Valid → render page. Invalid → redirect to login with return URL preserved.

---

### 5.5 RBAC System

#### Role Definitions

| Role | Purpose | Count per workspace |
|---|---|---|
| Owner | Created the workspace. Full control | Exactly 1 |
| Admin | Trusted manager. Near-full control | Unlimited |
| Member | Regular team member. Create and edit work | Unlimited |
| Viewer | Read-only observer. Stakeholders, clients | Unlimited |

#### Complete Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| **Workspace** | | | | |
| View workspace | ✓ | ✓ | ✓ | ✓ |
| Update workspace | ✓ | ✓ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ | ✗ |
| **Members** | | | | |
| View members | ✓ | ✓ | ✓ | ✓ |
| Invite members | ✓ | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✓ | ✗ | ✗ |
| Change roles | ✓ | ✓ (not to owner) | ✗ | ✗ |
| **Projects** | | | | |
| View projects | ✓ | ✓ | ✓ | ✓ |
| Create project | ✓ | ✓ | ✓ | ✗ |
| Update project | ✓ | ✓ | ✓ | ✗ |
| Archive/delete project | ✓ | ✓ | ✗ | ✗ |
| **Tasks** | | | | |
| View tasks | ✓ | ✓ | ✓ | ✓ |
| Create task | ✓ | ✓ | ✓ | ✗ |
| Update/move task | ✓ | ✓ | ✓ | ✗ |
| Delete task | ✓ | ✓ | ✗ | ✗ |
| **Comments** | | | | |
| View comments | ✓ | ✓ | ✓ | ✓ |
| Create comment | ✓ | ✓ | ✓ | ✗ |
| Edit own comment | ✓ | ✓ | ✓ | ✗ |
| Delete any comment | ✓ | ✓ | ✗ | ✗ |
| Delete own comment | ✓ | ✓ | ✓ | ✗ |
| **Labels** | | | | |
| View labels | ✓ | ✓ | ✓ | ✓ |
| Create label | ✓ | ✓ | ✓ | ✗ |
| Update/delete label | ✓ | ✓ | ✗ | ✗ |
| **Invitations** | | | | |
| View invitations | ✓ | ✓ | ✗ | ✗ |
| Create invitation | ✓ | ✓ | ✗ | ✗ |
| Revoke invitation | ✓ | ✓ | ✗ | ✗ |

#### Edge Cases

- **Owner protection:** The owner can never be removed or demoted. Enforced in the service layer.
- **Self-demotion:** Admins can demote themselves to member. Owners cannot — ownership must be transferred, not dropped.
- **Ownership transfer:** Atomic two-step transaction — current owner becomes admin, target member becomes owner. Both must succeed or both roll back.
- **Role hierarchy:** Admins cannot promote someone to admin or owner. Only the owner can create admins.
- **Last admin protection:** If only one admin exists (besides owner), prevent self-demotion.

#### Enforcement Layers

1. **Frontend:** Hides UI elements (buttons, menus) based on role. Cosmetic only — never trust for security.
2. **Express middleware:** Primary defense. Checks role against permission matrix. Returns 403 with descriptive messages.
3. **Database RLS:** Safety net. Mirrors permission matrix at the row level. Catches any middleware bugs.

---

### 5.6 API Design

All endpoints return JSON. Success responses include the data directly. Error responses follow a consistent shape: `{ error: "ERROR_CODE", message: "Human-readable explanation", details?: {...} }`.

#### Auth Endpoints

| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/callback` | Handle OAuth callback, ensure user exists in public.users | Public |
| GET | `/api/auth/me` | Get current user profile | Auth |
| PATCH | `/api/auth/me` | Update profile (name, avatar) | Auth |

#### Workspace Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces` | List user's workspaces | Auth |
| POST | `/api/workspaces` | Create workspace (+ auto-create owner member) | Auth |
| GET | `/api/workspaces/:slug` | Get workspace details | Any member |
| PATCH | `/api/workspaces/:slug` | Update workspace | Owner, Admin |
| DELETE | `/api/workspaces/:slug` | Delete workspace (cascades) | Owner |

#### Member Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/members` | List workspace members | Any member |
| PATCH | `/api/workspaces/:slug/members/:memberId` | Change member role | Owner, Admin |
| DELETE | `/api/workspaces/:slug/members/:memberId` | Remove member | Owner, Admin |

#### Invitation Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/invitations` | List pending invitations | Owner, Admin |
| POST | `/api/workspaces/:slug/invitations` | Create invitation (send email) | Owner, Admin |
| POST | `/api/invitations/accept` | Accept invitation (by token) | Auth (not workspace-scoped) |
| DELETE | `/api/workspaces/:slug/invitations/:id` | Revoke invitation | Owner, Admin |

#### Project Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/projects` | List projects (filter by archived) | Any member |
| POST | `/api/workspaces/:slug/projects` | Create project | Member+ |
| GET | `/api/workspaces/:slug/projects/:projectId` | Get project details | Any member |
| PATCH | `/api/workspaces/:slug/projects/:projectId` | Update project | Member+ |
| DELETE | `/api/workspaces/:slug/projects/:projectId` | Delete project (cascades) | Owner, Admin |

#### Task Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/projects/:projectId/tasks` | List tasks (supports filters: status, priority, assignee) | Any member |
| POST | `/api/workspaces/:slug/projects/:projectId/tasks` | Create task (auto-increments task_number) | Member+ |
| GET | `/api/workspaces/:slug/tasks/:taskId` | Get full task details | Any member |
| PATCH | `/api/workspaces/:slug/tasks/:taskId` | Update task fields | Member+ |
| PATCH | `/api/workspaces/:slug/tasks/:taskId/move` | Drag-and-drop move (status + position) | Member+ |
| DELETE | `/api/workspaces/:slug/tasks/:taskId` | Delete task | Owner, Admin |

#### Comment Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/tasks/:taskId/comments` | List comments (paginated) | Any member |
| POST | `/api/workspaces/:slug/tasks/:taskId/comments` | Add comment | Member+ |
| PATCH | `/api/workspaces/:slug/comments/:commentId` | Edit comment | Author only |
| DELETE | `/api/workspaces/:slug/comments/:commentId` | Delete comment | Author, Admin, Owner |

#### Label Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/labels` | List workspace labels | Any member |
| POST | `/api/workspaces/:slug/labels` | Create label | Member+ |
| PATCH | `/api/workspaces/:slug/labels/:labelId` | Update label | Owner, Admin |
| DELETE | `/api/workspaces/:slug/labels/:labelId` | Delete label (removes from all tasks) | Owner, Admin |

#### Task-Label Endpoints

| Method | Route | Purpose | Permission |
|---|---|---|---|
| POST | `/api/workspaces/:slug/tasks/:taskId/labels` | Add label to task | Member+ |
| DELETE | `/api/workspaces/:slug/tasks/:taskId/labels/:labelId` | Remove label from task | Member+ |

#### Activity Log Endpoint

| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/activity` | List activity (paginated, filterable by entity_type) | Any member |

#### Middleware Chain

Every workspace-scoped route passes through: `rateLimiter → authMiddleware → workspaceMiddleware → rbacMiddleware(requiredPermission) → routeHandler`.

---

### 5.7 Invitation Flow

#### Happy Path — Existing User

1. Admin opens members page → clicks "Invite"
2. Enters invitee's email, selects role → POST `/api/workspaces/:slug/invitations`
3. Server validates: not already a member, no pending duplicate invitation
4. Generates cryptographically secure token (`crypto.randomUUID()`)
5. Creates invitation row (status: pending, expires_at: now + 48 hours)
6. Sends email via Resend with link: `app.com/invitations/accept?token=abc123`
7. Invitee clicks link → frontend reads token → POST `/api/invitations/accept`
8. Server verifies: token exists, status is pending, not expired
9. Creates member row with workspace_id and role from invitation
10. Updates invitation status to "accepted"
11. Redirects user to the workspace

#### Alternate Path — New User (No Account)

Steps 1–6 are identical. At step 7:

7. Invitee clicks link → not logged in → redirected to `/signup?invite=abc123`
8. User creates account via Supabase Auth
9. After signup, frontend reads `invite` query param → auto-calls accept endpoint
10. Flow continues from step 8 above

#### Edge Cases

| Scenario | Behavior |
|---|---|
| Duplicate invitation (same email, same workspace) | Return error: "invitation already sent" |
| Already a member | Return error: "already a member" |
| Expired token (past 48 hours) | Update status to "expired", show message |
| Revoked invitation | Reject with "invitation has been revoked" |
| Email mismatch (different user tries to accept) | Reject: "this invitation was sent to a different email" |
| Workspace deleted after invite sent | Token lookup returns nothing (cascade delete), show "not found" |
| Simultaneous acceptance (two devices) | First succeeds, second sees "already accepted" (DB uniqueness) |
| Re-invitation after removal | Works — old member row is deleted, new invitation is valid |
| Admin invites themselves | Caught by "already a member" check |

#### Security

- Tokens are generated with `crypto.randomUUID()` (128-bit, cryptographically secure)
- Tokens are single-use — status changes on acceptance
- Tokens expire after 48 hours
- Tokens are never exposed in API responses — only sent via email
- Rate limit: 10 invitations per hour per workspace

---

### 5.8 Frontend Component Architecture

#### Layout System

Three layout contexts handled by React Router layout routes:

- **Public layout:** Login, Signup, InviteAccept. No sidebar, no header. Content centered.
- **Workspace layout:** All workspace pages. Sidebar (left) + Header (top) + Content area (center). Sidebar and header persist across navigation — only the content area re-renders.
- **Onboarding layout:** First-time users with no workspace. Centered card for workspace creation.

#### Component Hierarchy

```
App (root)
├── AuthGuard (checks session, redirects if unauthenticated)
│   ├── WorkspaceLayout (sidebar + header + outlet)
│   │   ├── Sidebar
│   │   │   ├── WorkspaceSwitcher
│   │   │   └── ProjectList (navigation links)
│   │   ├── Header
│   │   │   ├── Breadcrumb
│   │   │   ├── CommandPalette trigger
│   │   │   └── UserAvatar + dropdown
│   │   └── [Child Route — content area]
│   │       ├── ProjectBoard
│   │       │   ├── BoardHeader (filters, view toggle)
│   │       │   ├── KanbanView
│   │       │   │   ├── KanbanColumn (per status)
│   │       │   │   │   ├── TaskCard (draggable)
│   │       │   │   │   └── TaskQuickCreate
│   │       │   │   └── DragOverlay
│   │       │   └── TaskDetailModal
│   │       ├── ProjectList (table view)
│   │       ├── MembersPage
│   │       │   ├── MemberList
│   │       │   ├── InviteDialog
│   │       │   └── RoleChangeDropdown
│   │       ├── SettingsPage
│   │       │   ├── WorkspaceForm
│   │       │   └── DangerZone
│   │       └── ActivityPage
│   │           ├── ActivityList
│   │           └── ActivityFilters
│   └── OnboardingLayout (no workspace yet)
└── Public routes (Login, Signup, InviteAccept)
```

#### Kanban Board Components

- **KanbanView** — container holding all columns. Sets up DndContext (dnd-kit root). Manages global drag state.
- **KanbanColumn** — single column (one per status). Droppable zone. Shows column header with task count, list of TaskCards, and TaskQuickCreate at the bottom.
- **TaskCard** — single task. Draggable. Shows title, task number (ENG-1), priority badge, assignee avatar, label badges, comment count, due date. Clicking opens TaskDetailModal. Must be lightweight — 50–100 cards may render simultaneously.
- **TaskDetailModal** — slide-over panel on task click. Editable title, markdown description editor, properties panel (status, priority, assignee, labels, due date), comments thread, task activity history.
- **TaskQuickCreate** — inline text input at column bottom. Type title, press enter, task created in that column.
- **DragOverlay** — visual clone following cursor during drag. Semi-transparent, elevated appearance.

#### Shared Components

- **CommandPalette** — Cmd+K search dialog. Quick-find tasks, projects, members.
- **WorkspaceSwitcher** — sidebar dropdown listing user's workspaces.
- **UserAvatar** — avatar image with initials fallback.
- **RoleBadge** — colored badge (Owner/Admin/Member/Viewer).
- **PriorityBadge** — color-coded priority indicator.
- **StatusBadge** — color-coded status indicator.
- **EmptyState** — placeholder for empty lists.
- **ConfirmDialog** — confirmation modal for destructive actions.

#### Design Principles

- **Smart vs dumb:** Pages fetch data and manage state (smart). UI components receive props and render (dumb). Dumb components are reusable and testable.
- **Co-location:** Feature-specific components live next to the feature. Shared components live in `/components/common/`.
- **Composition over configuration:** Small components composed together, not monolithic components with many boolean props.
- **Single responsibility:** Each component does one thing. TaskCard renders; it doesn't fetch, manage drag state, or handle modals.

---

### 5.9 State Management Architecture

#### Server State (TanStack Query)

Every piece of data from the database is managed by TanStack Query with hierarchical cache keys.

| Data | Query Key | Stale Time | Invalidation Triggers |
|---|---|---|---|
| User's workspaces | `['workspaces']` | Long (minutes) | Create workspace, accept invitation |
| Workspace details | `['workspace', slug]` | Long | Update workspace settings |
| Members | `['members', workspaceSlug]` | Medium | Member joins, removed, role changed |
| Projects | `['projects', workspaceSlug]` | Medium | Project created, updated, archived |
| Tasks (board) | `['tasks', projectId]` | Short (30s) | Every task mutation + Realtime events |
| Single task | `['task', taskId]` | Short | Task updated |
| Comments | `['comments', taskId]` | Medium | Comment added, edited, deleted |
| Labels | `['labels', workspaceSlug]` | Long | Label created, updated, deleted |
| Invitations | `['invitations', workspaceSlug]` | Medium | Invitation created, revoked, accepted |
| Activity log | `['activity', workspaceSlug]` | Short | Any workspace mutation |

**Targeted invalidation:** Invalidating `['tasks', engProjectId]` only refetches the ENG board. Other projects' caches remain untouched. Invalidating `['tasks']` (no projectId) refetches all project boards — used for workspace-wide changes.

#### Optimistic Update Strategy

| Action | Optimistic? | Reason |
|---|---|---|
| Move task (drag & drop) | Yes | Must feel instant — core interaction |
| Reorder within column | Yes | Same as above |
| Quick-edit task title | Yes | Inline editing expects instant feedback |
| Create task | No | Brief loading state is acceptable for form submission |
| Delete task | No | Destructive action — loading state signals seriousness |
| Create/edit comment | No | Brief submit spinner is normal |
| Change member role | No | Infrequent admin action |

**Optimistic flow:** Snapshot cache → cancel in-flight refetches → update cache immediately → fire mutation → on success: refetch to confirm → on failure: restore snapshot + show error toast.

#### Client State (Zustand)

| Store | State | Purpose |
|---|---|---|
| **uiStore** | `isSidebarCollapsed`, `taskDetailId`, `commandPaletteOpen`, `activeView` (kanban/list) | Visual UI state |
| **filterStore** | `statusFilter[]`, `priorityFilter[]`, `assigneeFilter[]`, `searchQuery` | Board filtering (applied client-side to cached data — no API calls) |
| **authStore** | `currentUser`, `currentWorkspaceSlug` | Quick access to session info without API calls |

#### Cache Invalidation Sources

1. **User actions:** Explicit `queryClient.invalidateQueries` in mutation `onSuccess` callbacks.
2. **Supabase Realtime:** WebSocket events from other users trigger cache invalidation.
3. **Window focus:** TanStack Query refetches stale queries when the user returns to the browser tab.

#### Data Flow for the Kanban Board

TanStack Query fetches all tasks for the project → tasks cached → custom hook reads cached tasks + applies active filters from Zustand filterStore → filtered tasks grouped by status → each KanbanColumn receives its tasks → renders TaskCards.

Filter change: Zustand updates filter value → hook re-runs → tasks re-filtered from existing cache → board re-renders. No API call. Instant.

Realtime event: Supabase broadcasts change → listener invalidates `['tasks', projectId]` → TanStack Query refetches → hook re-runs with new data + current filters → board updates.

#### What Does NOT Go in State

- **Form inputs** — managed by React Hook Form
- **Derived data** — computed from existing state (e.g., task count per column = filter tasks by status and count)
- **Ref-based values** — scroll positions, animation states, focus tracking (React refs, not state)

---

### 5.10 Kanban Board Architecture

Four interconnected systems power the board: fractional indexing (ordering), dnd-kit (interaction), optimistic updates (perceived performance), and Supabase Realtime (multi-user sync).

#### 1. Fractional Indexing

Every task has a `position` column (REAL/float). Tasks within a column render in ascending position order.

**Why not integers?** Inserting between integer positions (1, 2, 3) requires reindexing all subsequent rows. Fractional indexing inserts between any two tasks with a single database update.

**Position calculation:**

| Drop Location | Calculation |
|---|---|
| Top of column | First task's position − 1.0 |
| Bottom of column | Last task's position + 1.0 |
| Between two tasks | Average of above and below positions |
| Empty column | Default 1.0 |

**Precision problem:** After ~50 consecutive insertions between the same two tasks, floating point precision degrades. **Solution:** Background rebalancing job detects when the gap between adjacent positions falls below 0.001 and resets positions to clean integers. Runs asynchronously, rarely needed.

#### 2. Drag and Drop (dnd-kit)

**DndContext** wraps the entire board — tracks global drag state (what's dragged, where it's hovering).

**SortableContext** wraps each column — enables reordering within and across columns.

**useSortable hook** on each TaskCard — makes it draggable with transform and transition styles.

**Drag lifecycle:**

| Event | What Happens |
|---|---|
| `onDragStart` | Record which task is dragged. Show DragOverlay (cursor-following clone). Original card becomes semi-transparent. |
| `onDragOver` | Detect hover target (which column, between which tasks). Other cards shift to show drop preview. |
| `onDragEnd` | Calculate new position (fractional indexing). Fire optimistic update + API mutation. |
| `onDragCancel` | Revert everything. No mutation. |

**Cross-column drag** changes both `status` and `position`. **Within-column reorder** changes only `position`. Both use the same PATCH `/move` endpoint.

#### 3. Optimistic Updates

The board updates instantly — no loading spinner on drag.

**Step-by-step sequence:**

1. **Snapshot** — TanStack Query saves current task cache (rollback point)
2. **Cancel refetches** — prevent background refetches from overwriting the optimistic update
3. **Update cache** — directly modify the cached task list (move task to new status/position). Board re-renders instantly
4. **Fire mutation** — PATCH request to server runs in the background
5. **On success** — refetch tasks to ensure cache matches server
6. **On failure** — restore snapshot from step 1. Task visually jumps back. Show error toast: "Failed to move task. Reverted."

#### 4. Real-time Sync

When the board loads, the frontend subscribes to a Supabase Realtime channel scoped to the project's task table.

**Multi-user flow:**

1. User A drags a task → optimistic update renders instantly on A's screen
2. PATCH request hits Express → server updates PostgreSQL
3. Supabase Realtime detects the row change → broadcasts WebSocket event
4. User B's frontend receives the event → invalidates `['tasks', projectId]`
5. TanStack Query refetches → User B's board re-renders (1–2 second delay)

**Conflict resolution:** Last write wins. If two users drag the same task simultaneously, the database processes requests sequentially. Both users receive the final state via Realtime and converge. For a Kanban board, this is the industry standard (used by Linear, Jira).

**Channel scoping:** Each project has its own channel. Viewing the ENG board subscribes only to ENG task changes. DESIGN project changes don't trigger events.

**Cleanup:** Navigating away unsubscribes the Realtime channel. Navigating back creates a new subscription and refetches.

#### Complete Drag Sequence

User grabs card → **dnd-kit** tracks drag → user drops between two cards in a different column → **dnd-kit** fires `onDragEnd` → handler calculates new position via **fractional indexing** → **TanStack Query** snapshots cache, optimistically moves the task → board re-renders instantly → PATCH request fires → Express validates, updates PostgreSQL → **Supabase Realtime** broadcasts → other clients invalidate cache and refetch → all boards converge.

---

## 6. Interview Talking Points

**Q: How do you handle multi-tenancy?**
Shared database with PostgreSQL Row-Level Security. Every table has a `workspace_id` column. RLS policies enforce that users can only access data in workspaces they belong to. Even if application code has a bug, the database prevents cross-tenant data leaks. For enterprise customers needing data residency, I would migrate to schema-per-tenant.

**Q: How does drag-and-drop ordering work?**
Fractional indexing. Each task has a REAL-type position column. Moving between two items averages their positions (1.0 and 2.0 becomes 1.5). One database update per drag, no reindexing. Background rebalancing resets positions when precision degrades.

**Q: What happens when the server is slow?**
Optimistic updates via TanStack Query. The UI updates immediately using `onMutate` to modify the local cache. The mutation fires asynchronously. If the server returns an error, `onError` rolls back to the pre-mutation snapshot. This is how Linear and Figma achieve responsive feel.

**Q: How do you handle permissions?**
Three layers of defense-in-depth. Layer 1: Frontend hides unauthorized UI (cosmetic). Layer 2: Express middleware checks workspace membership and role (primary enforcement). Layer 3: RLS policies at the database level (safety net). No single layer failure compromises security.

**Q: How does real-time sync work?**
Supabase Realtime listens to PostgreSQL changes via WebSocket. When any client updates a task, all subscribed clients receive the event and invalidate their TanStack Query cache, triggering a refetch. Channels are scoped per project to minimize unnecessary traffic.

**Q: How would you scale this?**
PgBouncer for connection pooling, Redis for caching hot queries, database read replicas for heavy read workloads, distributed rate limiting counters in Redis, CDN caching for static assets. For true multi-user real-time editing, I would explore CRDT-based conflict resolution.

**Q: Why separate React + Express instead of Next.js?**
I wanted to understand each layer independently — routing, API design, middleware chains, CORS, deployment orchestration — rather than having a framework abstract it away. The tradeoff: more boilerplate and two deployments, but deeper architectural understanding.

**Q: Why Supabase over raw Postgres?**
Free tier covers project needs (500MB DB, auth, realtime). The RLS I implemented is standard Postgres — the skill transfers to any Postgres deployment. Supabase Realtime gives WebSocket-based live updates without managing a separate WebSocket server. At scale, I would consider managed Postgres on AWS RDS or Neon.

---

*Document generated: April 6, 2026. Built with Claude | Powered by Anthropic.*
