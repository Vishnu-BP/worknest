/**
 * @file enums.ts — Application-wide enum constants and their derived types
 * @module shared/types
 *
 * Defines all enums used across client and server as const objects.
 * Using const objects instead of TypeScript enums for better tree-shaking,
 * runtime value access, and compatibility with Zod schema validation.
 *
 * @dependencies none
 * @related shared/src/validators/ — Zod schemas reference these enum values
 */

// ─── Workspace Roles ───────────────────────────────────────────

export const ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const

export type Role = (typeof ROLE)[keyof typeof ROLE]

/** Roles ordered by privilege level (highest first) */
export const ROLE_HIERARCHY: readonly Role[] = [
  ROLE.OWNER,
  ROLE.ADMIN,
  ROLE.MEMBER,
  ROLE.VIEWER,
] as const

// ─── Task Statuses ─────────────────────────────────────────────

export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]

/** Statuses in Kanban column display order (left to right) */
export const TASK_STATUS_ORDER: readonly TaskStatus[] = [
  TASK_STATUS.BACKLOG,
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.IN_REVIEW,
  TASK_STATUS.DONE,
  TASK_STATUS.CANCELLED,
] as const

// ─── Task Priorities ───────────────────────────────────────────

export const PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
} as const

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY]

/** Priorities ordered by severity (highest first) */
export const PRIORITY_ORDER: readonly Priority[] = [
  PRIORITY.URGENT,
  PRIORITY.HIGH,
  PRIORITY.MEDIUM,
  PRIORITY.LOW,
  PRIORITY.NONE,
] as const

// ─── Invitation Statuses ───────────────────────────────────────

export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const

export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS]

// ─── Activity Actions ──────────────────────────────────────────

export const ACTIVITY_ACTION = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_MOVED: 'task_moved',
  TASK_DELETED: 'task_deleted',
  COMMENT_ADDED: 'comment_added',
  COMMENT_UPDATED: 'comment_updated',
  COMMENT_DELETED: 'comment_deleted',
  MEMBER_INVITED: 'member_invited',
  MEMBER_JOINED: 'member_joined',
  MEMBER_REMOVED: 'member_removed',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_ARCHIVED: 'project_archived',
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_UPDATED: 'workspace_updated',
} as const

export type ActivityAction =
  (typeof ACTIVITY_ACTION)[keyof typeof ACTIVITY_ACTION]

// ─── Entity Types ──────────────────────────────────────────────

export const ENTITY_TYPE = {
  TASK: 'task',
  PROJECT: 'project',
  COMMENT: 'comment',
  MEMBER: 'member',
  INVITATION: 'invitation',
  WORKSPACE: 'workspace',
  LABEL: 'label',
} as const

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE]
