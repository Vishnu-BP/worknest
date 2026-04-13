/**
 * @file relations.ts — Drizzle ORM relation definitions
 * @module server/db/schema
 *
 * Defines all table relationships for Drizzle's relational query API.
 * These enable queries like db.query.tasks.findMany({ with: { project: true } }).
 * Relations are purely TypeScript-side — they don't create SQL foreign keys
 * (those are defined in the schema files). relationName is used to
 * disambiguate when a table has multiple FKs to the same target
 * (e.g., tasks has both assignee_id and created_by pointing to users).
 *
 * @dependencies drizzle-orm
 * @related server/src/db/schema/*.schema.ts — table definitions
 */

import { relations } from 'drizzle-orm'

import { activityLog } from './activity-log.schema'
import { comments } from './comments.schema'
import { invitations } from './invitations.schema'
import { labels } from './labels.schema'
import { members } from './members.schema'
import { projects } from './projects.schema'
import { taskLabels } from './task-labels.schema'
import { tasks } from './tasks.schema'
import { users } from './users.schema'
import { workspaces } from './workspaces.schema'

// ─── Users Relations ───────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(members),
  ownedWorkspaces: many(workspaces, { relationName: 'workspace_owner' }),
  createdProjects: many(projects, { relationName: 'project_creator' }),
  assignedTasks: many(tasks, { relationName: 'task_assignee' }),
  createdTasks: many(tasks, { relationName: 'task_creator' }),
  comments: many(comments),
  activityLogs: many(activityLog),
  sentInvitations: many(invitations, { relationName: 'invitation_sender' }),
}))

// ─── Workspaces Relations ──────────────────────────────────────

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.owner_id],
    references: [users.id],
    relationName: 'workspace_owner',
  }),
  members: many(members),
  projects: many(projects),
  labels: many(labels),
  invitations: many(invitations),
  activityLogs: many(activityLog),
}))

// ─── Members Relations ─────────────────────────────────────────

export const membersRelations = relations(members, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [members.workspace_id],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [members.user_id],
    references: [users.id],
  }),
}))

// ─── Invitations Relations ─────────────────────────────────────

export const invitationsRelations = relations(invitations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [invitations.workspace_id],
    references: [workspaces.id],
  }),
  inviter: one(users, {
    fields: [invitations.invited_by],
    references: [users.id],
    relationName: 'invitation_sender',
  }),
}))

// ─── Projects Relations ────────────────────────────────────────

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspace_id],
    references: [workspaces.id],
  }),
  creator: one(users, {
    fields: [projects.created_by],
    references: [users.id],
    relationName: 'project_creator',
  }),
  tasks: many(tasks),
}))

// ─── Tasks Relations ───────────────────────────────────────────

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [tasks.workspace_id],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignee_id],
    references: [users.id],
    relationName: 'task_assignee',
  }),
  creator: one(users, {
    fields: [tasks.created_by],
    references: [users.id],
    relationName: 'task_creator',
  }),
  parent: one(tasks, {
    fields: [tasks.parent_id],
    references: [tasks.id],
    relationName: 'task_subtasks',
  }),
  subtasks: many(tasks, { relationName: 'task_subtasks' }),
  taskLabels: many(taskLabels),
  comments: many(comments),
}))

// ─── Labels Relations ──────────────────────────────────────────

export const labelsRelations = relations(labels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [labels.workspace_id],
    references: [workspaces.id],
  }),
  taskLabels: many(taskLabels),
}))

// ─── Task Labels Relations ─────────────────────────────────────

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.task_id],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.label_id],
    references: [labels.id],
  }),
}))

// ─── Comments Relations ────────────────────────────────────────

export const commentsRelations = relations(comments, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [comments.workspace_id],
    references: [workspaces.id],
  }),
  task: one(tasks, {
    fields: [comments.task_id],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
  }),
}))

// ─── Activity Log Relations ────────────────────────────────────

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [activityLog.workspace_id],
    references: [workspaces.id],
  }),
  actor: one(users, {
    fields: [activityLog.actor_id],
    references: [users.id],
  }),
}))
