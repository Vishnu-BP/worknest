/**
 * @file seed.ts — Database seed script for development
 * @module server/db
 *
 * Populates the database with realistic test data for development.
 * Uses DIRECT_DATABASE_URL (postgres superuser) to bypass RLS.
 * Run via: npm run db:seed
 *
 * Creates: 2 users, 1 workspace, 2 members, 1 invitation,
 * 2 projects, 8 tasks, 4 labels, task-label associations,
 * comments, and activity log entries.
 *
 * @dependencies dotenv, postgres, drizzle-orm
 * @related server/src/db/schema/ — table definitions
 */

import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { activityLog } from './schema/activity-log.schema'
import { comments } from './schema/comments.schema'
import { invitations } from './schema/invitations.schema'
import { labels } from './schema/labels.schema'
import { members } from './schema/members.schema'
import { projects } from './schema/projects.schema'
import { taskLabels } from './schema/task-labels.schema'
import { tasks } from './schema/tasks.schema'
import { users } from './schema/users.schema'
import { workspaces } from './schema/workspaces.schema'

// ─── Connection ────────────────────────────────────────────────

const connectionString = process.env['DATABASE_URL']
if (!connectionString) {
  console.error('[SEED] DATABASE_URL is not set')
  process.exit(1)
}

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client)

// ─── Fixed IDs (reproducible test data) ────────────────────────

const USER_1_ID = '00000000-0000-0000-0000-000000000001'
const USER_2_ID = '00000000-0000-0000-0000-000000000002'
const WORKSPACE_ID = '10000000-0000-0000-0000-000000000001'
const PROJECT_ENG_ID = '20000000-0000-0000-0000-000000000001'
const PROJECT_MKT_ID = '20000000-0000-0000-0000-000000000002'
const LABEL_BUG_ID = '30000000-0000-0000-0000-000000000001'
const LABEL_FEATURE_ID = '30000000-0000-0000-0000-000000000002'
const LABEL_URGENT_ID = '30000000-0000-0000-0000-000000000003'
const LABEL_DOCS_ID = '30000000-0000-0000-0000-000000000004'

const TASK_IDS = [
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006',
  '40000000-0000-0000-0000-000000000007',
  '40000000-0000-0000-0000-000000000008',
] as const

const COMMENT_1_ID = '50000000-0000-0000-0000-000000000001'
const COMMENT_2_ID = '50000000-0000-0000-0000-000000000002'
const MEMBER_1_ID = '60000000-0000-0000-0000-000000000001'
const MEMBER_2_ID = '60000000-0000-0000-0000-000000000002'
const INVITATION_ID = '70000000-0000-0000-0000-000000000001'

