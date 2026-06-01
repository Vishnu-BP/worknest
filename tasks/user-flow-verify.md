# WorkNest — User Flow Verification Checklist

> **How to use this file:**
> - You test in the browser (`http://localhost:5173/`). Tick the box when a step passes. Add a note next to any step that fails.
> - Claude reads code in parallel and fixes bugs as you flag them.
> - Keep both dev servers running: `cd server && npm run dev` + `cd client && npm run dev`.
> - Open DevTools (F12) → **Console** tab always visible so we catch JS errors.
> - Open DevTools → **Network** tab to watch API calls (filter: `localhost:3001`).

---

## PHASE 1 — AUTH

### 1.1 Fresh visit (not logged in)

- [ ] Clear localStorage: DevTools → Application → Storage → **Clear site data**
- [ ] Hit `http://localhost:5173/` → see brief "Loading..." → **redirected to `/login`**
- [ ] `/login` renders: title "Welcome to WorkNest", "Continue with Google" button, email input, "Continue with email" button
- [ ] No console errors, no infinite spinner

### 1.2 Email OTP — request code

- [ ] Type an email → click "Continue with email"
- [ ] Step 2 appears: "Check your email", shows your email, 6-digit OTP input
- [ ] Email arrives in inbox within ~30s with a 6-digit code
- [ ] "Use a different email" link works (goes back to step 1)
- [ ] "Resend code" link works (no error toast)

### 1.3 Email OTP — verify code

- [ ] Type the 6-digit code → click "Verify"
- [ ] Button shows "Verifying..." briefly
- [ ] You land on **`/onboarding`** (if no workspaces) OR **`/w/:slug`** (if you already have one)
- [ ] Network tab shows: POST `/api/auth/callback` (201) → GET `/api/auth/me` (200) → GET `/api/workspaces` (200)
- [ ] Console shows `[AUTH] OTP verified successfully` and `[AUTH] User profile synced`

### 1.4 Wrong OTP

- [ ] Enter a wrong 6-digit code → click "Verify"
- [ ] Red error message shows below the input (e.g. "Token has expired or is invalid")
- [ ] You stay on the OTP step (not redirected)

### 1.5 Google OAuth (skip if Google not configured in Supabase)

- [ ] Click "Continue with Google"
- [ ] Browser redirects to Google sign-in
- [ ] After authorizing, redirects back to app → lands on `/onboarding` or `/w/:slug`

### 1.6 Session persistence (the bug we just fixed)

- [ ] After logging in, you're on a workspace/onboarding page
- [ ] **Hard refresh** (Ctrl+Shift+R)
- [ ] You see brief "Loading..." spinner — **NOT bounced to `/login`**
- [ ] Page re-renders with your data intact

### 1.7 Sign out

- [ ] Click avatar (top right) → "Sign out"
- [ ] Page hard-reloads → lands on `/login`
- [ ] localStorage is cleared of the `sb-*-auth-token` entry
- [ ] Hitting `/` now shows `/login` again (not logged in)

### 1.8 Stale / corrupted session

- [ ] Log in → DevTools → Application → Local Storage → find `sb-<ref>-auth-token`
- [ ] Edit `access_token`: change 1 character inside the string
- [ ] Reload `/` → either (a) silently recovers (refresh works) OR (b) hard-redirects to `/login`
- [ ] **Must NOT** be stuck on infinite "Loading..."

---

## PHASE 2 — ONBOARDING (first workspace)

*Starts after first successful login for a brand-new user.*

### 2.1 Onboarding page renders

- [ ] On `/onboarding`, see: "Create your workspace" (or similar title), workspace-name input, Create button
- [ ] No console errors

### 2.2 Workspace creation

- [ ] Type a workspace name (e.g. "Acme") → click Create
- [ ] Network: POST `/api/workspaces` returns 201
- [ ] Redirected to `/w/acme` (slugified)
- [ ] localStorage has `worknest_last_workspace` = `"acme"` (or similar key)
- [ ] Sidebar shows workspace name + empty projects list

### 2.3 Slug uniqueness

- [ ] Sign up a second account → try creating workspace with the same name "Acme"
- [ ] Server should slugify to `acme-2` or similar, NOT fail

---

## PHASE 3 — WORKSPACE DASHBOARD + SIDEBAR

### 3.1 Layout

