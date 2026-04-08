# WorkNest — Product Guide

**Version:** 1.0  
**Date:** April 6, 2026  
**Document Type:** Product Overview, Features, User Roles, Data Flow & User Flows

---

## Table of Contents

1. What is WorkNest
2. Who Uses WorkNest
3. Core Features
4. User Roles & Permissions
5. Data Flow Architecture
6. User Flows (Detailed)
   - 6.1 Signup & Onboarding
   - 6.2 Workspace Creation
   - 6.3 Member Invitation
   - 6.4 Project Creation
   - 6.5 Task Lifecycle
   - 6.6 Kanban Board Interaction
   - 6.7 Task Detail & Collaboration
   - 6.8 Workspace Switching
   - 6.9 Filtering & Search
   - 6.10 Settings & Administration
   - 6.11 Activity Feed
   - 6.12 Ownership Transfer

---

## 1. What is WorkNest

WorkNest is a **multi-tenant SaaS project management tool** — a simplified version of tools like Linear, Jira, and Asana. It helps teams organize their work visually using Kanban boards, track tasks through stages of completion, assign responsibilities, and collaborate in real time.

**Multi-tenant** means multiple companies (called "tenants") use the same application, the same servers, and the same database — but they never see each other's data. Company A's projects, tasks, and members are completely invisible to Company B. One application serving many isolated customers. This is how Slack, Notion, Jira, and Linear all work.

**The core experience:** A team signs up, creates a workspace (like "Acme Corp"), invites their teammates, creates projects (like "Engineering" or "Marketing"), and organizes tasks on a drag-and-drop Kanban board with columns like Backlog, To Do, In Progress, In Review, and Done. Everyone on the team sees changes in real time — when one person moves a task, every connected teammate sees it move on their screen within seconds.

---

## 2. Who Uses WorkNest

### Primary Users

**Small to mid-size teams (3–20 people)** who need a lightweight project management tool without the complexity of enterprise solutions like Jira. Think startup engineering teams, design agencies, marketing teams, freelance collectives, student project groups, and early-stage companies.

### User Personas

**Persona 1: The Team Lead (Admin/Owner)**

Name: Priya, Engineering Lead at a 12-person startup.

She creates the workspace, sets up projects for different workstreams (Backend, Frontend, DevOps), invites her team, and monitors progress across all projects. She needs to see who's working on what, identify bottlenecks (too many tasks stuck in "In Review"), and manage team access. She uses the activity feed to stay updated without interrupting her team. She assigns tasks, sets priorities, and occasionally removes completed projects.

**Persona 2: The Team Member (Member)**

Name: Arjun, Frontend Developer on Priya's team.

He opens WorkNest every morning, checks his assigned tasks, drags the task he's starting into "In Progress," and moves completed tasks to "In Review." He creates new tasks when he discovers bugs, adds comments on tasks to discuss implementation details with teammates, and uses labels to categorize work ("bug", "feature", "tech-debt"). He doesn't manage members or settings — he focuses on getting work done.

**Persona 3: The Stakeholder (Viewer)**

Name: Rahul, Product Manager who oversees multiple teams.

He has viewer access to three workspaces — Engineering, Design, and Marketing. He checks the boards weekly to see sprint progress, reads comments on key tasks for context, and uses filters to see only high-priority items. He never creates or edits anything — he observes and makes decisions based on what he sees.

**Persona 4: The Workspace Creator (Owner)**

Name: Sneha, Founder of a design agency.

She created the workspace for her 8-person agency. She's the owner — she manages billing (future feature), controls who can invite members, transfers admin rights to her operations manager, and can delete the workspace if the agency shuts down. She rarely interacts with tasks directly but has full power over the workspace itself.

---

## 3. Core Features

### 3.1 Workspace Management

A workspace is the top-level container — one per company or team. It has a unique name and URL slug (e.g., `app.com/w/acme-corp`). Users can belong to multiple workspaces and switch between them instantly via the workspace switcher in the sidebar.

Workspaces provide complete data isolation. Everything inside a workspace — projects, tasks, members, labels, comments, activity — is invisible to users outside that workspace. This isolation is enforced at the database level via Row-Level Security, not just in application code.

### 3.2 Member Invitation System

Workspace admins and owners can invite new members by email. The system generates a secure, time-limited invitation link (48-hour expiry). The invitee receives an email, clicks the link, and joins the workspace with a pre-assigned role. If the invitee doesn't have a WorkNest account, they're guided through signup first, then automatically joined to the workspace.

