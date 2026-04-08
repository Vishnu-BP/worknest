# Component Architecture

Layout system, component hierarchy, and design principles.

---

## Layout System (React Router)

Three layout contexts:

- **Public layout** — Login, Signup, InviteAccept. No sidebar/header. Centered content.
- **Workspace layout** — Sidebar + Header + Content outlet. Sidebar/header persist across navigation.
- **Onboarding layout** — First-time users with no workspace. Centered card.

## Component Hierarchy

```
App
├── AuthGuard
│   ├── WorkspaceLayout
│   │   ├── Sidebar (WorkspaceSwitcher, ProjectList)
│   │   ├── Header (Breadcrumb, CommandPalette, UserAvatar)
│   │   └── [Child Route]
│   │       ├── ProjectBoard (BoardHeader, KanbanView, TaskDetailModal)
│   │       ├── ProjectList (TaskTable)
│   │       ├── MembersPage (MemberList, InviteDialog)
│   │       ├── SettingsPage (WorkspaceForm, DangerZone)
│   │       └── ActivityPage (ActivityList, ActivityFilters)
│   └── OnboardingLayout
└── Public routes (Login, Signup, InviteAccept)
```

## Kanban Board Components

- **KanbanView** — wraps board in DndContext, manages drag state
- **KanbanColumn** — one per status, droppable zone, task list + TaskQuickCreate
- **TaskCard** — draggable card (title, number, priority, assignee, labels, comments, due date). Must be lightweight.
- **TaskDetailModal** — slide-over with editable title, description, properties, comments, activity
- **TaskQuickCreate** — inline input at column bottom
- **DragOverlay** — cursor-following clone during drag

## Shared Components

CommandPalette, WorkspaceSwitcher, UserAvatar, RoleBadge, PriorityBadge, StatusBadge, EmptyState, ConfirmDialog.

## Design Principles

- **Smart vs dumb:** Pages/containers fetch data (smart). UI components receive props (dumb).
- **Co-location:** Feature-specific → feature folder. Cross-feature → `common/`.
- **Composition:** Small pieces composed together, not monolithic components with boolean props.
- **Single responsibility:** Each component does one thing. TaskCard renders — it doesn't fetch or manage drag state.
- **Named exports only.** No default exports.

## Loading States

- Board: skeleton columns with skeleton cards (6 columns, 3 cards each)
- Members/Activity: skeleton table rows
- Task detail: skeleton panel with placeholder blocks
- Use `keepPreviousData: true` on filtered queries (show old results while new ones load)
- NEVER show a blank page — always skeleton or stale data

## Last Workspace Persistence

Store `lastWorkspaceSlug` in `localStorage`. On login, redirect to last workspace instead of workspace selector. Update on every workspace navigation.

## Accessibility

- shadcn/ui (Radix) handles focus trapping, keyboard navigation, ARIA by default
- dnd-kit: configure `announcements` prop on DndContext for screen reader drag announcements
- Add `aria-label` to all icon-only buttons
- Test keyboard-only navigation at end of each phase

## Offline UX

- Detect with `navigator.onLine` + `online`/`offline` events
- Show persistent banner: "You're offline. Changes will sync when you reconnect."
- On reconnect: `queryClient.invalidateQueries()` to refetch everything
- Optimistic updates that failed during offline are rolled back on reconnect
