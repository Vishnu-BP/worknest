# WorkNest — Task Tracker

> Active checklist for current phase + completed work log.
> Per CLAUDE.md: never delete completed items — move to Completed Work Log.

---

## Current: Phase 10 — Task Detail + Comments + Labels + Activity

### Step 1: Server — Comment Module
- [x] Create `modules/comment/comment.service.ts` — create, listByTask (paginated+count), update (author only), delete (author or admin/owner)
- [x] Create `modules/comment/comment.routes.ts` — 4 endpoints with activity logging
- [x] Create `modules/comment/index.ts` — barrel

### Step 2: Server — Label + Task-Label Modules
- [x] Create `modules/label/label.service.ts` — create (unique 409), listByWorkspace, update, deleteLabel
- [x] Create `modules/label/label.routes.ts` — 4 endpoints
- [x] Create `modules/label/index.ts` — barrel
- [x] Create `modules/task-label/taskLabel.service.ts` — addLabel, removeLabel, getLabelsForTask (JOIN)
- [x] Create `modules/task-label/taskLabel.routes.ts` — 2 endpoints
- [x] Create `modules/task-label/index.ts` — barrel

### Step 3: Server — Activity Routes + Mount All
- [x] Add `listByWorkspace()` to activity.service.ts (paginated, filterable, JOIN users for actor)
- [x] Create `modules/activity/activity.routes.ts` — GET paginated + entity_type filter
- [x] Update `modules/activity/index.ts` — export activityRouter
- [x] Update `app.ts` — mount 4 new routers (comment, label, taskLabel, activity)
- [x] All 11 new endpoints return 401 without token

### Step 4: Install react-markdown + Comment Hooks
- [x] Install `react-markdown` + `remark-gfm` (96 packages added)
- [x] Create `useComments.ts` — GET paginated, STALE_TIMES.MEDIUM
- [x] Create `useCreateComment.ts` — POST mutation, invalidate
- [x] Create `useUpdateComment.ts` — PATCH mutation (author only)
- [x] Create `useDeleteComment.ts` — DELETE mutation, invalidate + toast

### Step 5: Label Hooks
- [x] Create `useLabels.ts` — GET workspace labels, STALE_TIMES.LONG
- [x] Create `useCreateLabel.ts` — POST mutation, invalidate + toast
- [x] Create `useAddLabel.ts` — POST task-label, invalidate task list
- [x] Create `useRemoveLabel.ts` — DELETE task-label, invalidate task list
- [x] Create `features/label/index.ts` — barrel

### Step 6: Label Components
- [x] Create `LabelBadge.tsx` — colored pill (full mode + compact dot mode for cards)
- [x] Create `LabelSelector.tsx` — toggleable list with search, inline create, close button
- [x] Update `features/label/index.ts` barrel

### Step 7: Task Detail Components
- [x] Install shadcn/ui Sheet component
- [x] Create `TaskTitle.tsx` — inline editable (click → input → Enter saves, Esc cancels)
- [x] Create `TaskProperties.tsx` — status/priority selects, due date picker, label tags
- [x] Create `CommentItem.tsx` — author, relative time, markdown body, edit/delete actions
- [x] Create `TaskComments.tsx` — comment list + compose textarea + post button
- [x] Create `TaskActivity.tsx` — activity entries with action labels + metadata
- [x] Create `TaskDetailModal.tsx` — Sheet slide-over wiring all sections
- [x] Update task feature barrel

### Step 8: Activity Page
- [x] Create `useActivity.ts` — GET paginated, entity_type filter, STALE_TIMES.MEDIUM
- [x] Create `Activity.tsx` — full feed with entity filter chips, pagination, action labels
- [x] Create `features/activity/index.ts` — barrel

### Step 9: Wire Up + Verify
- [x] Update ProjectBoard.tsx — TaskDetailModal wired via URL ?task= param, labels + members fetched
- [x] Update KanbanView + KanbanColumn — onTaskClick prop passed through to SortableTaskCard
- [x] Update App.tsx — added /w/:slug/activity route + Activity import
- [x] `tsc --noEmit` server + client — zero errors
- [x] Vite starts, serves WorkNest
- [x] Server: 27 module files, Client: 104 total files

---

## Completed Work Log

### Phase 1-3 (Complete)
- [x] Monorepo, shared types/validators, database (10 tables, RLS, triggers), Express foundation

### Phase 4 — Restructure + Authentication (Complete)
- [x] core/ + modules/ restructure, auth middleware, auth module, client auth (stores, hooks, pages)

### Phase 5 — Workspace + Members Backend (Complete)
- [x] Slug, permissions, workspace/rbac middleware, workspace (5 endpoints), member (3 endpoints)

### Phase 6 — Frontend Shell (Complete)
- [x] Layouts, sidebar, workspace switcher, member management, query keys, 11 shadcn components

### Phase 7 — Projects Full-Stack (Complete)
- [x] Project server (5 endpoints), client hooks (5), components (dialog, card, sidebar item), board placeholder

### Phase 8 — Tasks Backend (Complete)
- [x] Position utility, activity service, task service (6 functions with FOR UPDATE), task routes (6 endpoints)

### Phase 9 — Kanban Board UI (Complete)
- [x] dnd-kit, optimistic move, filterStore, 5 task hooks, KanbanView, TaskCard, TaskQuickCreate, badges, filters