Admins can view pending invitations, revoke invitations that haven't been accepted, and re-invite removed members. The invitation system handles edge cases like duplicate invitations, expired tokens, and email mismatches.

### 3.3 Role-Based Access Control (RBAC)

Every workspace member has one of four roles: Owner, Admin, Member, or Viewer. Each role has a specific set of permissions that control what the user can see and do. Roles are enforced at three layers — the UI hides unauthorized actions, the API middleware blocks unauthorized requests, and the database rejects unauthorized queries.

Roles can be changed by admins and owners. Ownership can be transferred but never dropped — there is always exactly one owner per workspace.

### 3.4 Project Management

Projects are containers within a workspace that group related tasks. Each project has a name, description, accent color, and a short key (like "ENG" or "MKT") that prefixes task numbers. Tasks within the Engineering project are numbered ENG-1, ENG-2, ENG-3 — auto-incrementing and never reused even if tasks are deleted.

Projects can be archived (hidden from the active list but preserved with all data) or deleted (permanently removed along with all tasks, comments, and activity). Users can create multiple projects within a workspace to organize work by team, workstream, client, or any other grouping.

### 3.5 Kanban Board

The visual heart of WorkNest. Each project has a Kanban board with six columns representing task statuses: **Backlog** (ideas and future work), **To Do** (planned for current sprint), **In Progress** (actively being worked on), **In Review** (waiting for review/feedback), **Done** (completed), and **Cancelled** (abandoned).

Users drag task cards between columns to update their status. Cards can also be reordered within a column to indicate priority or sequence. The board uses fractional indexing for ordering (so dragging one card never requires re-sorting the entire column) and optimistic updates for instant visual feedback (the card moves immediately without waiting for the server).

### 3.6 Task Management

Tasks are the atomic unit of work. Each task has a title, optional markdown description, status (which column it's in), priority level (urgent, high, medium, low, none), assignee (who's responsible), labels (categorical tags), due date, task number (ENG-1 format), and a comments thread.

Tasks support the following operations: create (via quick-create input at the bottom of each column or via a full creation form), edit (inline title editing, full detail editing in the modal), move (drag between columns or change status in the detail modal), assign (select a team member), label (add/remove categorical tags), comment (threaded markdown discussion), and delete (admin/owner only).

Subtasks are supported through a parent-child relationship — a task can reference another task as its parent, enabling hierarchical work breakdown.

### 3.7 Real-Time Collaboration

When multiple users are viewing the same board, changes sync in real time. User A drags a task to "Done" — User B sees the task move on their screen within 1–2 seconds, without refreshing. This is powered by Supabase Realtime, which broadcasts database changes via WebSocket to all subscribed clients.

Real-time sync covers task creation, task updates (status, priority, assignee, title), task deletion, and task reordering. Comments and member changes also trigger cache invalidation so connected clients stay current.

### 3.8 Task Detail View

Clicking a task card opens a detailed slide-over panel showing the full task information. The detail view includes an editable title, a rich markdown description editor, a properties panel (status dropdown, priority selector, assignee picker, label selector, due date picker), a comments thread for discussion, and an activity history showing all changes made to the task (who changed what, when).

### 3.9 Labels

Labels are workspace-wide tags that can be applied to tasks across all projects. Each label has a name and a color. Examples: "bug" (red), "feature" (green), "tech-debt" (yellow), "design" (purple), "urgent" (orange). Labels help categorize and filter work. A task can have multiple labels. Labels are created at the workspace level and shared across all projects.

### 3.10 Filters & Search

The board supports filtering by status (show/hide specific columns), priority (show only high and urgent tasks), assignee (show only tasks assigned to specific people), and labels (show only tasks with specific tags). Filters are applied client-side to the cached task list — no API calls, instant results.

A global search (Cmd+K command palette) lets users quickly find tasks, projects, or members across the entire workspace by typing a few characters.

### 3.11 List View

An alternative to the Kanban board — a table view showing all tasks in a project as sortable rows. Columns include task number, title, status, priority, assignee, due date, and labels. Users can sort by any column and toggle between Kanban and list view. Both views share the same data and filters.

### 3.12 Activity Feed

