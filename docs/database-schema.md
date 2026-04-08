# Database Schema

Complete schema for WorkNest's 10 PostgreSQL tables, RLS policies, and migration workflow.

---

## Tables

### users
Synced from Supabase Auth via trigger.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | Matches Supabase Auth ID |
| email | TEXT UNIQUE | |
| full_name | TEXT | |
| avatar_url | TEXT nullable | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### workspaces

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT | |
| slug | TEXT UNIQUE | URL-friendly |
| owner_id | UUID FK→users | |
| logo_url | TEXT nullable | |
| created_at / updated_at | TIMESTAMPTZ | |

### members

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | CASCADE |
| user_id | UUID FK→users | |
| role | ENUM (owner, admin, member, viewer) | Default: member |
| joined_at | TIMESTAMPTZ | |

UNIQUE(workspace_id, user_id). Index on both columns.

### invitations

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | |
| email | TEXT | |
| role | ENUM | |
| token | TEXT UNIQUE | crypto.randomUUID() |
| invited_by | UUID FK→users | |
| status | ENUM (pending, accepted, expired, revoked) | |
| expires_at | TIMESTAMPTZ | 48 hours |
| created_at | TIMESTAMPTZ | |

### projects

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | |
| name | TEXT | |
| description | TEXT nullable | |
| key | TEXT | Task prefix: ENG → ENG-1 |
| color | TEXT | |
| task_counter | INTEGER DEFAULT 0 | Only increments |
| is_archived | BOOLEAN DEFAULT false | |
| created_by | UUID FK→users | |
| created_at / updated_at | TIMESTAMPTZ | |

UNIQUE(workspace_id, key).

### tasks

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | Redundant for fast RLS |
| project_id | UUID FK→projects | |
| title | TEXT | |
| description | TEXT nullable | Markdown |
| task_number | INTEGER | Auto-increment per project |
| status | ENUM (backlog, todo, in_progress, in_review, done, cancelled) | |
| priority | ENUM (urgent, high, medium, low, none) | |
| position | REAL | Fractional index for ordering |
| assignee_id | UUID nullable FK→users | ON DELETE SET NULL (not CASCADE — task stays, becomes unassigned) |
| created_by | UUID FK→users | |
| parent_id | UUID nullable FK→tasks | Subtasks |
| due_date | DATE nullable | |
| created_at / updated_at | TIMESTAMPTZ | |

UNIQUE(project_id, task_number). Index on project_id, status, assignee_id.

### labels

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | |
| name | TEXT | |
| color | TEXT | |
| created_at | TIMESTAMPTZ | |

UNIQUE(workspace_id, name).

### task_labels

| Column | Type | Notes |
|---|---|---|
| task_id | UUID FK→tasks | CASCADE |
| label_id | UUID FK→labels | CASCADE |

PK: (task_id, label_id).

### comments

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | For fast RLS |
| task_id | UUID FK→tasks | |
| author_id | UUID FK→users | |
| body | TEXT | Markdown |
| created_at / updated_at | TIMESTAMPTZ | |

Index on task_id.

### activity_log

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| workspace_id | UUID FK→workspaces | |
| actor_id | UUID FK→users | |
| action | ENUM | task_created, task_updated, task_moved, etc. |
| entity_type | ENUM | task, project, comment, member, invitation |
| entity_id | UUID | |
| metadata | JSONB | Flexible per action |
| created_at | TIMESTAMPTZ | |

Index on workspace_id, created_at. Immutable — no UPDATE or DELETE.

---

## RLS Policies

Helper functions: `get_current_user_id()`, `is_workspace_member(ws_id)`, `get_workspace_role(ws_id)`.

Every policy's FIRST check: `is_workspace_member(workspace_id)`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| users | Own + shared workspace | Trigger | Own only | Blocked |
| workspaces | Member | Any auth'd | Owner, Admin | Owner |
| members | Member | Admin, Owner | Admin, Owner | Admin, Owner (not owner row) |
| invitations | Admin, Owner + invitee | Admin, Owner | Invitee/Admin | Admin, Owner |
| projects | Member | Member+ | Member+ | Admin, Owner |
| tasks | Member | Member+ | Member+ | Admin, Owner |
| labels | Member | Member+ | Admin, Owner | Admin, Owner |
| task_labels | Member | Member+ | — | Member+ |
| comments | Member | Member+ | Author only | Author/Admin/Owner |
| activity_log | Member | Service role (bypass) | Blocked | Blocked |

---

## Migration Workflow

1. Create: `server/src/db/migrations-pending/YYYYMMDD_description.sql`
2. Add header comments: PURPOSE, REASON, CHANGES
3. Apply to development, test
4. STOP — wait for confirmation
5. Apply to production
6. Move to `migrations/`
7. Update Drizzle schema to match

## Critical Implementation Notes

### Task Number Race Condition
Task creation MUST use `SELECT ... FOR UPDATE` on the project row to lock it during counter increment. Without this, concurrent task creation causes duplicate task_number errors.

### Connection Pooling
Use Supabase's pooled connection string (`DATABASE_URL` port 6543) for application queries. Use direct connection (`DIRECT_DATABASE_URL` port 5432) only for migrations.

### Cascade Deletion Order
Foreign key `ON DELETE CASCADE` handles cleanup automatically. Deleting a workspace cascades to members, projects, tasks, comments, labels, invitations, activity_log. Ensure all FKs specify `ON DELETE CASCADE`.

### Service Role Security
`SUPABASE_SERVICE_ROLE_KEY` bypasses ALL RLS — never expose in client code. Exists only in `server/.env`. Create a separate `adminDb` Drizzle client for activity_log inserts. Better alternative: create an RLS policy allowing authenticated users to INSERT into activity_log for their own workspaces, avoiding service role entirely.