- [ ] Header visible at top: workspace name, Cmd+K search button, user avatar
- [ ] Sidebar on the left: workspace switcher, "Projects" section, Members / Settings / Activity links
- [ ] Main area shows dashboard with project cards (or empty state if no projects)

### 3.2 Sidebar navigation

- [ ] Click "Members" → navigates to `/w/:slug/members`
- [ ] Click "Activity" → navigates to `/w/:slug/activity`
- [ ] Click "Settings" → navigates to `/w/:slug/settings`
- [ ] Each page loads without errors
- [ ] Sidebar "Projects" section updates when a project is created (Phase 4)

### 3.3 Workspace switcher

- [ ] Click workspace name in header/sidebar → dropdown opens
- [ ] Shows list of your workspaces
- [ ] "Create workspace" button opens a modal (not a full page)
- [ ] Creating a new workspace through the modal switches to it

### 3.4 User menu

- [ ] Click avatar → dropdown shows email, "Sign out"
- [ ] Sign out works (same as 1.7)

---

## PHASE 4 — PROJECTS

### 4.1 Create project

- [ ] On workspace dashboard, click "Create project" button
- [ ] Modal opens with: name input, key input (auto-generated from name?)
- [ ] Fill in name "Website Redesign" → submit
- [ ] Network: POST `/api/workspaces/:slug/projects` returns 201
- [ ] Modal closes, project card appears in dashboard
- [ ] Project appears in sidebar "Projects" section

### 4.2 Project list / empty state

- [ ] Delete all projects (if any) → dashboard shows empty state with "Create your first project" CTA
- [ ] CTA opens the same create modal

### 4.3 Open project board

- [ ] Click a project card (or sidebar item)
- [ ] Navigates to `/w/:slug/projects/:projectId/board`
- [ ] Phase 5 (kanban) kicks in

### 4.4 Delete project

- [ ] In project settings or card menu, click delete
- [ ] Confirmation prompt appears
- [ ] Network: DELETE `/api/workspaces/:slug/projects/:projectId` returns 204
- [ ] Project disappears from dashboard and sidebar

---

## PHASE 5 — KANBAN BOARD

### 5.1 Board layout

- [ ] 6 columns: Backlog, Todo, In Progress, In Review, Done, Cancelled
- [ ] Each column has a title, task count badge, and "+ Add task" at the bottom
- [ ] Empty state per column shows nothing or a placeholder

### 5.2 Create task (quick add)

- [ ] Click "+ Add task" at bottom of "Todo" column → input appears, auto-focused
- [ ] Type title → press Enter
- [ ] Network: POST `/api/workspaces/:slug/projects/:projectId/tasks` returns 201
- [ ] New task card appears at the bottom of the column
- [ ] Task has an auto-generated number (e.g. `PROJ-1`)

### 5.3 Drag a task across columns

- [ ] Drag a task from "Todo" → drop into "In Progress"
- [ ] Task visibly moves **immediately** (optimistic update)
- [ ] Network: PATCH `/api/workspaces/:slug/tasks/:taskId/move` returns 200
- [ ] Hard refresh the page → task stays in "In Progress" (persisted)

### 5.4 Reorder within the same column

- [ ] Drag a task up/down within the same column
- [ ] Position persists after refresh

### 5.5 Drag latency / error handling

- [ ] Disable network (DevTools → Network → Offline) → drag a task
- [ ] Task briefly moves → snaps back OR shows error toast
- [ ] Re-enable network → board recovers

---

## PHASE 6 — TASK DETAIL

### 6.1 Open task

- [ ] Click a task card → modal opens
- [ ] Shows: title (editable), description, status, priority, assignee, labels, due date, comments, activity

### 6.2 Inline edit title

- [ ] Click title → becomes editable → change text → click outside (blur)
- [ ] Network: PATCH `/api/workspaces/:slug/tasks/:taskId` returns 200
- [ ] Board card updates with new title

### 6.3 Change status / priority / assignee

- [ ] Each dropdown changes the task
- [ ] PATCH request fires for each change
- [ ] Status change moves the card to the right column

### 6.4 Comments

- [ ] Type a comment → submit
- [ ] Appears in comments list with your avatar + timestamp
- [ ] Edit your own comment (pencil icon) → changes persist
- [ ] Delete your own comment → disappears
- [ ] Cannot edit/delete someone else's comment

### 6.5 Labels

- [ ] Click "+ Add label" → dropdown shows existing workspace labels
- [ ] Add a label → colored badge appears on task card
- [ ] Remove a label → badge disappears
- [ ] Create a new label → appears in the dropdown immediately