// ─── Seed Data ─────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('[SEED] Starting database seed...')

  // Truncate all tables in reverse dependency order
  console.log('[SEED] Clearing existing data...')
  await db.delete(activityLog)
  await db.delete(comments)
  await db.delete(taskLabels)
  await db.delete(tasks)
  await db.delete(labels)
  await db.delete(projects)
  await db.delete(invitations)
  await db.delete(members)
  await db.delete(workspaces)
  await db.delete(users)

  // ─── Users ─────────────────────────────────────────────
  console.log('[SEED] Creating users...')
  await db.insert(users).values([
    {
      id: USER_1_ID,
      email: 'vishnu@worknest.dev',
      full_name: 'Vishnu BP',
      avatar_url: null,
    },
    {
      id: USER_2_ID,
      email: 'arjun@worknest.dev',
      full_name: 'Arjun Kumar',
      avatar_url: null,
    },
  ])

  // ─── Workspace ─────────────────────────────────────────
  console.log('[SEED] Creating workspace...')
  await db.insert(workspaces).values({
    id: WORKSPACE_ID,
    name: 'Acme Corp',
    slug: 'acme-corp',
    owner_id: USER_1_ID,
  })

  // ─── Members ───────────────────────────────────────────
  console.log('[SEED] Creating members...')
  await db.insert(members).values([
    {
      id: MEMBER_1_ID,
      workspace_id: WORKSPACE_ID,
      user_id: USER_1_ID,
      role: 'owner',
    },
    {
      id: MEMBER_2_ID,
      workspace_id: WORKSPACE_ID,
      user_id: USER_2_ID,
      role: 'member',
    },
  ])

  // ─── Invitation ────────────────────────────────────────
  console.log('[SEED] Creating invitation...')
  await db.insert(invitations).values({
    id: INVITATION_ID,
    workspace_id: WORKSPACE_ID,
    email: 'sneha@example.com',
    role: 'member',
    token: 'seed-invite-token-001',
    invited_by: USER_1_ID,
    status: 'pending',
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
  })

  // ─── Projects ──────────────────────────────────────────
  console.log('[SEED] Creating projects...')
  await db.insert(projects).values([
    {
      id: PROJECT_ENG_ID,
      workspace_id: WORKSPACE_ID,
      name: 'Engineering',
      description: 'Core product development tasks',
      key: 'ENG',
      color: '#6366f1',
      task_counter: 5,
      created_by: USER_1_ID,
    },
    {
      id: PROJECT_MKT_ID,
      workspace_id: WORKSPACE_ID,
      name: 'Marketing',
      description: 'Marketing campaigns and content',
      key: 'MKT',
      color: '#8b5cf6',
      task_counter: 3,
      created_by: USER_1_ID,
    },
  ])

  // ─── Tasks ─────────────────────────────────────────────
  console.log('[SEED] Creating tasks...')
  await db.insert(tasks).values([
    // Engineering tasks (5)
    {
      id: TASK_IDS[0],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_ENG_ID,
      title: 'Set up authentication flow',
      description: 'Implement Supabase Auth with email/password and Google OAuth.',
      task_number: 1,
      status: 'done',
      priority: 'high',
      position: 1.0,
      assignee_id: USER_1_ID,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[1],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_ENG_ID,
      title: 'Build Kanban board component',
      description: 'Implement drag-and-drop board using dnd-kit with 6 columns.',
      task_number: 2,
      status: 'in_progress',
      priority: 'urgent',
      position: 1.0,
      assignee_id: USER_1_ID,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[2],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_ENG_ID,
      title: 'Implement task detail modal',
      description: 'Slide-over panel with editable title, description, properties, comments.',
      task_number: 3,
      status: 'todo',
      priority: 'medium',
      position: 1.0,
      assignee_id: USER_2_ID,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[3],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_ENG_ID,
      title: 'Add real-time sync via Supabase Realtime',
      task_number: 4,
      status: 'backlog',
      priority: 'low',
      position: 1.0,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[4],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_ENG_ID,
      title: 'Fix login redirect bug on expired token',
      task_number: 5,
      status: 'in_review',
      priority: 'high',
      position: 1.0,
      assignee_id: USER_2_ID,
      created_by: USER_2_ID,
    },
    // Marketing tasks (3)
    {
      id: TASK_IDS[5],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_MKT_ID,
      title: 'Write launch blog post',
      task_number: 1,
      status: 'in_progress',
      priority: 'medium',
      position: 1.0,
      assignee_id: USER_2_ID,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[6],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_MKT_ID,
      title: 'Design social media assets',
      task_number: 2,
      status: 'todo',
      priority: 'low',
      position: 2.0,
      created_by: USER_1_ID,
    },
    {
      id: TASK_IDS[7],
      workspace_id: WORKSPACE_ID,
      project_id: PROJECT_MKT_ID,
      title: 'Set up analytics tracking',
      task_number: 3,
      status: 'backlog',
      priority: 'none',
      position: 3.0,
      created_by: USER_2_ID,
    },
  ])

  // ─── Labels ────────────────────────────────────────────
  console.log('[SEED] Creating labels...')
  await db.insert(labels).values([
    { id: LABEL_BUG_ID, workspace_id: WORKSPACE_ID, name: 'bug', color: '#ef4444' },
    { id: LABEL_FEATURE_ID, workspace_id: WORKSPACE_ID, name: 'feature', color: '#3b82f6' },
    { id: LABEL_URGENT_ID, workspace_id: WORKSPACE_ID, name: 'urgent', color: '#f97316' },
    { id: LABEL_DOCS_ID, workspace_id: WORKSPACE_ID, name: 'docs', color: '#22c55e' },
  ])

  // ─── Task Labels ──────────────────────────────────────
  console.log('[SEED] Creating task-label associations...')
  await db.insert(taskLabels).values([
    { task_id: TASK_IDS[1], label_id: LABEL_FEATURE_ID },
    { task_id: TASK_IDS[1], label_id: LABEL_URGENT_ID },
    { task_id: TASK_IDS[4], label_id: LABEL_BUG_ID },
    { task_id: TASK_IDS[2], label_id: LABEL_FEATURE_ID },
    { task_id: TASK_IDS[5], label_id: LABEL_DOCS_ID },
  ])

  // ─── Comments ──────────────────────────────────────────
  console.log('[SEED] Creating comments...')
  await db.insert(comments).values([
    {
      id: COMMENT_1_ID,
      workspace_id: WORKSPACE_ID,
      task_id: TASK_IDS[1],
      author_id: USER_2_ID,
      body: 'Should we use `@dnd-kit/sortable` for the column sorting? It has built-in support for vertical lists.',
    },
    {
      id: COMMENT_2_ID,
      workspace_id: WORKSPACE_ID,
      task_id: TASK_IDS[1],
      author_id: USER_1_ID,
      body: 'Yes, `@dnd-kit/sortable` with `SortableContext` per column is the right approach. I\'ll handle the cross-column drag logic in `onDragEnd`.',
    },
  ])

  // ─── Activity Log ──────────────────────────────────────
  console.log('[SEED] Creating activity log entries...')
  await db.insert(activityLog).values([
    {
      workspace_id: WORKSPACE_ID,
      actor_id: USER_1_ID,
      action: 'workspace_created',
      entity_type: 'workspace',
      entity_id: WORKSPACE_ID,
      metadata: { name: 'Acme Corp' },
    },
    {
      workspace_id: WORKSPACE_ID,
      actor_id: USER_1_ID,
      action: 'project_created',
      entity_type: 'project',
      entity_id: PROJECT_ENG_ID,
      metadata: { name: 'Engineering', key: 'ENG' },
    },
    {
      workspace_id: WORKSPACE_ID,
      actor_id: USER_1_ID,
      action: 'task_created',
      entity_type: 'task',
      entity_id: TASK_IDS[1]!,
      metadata: { title: 'Build Kanban board component', project_key: 'ENG', task_number: 2 },
    },
    {
      workspace_id: WORKSPACE_ID,
      actor_id: USER_1_ID,
      action: 'member_invited',
      entity_type: 'invitation',
      entity_id: INVITATION_ID,
      metadata: { email: 'sneha@example.com', role: 'member' },
    },
    {
      workspace_id: WORKSPACE_ID,
      actor_id: USER_2_ID,
      action: 'comment_added',
      entity_type: 'comment',
      entity_id: COMMENT_1_ID,
      metadata: { task_id: TASK_IDS[1], task_title: 'Build Kanban board component' },
    },
  ])

  console.log('[SEED] Seed complete!')
  console.log('[SEED] Created: 2 users, 1 workspace, 2 members, 1 invitation, 2 projects, 8 tasks, 4 labels, 5 task-labels, 2 comments, 5 activity entries')
}

// ─── Execute ───────────────────────────────────────────────────

seed()
  .catch((error) => {
    console.error('[SEED] Failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