A chronological audit trail of everything that happens in the workspace. Every significant action is logged: task created, task moved from "To Do" to "In Progress", member invited, comment added, project archived, role changed. Each entry shows who performed the action, what they did, and when. The feed can be filtered by entity type (show only task activity, or only member activity).

### 3.13 Workspace Settings

The settings page allows admins and owners to update the workspace name and logo. A danger zone section provides destructive actions — transferring ownership to another member, or deleting the workspace entirely (with confirmation dialog and consequences explained).

### 3.14 Quick Task Creation

Each Kanban column has an "Add task" input at the bottom. Users type a title, press Enter, and a task is instantly created in that column with default settings (no assignee, no labels, no due date, medium priority). This enables rapid task capture without interrupting workflow. Full details can be added later via the task detail modal.

### 3.15 Authentication

Users sign up with email/password or Google OAuth. Sessions persist across browser refreshes and tabs. Tokens refresh silently — users don't need to re-login unless they've been inactive for an extended period. All routes beyond login and signup are protected.

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

**Owner** — The person who created the workspace. Has absolute control. There is exactly one owner per workspace at all times. Ownership can be transferred to another member but cannot be abandoned. The owner is the last line of defense — they can undo any admin action, remove any member, and delete the workspace.

**Admin** — A trusted manager. Can do nearly everything the owner can — manage members, change roles, invite and remove people, delete tasks, archive projects. Cannot delete the workspace, cannot remove the owner, and cannot promote anyone to owner. Admins are typically team leads, engineering managers, or operations staff.

**Member** — The standard role for people doing the work. Can create projects, create and edit tasks, move cards on the board, add comments, create labels, and assign work. Cannot manage members, send invitations, change roles, or delete other people's work. This is the default role assigned when someone accepts an invitation.

**Viewer** — Read-only access. Can see everything in the workspace — all projects, tasks, comments, members, activity. Cannot create, edit, move, or delete anything. Useful for stakeholders, clients, executives, or external collaborators who need visibility without the ability to modify work.

### 4.2 Role Hierarchy

```
Owner (1 per workspace)
  └── Can do everything
  └── Can create/remove Admins
  └── Can transfer ownership
  └── Can delete workspace

Admin (unlimited)
  └── Can do almost everything
  └── Can invite/remove Members and Viewers
  └── Cannot touch the Owner
  └── Cannot delete workspace

Member (unlimited)
  └── Can create and manage work
  └── Cannot manage people
  └── Cannot delete others' work

Viewer (unlimited)
  └── Can only observe
  └── Cannot modify anything
```

### 4.3 Complete Permission Table

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View workspace, projects, tasks, comments, activity | ✓ | ✓ | ✓ | ✓ |
| Create project | ✓ | ✓ | ✓ | ✗ |
| Update project | ✓ | ✓ | ✓ | ✗ |
| Archive/delete project | ✓ | ✓ | ✗ | ✗ |
| Create task | ✓ | ✓ | ✓ | ✗ |
| Edit/move task | ✓ | ✓ | ✓ | ✗ |
| Delete task | ✓ | ✓ | ✗ | ✗ |
| Add comment | ✓ | ✓ | ✓ | ✗ |
| Edit own comment | ✓ | ✓ | ✓ | ✗ |
| Delete any comment | ✓ | ✓ | ✗ | ✗ |
| Create label | ✓ | ✓ | ✓ | ✗ |
| Edit/delete label | ✓ | ✓ | ✗ | ✗ |
| View members | ✓ | ✓ | ✓ | ✓ |
| Invite members | ✓ | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✓ | ✗ | ✗ |
| Change member roles | ✓ | ✓ (limited) | ✗ | ✗ |
| Update workspace settings | ✓ | ✓ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ | ✗ |

### 4.4 Role Assignment Rules

- When a user creates a workspace, they automatically become the **Owner**.
- When a user accepts an invitation, they get the role specified in the invitation (default: **Member**).
- Admins can change anyone's role to Member or Viewer, but cannot promote to Admin or Owner.
- Only the Owner can promote someone to Admin.
- Only the Owner can transfer ownership (which demotes the current owner to Admin).
- The Owner role cannot be demoted or removed — only transferred.
- A user's role is per-workspace — they can be Owner of "Acme Corp" and Viewer of "Beta Inc" simultaneously.

---

## 5. Data Flow Architecture

### 5.1 High-Level Data Flow

