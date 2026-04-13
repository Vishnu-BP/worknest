/**
 * @file taskLabel.service.ts — Task-label junction management
 * @module server/modules/task-label
 *
 * Manages the many-to-many relationship between tasks and labels
 * via the task_labels junction table. Provides add, remove, and
 * get operations. Composite PK (task_id, label_id) prevents duplicates.
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/task-label/taskLabel.routes.ts
 */

import { and, eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { labels, taskLabels } from '../../core/db/schema'
import { conflict, createLogger } from '../../core/utils'

import type { Label } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Adds a label to a task. Catches duplicate constraint as 409.
 */
export async function addLabel(
  taskId: string,
  labelId: string,
): Promise<void> {
  log.debug('Adding label to task', { taskId, labelId })

  try {
    await db.insert(taskLabels).values({ task_id: taskId, label_id: labelId })
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate')) {
      throw conflict('Label is already applied to this task')
    }
    throw error
  }
}

/**
 * Removes a label from a task. No-op if the association doesn't exist.
 */
export async function removeLabel(
  taskId: string,
  labelId: string,
): Promise<void> {
  log.debug('Removing label from task', { taskId, labelId })

  await db
    .delete(taskLabels)
    .where(
      and(
        eq(taskLabels.task_id, taskId),
        eq(taskLabels.label_id, labelId),
      ),
    )
}

/**
 * Gets all labels applied to a task. JOINs through task_labels
 * to the labels table to return full label objects.
 */
export async function getLabelsForTask(taskId: string): Promise<Label[]> {
  const rows = await db
    .select({
      id: labels.id,
      workspace_id: labels.workspace_id,
      name: labels.name,
      color: labels.color,
      created_at: labels.created_at,
    })
    .from(taskLabels)
    .innerJoin(labels, eq(taskLabels.label_id, labels.id))
    .where(eq(taskLabels.task_id, taskId))
    .orderBy(labels.name)

  return rows.map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    color: row.color,
    created_at: row.created_at.toISOString(),
  }))
}
