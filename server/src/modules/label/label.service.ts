/**
 * @file label.service.ts — Label business logic
 * @module server/modules/label
 *
 * Handles workspace-scoped label CRUD. Labels are tags with a name
 * and color applied to tasks via the task_labels junction table.
 * Label names are unique per workspace (DB constraint enforced).
 *
 * Access rules:
 *   - Read/Create: any member (member+)
 *   - Update/Delete: owner/admin only
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/label/label.routes.ts — calls these functions
 */

import { and, eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { labels } from '../../core/db/schema'
import { conflict, createLogger, notFound } from '../../core/utils'

import type { CreateLabelInput, Label, UpdateLabelInput } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates a label in the workspace. Name must be unique per workspace
 * (DB constraint). Catches duplicate violations as 409 Conflict.
 */
export async function create(
  workspaceId: string,
  input: CreateLabelInput,
): Promise<Label> {
  log.debug('Creating label', { name: input.name, workspaceId })

  try {
    const [label] = await db
      .insert(labels)
      .values({
        workspace_id: workspaceId,
        name: input.name,
        color: input.color ?? '#6366f1',
      })
      .returning()

    if (!label) throw new Error('Failed to create label')

    return mapToLabel(label)
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw conflict(`Label "${input.name}" already exists in this workspace`)
    }
    throw error
  }
}

/**
 * Lists all labels in a workspace. No pagination needed —
 * workspaces typically have <50 labels.
 */
export async function listByWorkspace(workspaceId: string): Promise<Label[]> {
  const rows = await db
    .select()
    .from(labels)
    .where(eq(labels.workspace_id, workspaceId))
    .orderBy(labels.name)

  return rows.map(mapToLabel)
}

/**
 * Updates a label's name and/or color. Owner/admin only (enforced by RBAC middleware).
 */
export async function update(
  labelId: string,
  workspaceId: string,
  input: UpdateLabelInput,
): Promise<Label> {
  log.debug('Updating label', { labelId, fields: Object.keys(input) })

  const [label] = await db
    .update(labels)
    .set(input)
    .where(
      and(
        eq(labels.id, labelId),
        eq(labels.workspace_id, workspaceId),
      ),
    )
    .returning()

  if (!label) throw notFound('Label not found')

  return mapToLabel(label)
}

/**
 * Deletes a label. CASCADE on task_labels removes all associations.
 * Owner/admin only (enforced by RBAC middleware).
 */
export async function deleteLabel(
  labelId: string,
  workspaceId: string,
): Promise<void> {
  const [deleted] = await db
    .delete(labels)
    .where(
      and(
        eq(labels.id, labelId),
        eq(labels.workspace_id, workspaceId),
      ),
    )
    .returning({ id: labels.id })

  if (!deleted) throw notFound('Label not found')

  log.info('Label deleted', { labelId })
}

// ─── Mapper ────────────────────────────────────────────────────

function mapToLabel(row: typeof labels.$inferSelect): Label {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    color: row.color,
    created_at: row.created_at.toISOString(),
  }
}