```
User's Browser (React)
     │
     ├── User actions (click, type, drag)
     │        │
     │        ▼
     │   React Hook Form (validates form input using Zod schema)
     │        │
     │        ▼
     │   Custom Hook (e.g., useCreateTask, useMoveTask)
     │        │
     │        ▼
     │   TanStack Query Mutation
     │        │
     │        ├── [Optimistic path] Update cache immediately → UI re-renders
     │        │
     │        ▼
     │   API Client (api.ts) — attaches JWT auth header
     │        │
     │        ▼ HTTPS
     │
Express Server
     │
     ├── Rate Limiter Middleware (express-rate-limit)
     │        │ pass
     │        ▼
     ├── Auth Middleware (verify JWT, extract user ID)
     │        │ pass
     │        ▼
     ├── Workspace Middleware (verify membership, extract role)
     │        │ pass
     │        ▼
     ├── RBAC Middleware (check role against required permission)
     │        │ pass
     │        ▼
     ├── Zod Validation (validate request body)
     │        │ pass
     │        ▼
     ├── Route Handler (parse request, call service)
     │        │
     │        ▼
     ├── Service Layer (business logic, no HTTP awareness)
     │        │
     │        ▼
     ├── Drizzle ORM (type-safe query generation)
     │        │
     │        ▼ SQL
     │
Supabase PostgreSQL
     │
     ├── RLS Policy Check (is user a workspace member? correct role?)
     │        │ pass
     │        ▼
     ├── Execute Query (read/write data)
     │        │
     │        ▼
     ├── Return Result → Drizzle → Service → Route → HTTP Response
     │
     │        [Simultaneously]
     │        │
     │        ▼
     ├── Supabase Realtime detects row change
     │        │
     │        ▼ WebSocket broadcast
     │
Other Connected Browsers
     │
     ├── Receive Realtime event
     │        │
     │        ▼
     ├── TanStack Query cache invalidation
     │        │
     │        ▼
     ├── Automatic refetch → UI re-renders with latest data
```

### 5.2 Read Flow (Loading the Kanban Board)

1. User navigates to `/w/acme-corp/projects/eng/board`
2. React Router matches the route, renders WorkspaceLayout → ProjectBoard
3. `useTasks(projectId)` hook fires — TanStack Query checks cache
4. Cache miss (first load) → API client sends GET `/api/workspaces/acme-corp/projects/:id/tasks` with JWT
5. Express middleware chain: rate limit → auth (verify JWT) → workspace (verify membership) → RBAC (verify read permission)
6. Route handler calls `taskService.getByProject(projectId)`
7. Drizzle generates SQL: `SELECT * FROM tasks WHERE project_id = ? ORDER BY status, position`
8. PostgreSQL executes with RLS — only returns tasks where `workspace_id` matches a workspace the user belongs to
9. Results flow back: Drizzle → Service → Route → JSON response
10. TanStack Query caches the result with key `['tasks', projectId]`
11. Custom hook applies Zustand filters (status, priority, assignee) to cached data
12. Filtered tasks grouped by status → each KanbanColumn receives its tasks → TaskCards render
13. Supabase Realtime subscription established for this project's task table

### 5.3 Write Flow (Moving a Task via Drag & Drop)

1. User drags "Fix login bug" from "To Do" column to "In Progress" column
2. dnd-kit fires `onDragEnd` with source (todo, position 3) and destination (in_progress, between task A and task B)
3. Handler calculates new position: (taskA.position + taskB.position) / 2
4. `useMoveTask()` mutation fires with `{ status: 'in_progress', position: 1.75 }`
5. `onMutate` callback: snapshot current cache → cancel in-flight refetches → optimistically update cache (move task to new status and position) → board re-renders instantly
6. API client sends PATCH `/api/workspaces/acme-corp/tasks/:taskId/move` with JWT
7. Express middleware chain validates auth, membership, role (Member+)
8. Zod validates request body: status is valid enum, position is a number
9. Service updates the task: `UPDATE tasks SET status = 'in_progress', position = 1.75 WHERE id = ?`
10. RLS confirms user is a workspace member — query executes
11. Activity log entry created: "Arjun moved Fix login bug from To Do to In Progress"
12. Response: 200 OK
13. `onSuccess`: TanStack Query refetches tasks in background to confirm cache matches server
14. Supabase Realtime broadcasts the UPDATE event via WebSocket
15. Other connected clients receive the event → invalidate their `['tasks', projectId]` cache → refetch → their boards update

