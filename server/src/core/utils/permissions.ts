/**
 * @file permissions.ts — RBAC permission matrix (single source of truth)
 * @module server/core/utils
 *
 * Defines every permission in the system and which roles have it.
 * The rbac middleware calls hasPermission() to gate access. Future
 * modules (project, task, comment, label, invitation) add their
 * permissions here as they're built.
 *
 * This file is the ONLY place role-permission mappings are defined.
 * If you need to check "can this role do X?" — the answer is here.
 *
 * @dependencies @worknest/shared — Role type
 * @related server/src/core/middleware/rbac.middleware.ts — calls hasPermission()
 * @related docs/auth-and-rbac.md — permission matrix specification
 */

import type { Role } from '@worknest/shared'

// ─── Permission Matrix ─────────────────────────────────────────

/**
 * Complete RBAC permission matrix. Each role maps to a Set of
 * permission strings it's allowed to perform.
 *
 * Permission naming: "resource:action"
 *   workspace:read, workspace:update, workspace:delete
 *   member:read, member:update, member:delete
 *   project:read, project:create, project:update, project:delete
 *   task:read, task:create, task:update, task:delete
 *   comment:read, comment:create, comment:update, comment:delete
 *   label:read, label:create, label:update, label:delete
 *   invitation:read, invitation:create, invitation:delete
 */
const PERMISSIONS: Record<Role, Set<string>> = {
  owner: new Set([
    'workspace:read', 'workspace:update', 'workspace:delete',
    'member:read', 'member:update', 'member:delete',
    'project:read', 'project:create', 'project:update', 'project:delete',
    'task:read', 'task:create', 'task:update', 'task:delete',
    'comment:read', 'comment:create', 'comment:update', 'comment:delete',
    'label:read', 'label:create', 'label:update', 'label:delete',
    'invitation:read', 'invitation:create', 'invitation:delete',
  ]),

  admin: new Set([
    'workspace:read', 'workspace:update',
    'member:read', 'member:update', 'member:delete',
    'project:read', 'project:create', 'project:update', 'project:delete',
    'task:read', 'task:create', 'task:update', 'task:delete',
    'comment:read', 'comment:create', 'comment:update', 'comment:delete',
    'label:read', 'label:create', 'label:update', 'label:delete',
    'invitation:read', 'invitation:create', 'invitation:delete',
  ]),

  member: new Set([
    'workspace:read',
    'member:read',
    'project:read', 'project:create', 'project:update',
    'task:read', 'task:create', 'task:update',
    'comment:read', 'comment:create', 'comment:update',
    'label:read', 'label:create',
  ]),

  viewer: new Set([
    'workspace:read',
    'member:read',
    'project:read',
    'task:read',
    'comment:read',
    'label:read',
  ]),
}

// ─── Public API ────────────────────────────────────────────────

/** Checks if a role has a specific permission */
export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false
}