### 6.6 Activity feed on task

- [ ] Every change (title, status, comment added) appears as an entry
- [ ] Shows actor + timestamp + what changed

### 6.7 Delete task

- [ ] Click delete (trash icon) → confirmation → deletes
- [ ] Card removed from board

---

## PHASE 7 — MEMBERS + ROLE MANAGEMENT

### 7.1 Members list

- [ ] Navigate to `/w/:slug/members`
- [ ] Table shows all members: email, role, joined date
- [ ] You (the owner) appear with role "owner"

### 7.2 Role visibility

- [ ] Owner/admin sees: "Invite" button, role dropdown per member, Remove button
- [ ] Member/viewer sees: no invite button, read-only member list

### 7.3 Change role

- [ ] As owner, change another member's role (admin → member)
- [ ] Network: PATCH `/api/workspaces/:slug/members/:memberId` returns 200
- [ ] Badge updates

### 7.4 Remove member

- [ ] Click Remove on a non-owner member → confirmation → removed
- [ ] Cannot remove yourself
- [ ] Cannot remove the owner

---

## PHASE 8 — INVITATIONS

### 8.1 Send invitation

- [ ] Members page → click "Invite"
- [ ] Modal: email input + role dropdown (member / viewer)
- [ ] Submit → POST `/api/workspaces/:slug/invitations` returns 201
- [ ] Pending invitation appears in a list below the members table
- [ ] Invited email receives an email with a magic link

### 8.2 Accept invitation — new user

- [ ] Invited user clicks link in email → lands on `/invite-accept?token=...`
- [ ] If not signed in → prompted to sign up/log in → after login, auto-accepts
- [ ] After accept: redirected to `/w/:slug` → shows up in workspace members

### 8.3 Accept invitation — existing user signed in

- [ ] Signed in with invited email → clicks link → auto-accepts → lands in workspace

### 8.4 Revoke invitation

- [ ] Admin clicks "Revoke" on a pending invitation → disappears from list
- [ ] Invited user opening the link now sees "Invitation no longer valid"

### 8.5 Expired invitation

- [ ] Invitation older than 48h → "expired" status, link shows expiry message

---

## PHASE 9 — REALTIME SYNC

*Test with 2 browsers / incognito windows, both logged in as different users in the same workspace.*

### 9.1 Task moved by user A

- [ ] User A drags a task to a new column
- [ ] User B's board (open on same project) updates within ~1s without refresh

### 9.2 Task created by user A

- [ ] User A creates a task
- [ ] User B sees it appear

### 9.3 Fallback when Realtime fails

- [ ] Disable network for User B → User A changes things → User B sees no updates (expected)
- [ ] Re-enable → tab focus triggers refetch → board catches up

---

## PHASE 10 — COMMAND PALETTE

### 10.1 Open

- [ ] Press **Ctrl+K** (Windows) / **Cmd+K** (Mac) on any page inside workspace
- [ ] Palette opens, input focused, placeholder like "Search tasks, projects..."

### 10.2 Search

- [ ] Type part of a task title → tasks group shows matches
- [ ] Type a project name → projects group shows matches
- [ ] Type a member email/name → members group shows matches
- [ ] Results are cached (no network call while typing)

### 10.3 Navigate

- [ ] Press arrow keys to move selection
- [ ] Press Enter → navigates to the resource (task opens modal, project opens board, member opens profile if exists)
- [ ] Escape closes the palette

---

## PHASE 11 — ACTIVITY FEED

### 11.1 Activity page

- [ ] Navigate to `/w/:slug/activity`
- [ ] Shows recent actions: "X created project Y", "X moved task Z to Done", etc.
- [ ] Sorted newest-first
- [ ] Each entry has timestamp + actor avatar/name

### 11.2 Filters (if present)

- [ ] Filter by action type (task, comment, member, etc.)
- [ ] Filter by actor

---

## BUG LOG

*Fill this in as you find issues. Claude uses this to scope fixes.*

| # | Phase | Symptom | Severity | Status |
|---|---|---|---|---|
| 1 | 1.6 | Stuck on "Loading..." after refresh with stale session | critical | ✅ FIXED (2026-04-20) |
| 2 | 1.6 | AuthGuard race — logged-in user briefly bounced to /login | high | ✅ FIXED (2026-04-20) |
|  |  |  |  |  |