### 5.4 Real-Time Sync Flow

1. User A and User B both have the ENG project board open
2. Both browsers are subscribed to the Supabase Realtime channel for tasks in this project
3. User A creates a new task "Add dark mode"
4. User A's browser: optimistic update adds the task to the board instantly
5. Express processes the POST request, inserts the task into PostgreSQL
6. Supabase Realtime detects the INSERT on the tasks table
7. Broadcasts a WebSocket event to all channel subscribers
8. User B's browser receives the event
9. TanStack Query invalidates `['tasks', projectId]`
10. Background refetch fires → User B's board re-renders with "Add dark mode" visible
11. Total latency for User B: 1–2 seconds from User A's action

### 5.5 Authentication Data Flow

1. User enters credentials on login page
2. Supabase Auth verifies credentials (password hash check or OAuth verification)
3. Returns access token (JWT, 1-hour expiry) + refresh token (long-lived)
4. Frontend stores both tokens (managed by Supabase client)
5. Every subsequent API request: `api.ts` reads the current access token → attaches as `Authorization: Bearer <token>`
6. Express `auth.middleware.ts` reads the header → verifies JWT signature using Supabase JWT secret → extracts `user_id` → attaches to `req.user`
7. When access token expires (1 hour): Supabase client automatically uses refresh token to get a new access token → seamless, invisible to user
8. When refresh token expires (user inactive for extended period): Supabase client detects invalid session → `onAuthStateChange` fires → frontend redirects to login

### 5.6 Error Flow

1. User attempts an action (e.g., Viewer tries to create a task)
2. Frontend sends POST `/api/workspaces/:slug/projects/:id/tasks`
3. Express auth middleware: pass (user is authenticated)
4. Workspace middleware: pass (user is a member)
5. RBAC middleware: FAIL — Viewer role does not have "create task" permission
6. Middleware returns HTTP 403: `{ error: "FORBIDDEN", message: "Viewers cannot create tasks" }`
7. TanStack Query mutation `onError` fires
8. If optimistic update was applied: rollback to snapshot
9. Frontend shows toast notification: "Viewers cannot create tasks"
10. Even if middleware had a bug and let the request through: Drizzle sends the query → PostgreSQL RLS policy rejects it (Viewer role blocked for INSERT on tasks) → query returns zero rows → service throws error → still blocked

---

## 6. User Flows (Detailed)

### 6.1 Signup & Onboarding

**New user with no invitation:**

1. User visits WorkNest landing/login page
2. Clicks "Sign up" → navigates to signup page
3. Enters email and password, or clicks "Continue with Google"
4. **Email/password path:** Supabase Auth creates account → sends verification email → user verifies → logged in
5. **Google OAuth path:** redirects to Google consent → approves → redirected back → account created → logged in
6. Database trigger creates a row in `public.users` with profile info
7. Frontend checks: does the user belong to any workspaces? → No
8. Redirects to onboarding screen: "Welcome to WorkNest. Create your first workspace."
9. User enters workspace name (e.g., "Acme Corp") → system generates slug (`acme-corp`)
10. Workspace created → user automatically added as Owner
11. Redirected to the empty workspace dashboard: "Create your first project to get started."

**New user with invitation:**

1. User receives invitation email → clicks the link: `app.com/invitations/accept?token=abc123`
2. Frontend detects no active session → redirects to signup page with token preserved: `/signup?invite=abc123`
3. User creates account (email/password or Google)
4. After signup, frontend reads `invite` query param → automatically calls POST `/api/invitations/accept`
5. Server verifies token → creates member row → updates invitation status
6. User is now a member of the workspace → redirected to the workspace dashboard

**Returning user:**

1. User visits WorkNest
2. Supabase client checks for existing session → valid tokens found
3. Automatically authenticated → redirected to last active workspace

### 6.2 Workspace Creation

1. User clicks "Create Workspace" (from onboarding screen or workspace switcher)
2. Modal or page appears with a form: workspace name (required), logo (optional)
3. User types "Acme Corp"
4. System auto-generates slug: `acme-corp` (lowercased, spaces to hyphens, special chars removed)
5. User can edit the slug if desired
6. Clicks "Create"
7. Frontend validates with Zod → sends POST `/api/workspaces`
8. Backend validates uniqueness of slug → creates workspace row → creates member row (user as Owner) → logs activity ("Workspace created")
9. Frontend receives the new workspace → navigates to `/w/acme-corp`
10. Empty workspace dashboard: sidebar shows workspace name, no projects yet
11. Prompt: "Create your first project to start organizing work"

