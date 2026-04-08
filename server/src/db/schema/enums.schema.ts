/**
 * @file enums.schema.ts — Drizzle PostgreSQL enum definitions
 * @module server/db/schema
 *
 * Defines Drizzle pgEnum types matching the PostgreSQL ENUMs created
 * in the database migration. Values must exactly match the SQL ENUMs
 * and the const objects in shared/src/types/enums.ts.
 *
 * @dependencies drizzle-orm/pg-core
 * @related shared/src/types/enums.ts — source of truth for enum values
 */

import { pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role_enum', [
  'owner',
  'admin',
  'member',
  'viewer',
])

export const taskStatusEnum = pgEnum('task_status_enum', [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
])

export const priorityEnum = pgEnum('priority_enum', [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
])

export const invitationStatusEnum = pgEnum('invitation_status_enum', [
  'pending',
  'accepted',
  'expired',
  'revoked',
])

export const activityActionEnum = pgEnum('activity_action_enum', [
  'task_created',
  'task_updated',
  'task_moved',
  'task_deleted',
  'comment_added',
  'comment_updated',
  'comment_deleted',
  'member_invited',
  'member_joined',
  'member_removed',
  'project_created',
  'project_updated',
  'project_archived',
  'workspace_created',
  'workspace_updated',
])

export const entityTypeEnum = pgEnum('entity_type_enum', [
  'task',
  'project',
  'comment',
  'member',
  'invitation',
  'workspace',
  'label',
])
