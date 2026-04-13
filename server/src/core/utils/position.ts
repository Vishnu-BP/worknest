/**
 * @file position.ts — Fractional indexing utilities for task ordering
 * @module server/core/utils
 *
 * Implements fractional indexing for Kanban board drag-and-drop ordering.
 * Every task has a `position` (REAL/float) column. Tasks render in
 * ascending position order within each column. Inserting between two
 * tasks averages their positions — no renumbering of other rows.
 *
 * Rebalancing resets positions to clean integers (1.0, 2.0, 3.0...)
 * when gaps become too small (<0.001) for floating-point precision.
 * This is rare — typically after 30+ nested insertions in one column.
 *
 * @dependencies drizzle-orm, server/src/core/db
 * @related docs/kanban-architecture.md — specification
 */

import { and, asc, eq } from 'drizzle-orm'

import { db } from '../db'
import { tasks } from '../db/schema'
import { createLogger } from './logger'

import type { TaskStatus } from '@worknest/shared'

// ─── Constants ─────────────────────────────────────────────────

/** Minimum gap between positions before rebalancing is triggered */
const REBALANCE_THRESHOLD = 0.001

const log = createLogger('DB')

// ─── Position Calculation ──────────────────────────────────────

/**
 * Calculates the position for a new or moved task based on its neighbors.
 *
 * Cases:
 *   - Empty column (no neighbors):    1.0
 *   - Top of column (no above):       below - 1.0
 *   - Bottom of column (no below):    above + 1.0
 *   - Between two tasks:              (above + below) / 2
 */
export function calculatePosition(above?: number, below?: number): number {
  if (above === undefined && below === undefined) return 1.0
  if (above === undefined) return below! - 1.0
  if (below === undefined) return above! + 1.0
  return (above + below) / 2
}

// ─── Rebalance Detection ───────────────────────────────────────

/**
 * Checks if any gap between consecutive sorted positions is too small
 * for safe further splitting. Returns true if rebalancing is needed.
 */
export function shouldRebalance(positions: number[]): boolean {
  if (positions.length < 2) return false

  const sorted = [...positions].sort((a, b) => a - b)

  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1]! - sorted[i]!
    if (gap < REBALANCE_THRESHOLD) return true
  }

  return false
}

// ─── Column Rebalancing ────────────────────────────────────────

/**
 * Resets all task positions in a column to clean integers (1.0, 2.0, 3.0...).
 * Preserves the current sort order. Runs in a transaction so all updates
 * succeed or all fail. Called after a move() detects tight spacing.
 */
export async function rebalanceColumn(
  projectId: string,
  status: TaskStatus,
): Promise<void> {
  const tasksInColumn = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.project_id, projectId),
        eq(tasks.status, status),
      ),
    )
    .orderBy(asc(tasks.position))

  if (tasksInColumn.length < 2) return

  await db.transaction(async (tx) => {
    for (let i = 0; i < tasksInColumn.length; i++) {
      await tx
        .update(tasks)
        .set({ position: (i + 1) * 1.0 })
        .where(eq(tasks.id, tasksInColumn[i]!.id))
    }
  })

  log.info('Rebalanced column', {
    projectId,
    status,
    taskCount: tasksInColumn.length,
  })
}