### 6.3 Member Invitation

**Sending an invitation:**

1. Admin/Owner navigates to Members page (`/w/acme-corp/members`)
2. Sees current member list with roles
3. Clicks "Invite Member" button
4. Dialog appears: email input field + role selector (Member or Viewer dropdown)
5. Types `arjun@company.com`, selects "Member"
6. Clicks "Send Invitation"
7. Frontend validates email format (Zod) → sends POST `/api/workspaces/acme-corp/invitations`
8. Backend checks: is this email already a member? → No. Is there a pending invitation for this email? → No
9. Generates secure token → creates invitation row (status: pending, expires in 48 hours)
10. Sends email via Resend with invitation link
11. Frontend shows success toast: "Invitation sent to arjun@company.com"
12. Invitation appears in the pending invitations list below the member list

**Accepting an invitation:**

1. Arjun receives email with subject "You've been invited to Acme Corp on WorkNest"
2. Email contains a button: "Accept Invitation" → links to `app.com/invitations/accept?token=abc123`
3. Arjun clicks the link
4. **If Arjun has an account and is logged in:** frontend reads token → calls accept endpoint → server verifies → creates member row → redirects to workspace
5. **If Arjun has an account but is logged out:** redirects to login with token preserved → after login → auto-accepts → redirects to workspace
6. **If Arjun has no account:** redirects to signup with token preserved → after signup → auto-accepts → redirects to workspace
7. Arjun is now a Member of Acme Corp → sees the workspace dashboard with all projects and tasks

**Revoking an invitation:**

1. Admin sees a pending invitation in the list
2. Clicks "Revoke" next to the invitation
3. Confirmation dialog: "Revoke invitation to arjun@company.com?"
4. Confirms → PATCH updates invitation status to "revoked"
5. If Arjun later clicks the link, they see: "This invitation has been revoked. Please contact your workspace admin."

### 6.4 Project Creation

1. User (Member+) clicks "New Project" in the sidebar or projects page
2. Form appears: project name (required), project key (required, auto-suggested from name), color (optional, color picker), description (optional)
3. User types name: "Engineering" → key auto-suggests: "ENG"
4. User can modify the key (must be uppercase letters, 2–5 characters)
5. Picks a color (e.g., indigo)
6. Clicks "Create Project"
7. Frontend validates → sends POST `/api/workspaces/acme-corp/projects`
8. Backend validates key uniqueness within workspace → creates project row → logs activity
9. Project appears in the sidebar navigation
10. User is navigated to the project's Kanban board → empty board with six columns
11. Each column shows its name and a task count (0)
12. "Add task" input visible at the bottom of each column

### 6.5 Task Lifecycle

**Creation:**

1. User sees "Add task" input at the bottom of the "To Do" column
2. Types "Fix login page redirect bug"
3. Presses Enter
4. Frontend sends POST `/api/workspaces/:slug/projects/:id/tasks` with `{ title: "Fix login page redirect bug", status: "todo" }`
5. Backend auto-increments the project's task_counter (now 7) → assigns task_number 7 → calculates position (bottom of To Do column) → creates task row → logs activity
6. Task card appears at the bottom of To Do: "ENG-7 Fix login page redirect bug"
7. Card shows: title, task number, no assignee (empty avatar), no priority badge, no labels

**Enrichment:**

8. User clicks the task card → task detail modal slides open
9. User adds description: "The login page redirects to /dashboard instead of the user's last active workspace. Steps to reproduce: ..."
10. Sets priority to "High" → orange priority badge appears on the card
11. Assigns to Arjun → Arjun's avatar appears on the card
12. Adds labels: "bug" (red) → label badge appears on the card
13. Sets due date to next Friday
14. Each change fires a PATCH mutation → updates the database → card updates on the board

**Progress:**

15. Arjun drags ENG-7 from "To Do" to "In Progress" → card moves instantly (optimistic update)
16. Activity logged: "Arjun moved ENG-7 from To Do to In Progress"
17. Other team members see the card move in real time

**Review:**

18. Arjun finishes the fix → drags ENG-7 to "In Review"
19. Adds a comment: "Fixed. The issue was in the auth callback handler. PR #42 is ready for review."
20. Priya (team lead) sees the task in "In Review" → opens it → reads the comment → adds a reply: "Looks good, merging."

**Completion:**

21. Priya drags ENG-7 to "Done"
22. Activity logged: "Priya moved ENG-7 from In Review to Done"
23. Task remains in Done column for reference

**Deletion (if needed):**

24. Admin/Owner right-clicks the task or opens detail modal → clicks "Delete"
25. Confirmation dialog: "Delete ENG-7? This action cannot be undone."
26. Confirms → task deleted from database (cascade deletes comments, labels, activity references)
27. Task disappears from the board

### 6.6 Kanban Board Interaction

**Viewing the board:**

1. User navigates to a project → board loads
2. Six columns displayed horizontally: Backlog, To Do, In Progress, In Review, Done, Cancelled
3. Each column header shows the status name and task count
4. Tasks are rendered as cards within each column, ordered by position (fractional index)
5. Each card shows: task number (ENG-1), title, priority badge (color), assignee avatar, label badges, comment count icon, due date (if set)

**Dragging a task between columns:**

1. User clicks and holds a task card
2. Card lifts slightly (visual elevation) → a drag overlay (semi-transparent clone) follows the cursor
3. Original card position shows a placeholder gap
4. As the cursor moves over a different column, cards in that column shift to make space at the insertion point
5. User releases the card at the desired position
6. Card snaps into place → position and status update instantly (optimistic)
7. Server processes the move in background

**Reordering within a column:**

1. User drags a task card vertically within the same column
2. Other cards shift up or down to show the drop preview
3. User releases → card settles at new position
4. Only the position value changes (not the status)

**Quick task creation:**

1. User clicks the "Add task" input at the bottom of any column
2. Types a title → presses Enter
3. Task created in that column at the bottom position
4. Input clears, ready for another task
5. User can rapidly create multiple tasks by typing and pressing Enter repeatedly

### 6.7 Task Detail & Collaboration

**Opening the detail view:**

1. User clicks a task card on the board
2. A slide-over panel opens from the right side of the screen
3. The board remains visible (dimmed) behind the panel

**Detail panel contents (top to bottom):**

4. **Task number and title** — "ENG-7" as a badge, title as an editable text field. Click to edit inline.
5. **Properties panel** — a set of dropdowns and selectors:
   - Status: dropdown with all six statuses. Changing status here moves the card on the board.
   - Priority: dropdown (urgent/high/medium/low/none). Each option has a color indicator.
   - Assignee: member selector showing workspace members with avatars. Click to assign/reassign. Click "×" to unassign.
   - Labels: multi-select showing workspace labels with color dots. Click to add/remove.
   - Due date: date picker. Click to set/change. Click "×" to remove.
6. **Description** — a markdown editor. Supports headings, bold, italic, code blocks, lists, links. Saves on blur or after a brief debounce.
7. **Comments thread** — chronological list of comments. Each comment shows author avatar, name, timestamp, and markdown-rendered body. "Add comment" input at the bottom with a submit button.
8. **Activity history** — collapsible section showing all changes to this task. "Arjun changed priority from medium to high" with timestamp.

**Editing properties:**

9. User changes assignee from Arjun to Priya
10. PATCH mutation fires → database updates → card on board updates (avatar changes)
11. Activity logged: "User changed assignee from Arjun to Priya"

**Adding a comment:**

12. User types in the comment input: "I think we should split this into two tasks."
13. Clicks "Comment" or presses Cmd+Enter
14. POST mutation fires → comment created → appears in the thread
15. Activity logged: "User commented on ENG-7"

**Closing the detail view:**

16. User clicks outside the panel, presses Escape, or clicks the close button
17. Panel slides closed → board returns to full view

### 6.8 Workspace Switching

1. User is in "Acme Corp" workspace
2. Clicks the workspace name/logo in the sidebar → workspace switcher dropdown opens
3. Dropdown lists all workspaces the user belongs to, with workspace name, logo, and user's role
4. User clicks "Beta Inc"
5. React Router navigates to `/w/beta-inc`
6. WorkspaceLayout detects new slug → fetches workspace details and projects for Beta Inc
7. Sidebar updates with Beta Inc's projects
8. Board shows Beta Inc's content
9. All real-time subscriptions from Acme Corp are unsubscribed → new subscriptions for Beta Inc established

### 6.9 Filtering & Search

**Board filtering:**

1. User clicks the filter icon in the board header
2. Filter bar expands showing filter options:
   - Status filter: checkboxes for each column (hide "Done" and "Cancelled" to focus on active work)
   - Priority filter: checkboxes (show only "High" and "Urgent")
   - Assignee filter: member avatars to toggle (show only tasks assigned to Arjun)
   - Label filter: label badges to toggle (show only "bug" tasks)
3. User unchecks "Done" and "Cancelled", checks "High" and "Urgent" priority
4. Zustand filterStore updates → custom hook re-filters the cached task list → board re-renders instantly showing only matching tasks
5. Column headers update to show filtered task counts
6. No API call — filtering happens entirely client-side on the cached data
7. Clearing filters: user clicks "Clear filters" → all filters reset → full board visible

**Global search (Command Palette):**

1. User presses Cmd+K (or clicks the search icon in the header)
2. Command palette overlay appears — a search input with a results area below
3. User types "login" 
4. Results appear grouped by type:
   - Tasks: "ENG-7 Fix login page redirect bug", "ENG-12 Add login rate limiting"
   - Projects: (none matching)
   - Members: (none matching)
5. User clicks "ENG-7" → command palette closes → task detail modal opens for ENG-7
6. Pressing Escape closes the command palette without action

### 6.10 Settings & Administration

**Workspace settings (Admin/Owner):**

1. User clicks "Settings" in the sidebar
2. Settings page loads with sections:
   - **General:** Workspace name (editable), workspace slug (editable with validation), logo upload
   - **Members:** Link to members page
   - **Danger Zone:** Destructive actions (red-bordered section)
3. User changes workspace name from "Acme Corp" to "Acme Corporation"
4. Clicks "Save" → PATCH mutation → workspace updated → sidebar reflects new name

**Danger Zone actions:**

5. **Transfer Ownership:** Owner clicks "Transfer Ownership" → member selector appears → selects Priya → confirmation dialog: "Transfer ownership to Priya? You will become an Admin." → confirms → atomic transaction: owner becomes admin, Priya becomes owner → page refreshes with updated permissions (some settings now hidden)

6. **Delete Workspace:** Owner clicks "Delete Workspace" → confirmation dialog: "This will permanently delete Acme Corporation and all its projects, tasks, members, and data. Type 'acme-corporation' to confirm." → types the name → clicks "Delete permanently" → workspace and all cascading data deleted → user redirected to workspace selector or onboarding (if no other workspaces)

### 6.11 Activity Feed

1. User clicks "Activity" in the sidebar
2. Activity page loads showing a chronological feed (most recent first)
3. Each entry shows: actor avatar, actor name, action description, timestamp
   - "Arjun created task ENG-14 Add unit tests" — 2 minutes ago
   - "Priya moved ENG-7 from In Review to Done" — 15 minutes ago
   - "Sneha invited arjun@company.com as Member" — 1 hour ago
   - "Arjun commented on ENG-12" — 2 hours ago
   - "Priya created project Marketing (MKT)" — yesterday
4. User can filter by entity type: "Tasks only", "Members only", "Projects only"
5. Feed is paginated — scrolling to the bottom loads older entries
6. Activity entries link to their subjects — clicking "ENG-7" in an entry opens the task detail

### 6.12 Ownership Transfer

1. Owner (Sneha) navigates to Settings → Danger Zone
2. Clicks "Transfer Ownership"
3. Member selector appears showing all workspace members except Sneha
4. Selects Priya (currently Admin)
5. Confirmation dialog: "You are about to transfer ownership of Acme Corp to Priya. After transfer, you will become an Admin. This action is immediate. Are you sure?"
6. Sneha confirms
7. Backend processes as an atomic database transaction:
   - Step 1: Sneha's member row updated: role changes from "owner" to "admin"
   - Step 2: Priya's member row updated: role changes from "admin" to "owner"
   - Step 3: Workspace's owner_id updated to Priya's user ID
   - If any step fails, all steps roll back — no partial state
8. Activity logged: "Sneha transferred ownership to Priya"
9. Sneha's UI updates — she can no longer see "Delete Workspace" or "Transfer Ownership" options
10. Priya's UI updates on her next page load — she now sees the full owner controls

---

*Document generated: April 6, 2026. Built with Claude | Powered by Anthropic.*
