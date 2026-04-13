/**
 * @file task.service.ts — Task business logic
 * @module server/modules/task
 *
 * Handles task CRUD and the separate move operation for drag-and-drop.
 * The create function uses a FOR UPDATE lock on the project row to
 * prevent race conditions on the auto-incrementing task_number.
 *
 * Move is separate from update because it changes status + position
 * (a drag-and-drop action) and is logged differently in the activity
 * trail. Move also triggers position rebalancing when gaps get tight.
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/task/task.routes.ts — calls these functions
 */

import { and, asc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '../../core/db'
import { projects, tasks } from '../../core/db/schema'
import {
  createLogger,
  notFound,
  rebalanceColumn,
  shouldRebalance,
} from '../../core/utils'

import type {
  CreateTaskInput,
  MoveTaskInput,
  Priority,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates a task with an auto-incremented task_number. Uses a
 * FOR UPDATE lock on the project row to prevent concurrent creates
 * from generating duplicate task numbers.
 *
 * Flow: BEGIN → lock project → read counter → increment → INSERT → COMMIT
 */
export async function create(
  workspaceId: string,
  projectId: string,
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  log.info('Creating task', { title: input.title, projectId })

  const result = await db.transaction(async (tx) => {
    // Lock the project row to prevent concurrent task_counter reads
    const [project] = await tx
      .select({ id: projects.id, task_counter: projects.task_counter })
      .from(projects)
      .where(eq(projects.id, projectId))
      .for('update')

    if (!project) {
      throw notFound('Project not found')
    }

    const nextTaskNumber = project.task_counter + 1

    // Increment the project's task counter
    await tx
      .update(projects)
      .set({ task_counter: nextTaskNumber })
      .where(eq(projects.id, projectId))

    // Calculate position (bottom of backlog column)
    const [lastTask] = await tx
      .select({ position: tasks.position })
      .from(tasks)
      .where(
        and(
          eq(tasks.project_id, projectId),
          eq(tasks.status, 'backlog'),
        ),
      )
      .orderBy(sql`${tasks.position} DESC`)
      .limit(1)

    const position = lastTask ? lastTask.position + 1.0 : 1.0

    // Insert the task
    const [task] = await tx
      .insert(tasks)
      .values({
        workspace_id: workspaceId,
        project_id: projectId,
        title: input.title,
        description: input.description ?? null,
        task_number: nextTaskNumber,
        status: 'backlog',
        priority: input.priority ?? 'none',
        position,
        assignee_id: input.assignee_id ?? null,
        created_by: userId,
        parent_id: input.parent_id ?? null,
        due_date: input.due_date ?? null,
      })
      .returning()

    return task!
  })

  log.info('Task created', { id: result.id, task_number: result.task_number })
  return mapToTask(result)
}

/**
 * Retrieves a task by ID with workspace scope check.
 */
export async function getById(
  taskId: string,
  workspaceId: string,
): Promise<Task> {
  const [task] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.id, taskId),
        eq(tasks.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!task) {
    throw notFound('Task not found')
  }

  return mapToTask(task)
}

/**
 * Lists tasks for a project with optional filters. Ordered by
 * position ascending (Kanban column order).
 */
export async function listByProject(
  projectId: string,
  workspaceId: string,
  filters?: {
    status?: TaskStatus[]
    priority?: Priority[]
    assigneeId?: string
  },
): Promise<Task[]> {
  const conditions = [
    eq(tasks.project_id, projectId),
    eq(tasks.workspace_id, workspaceId),
  ]

  if (filters?.status && filters.status.length > 0) {
    conditions.push(inArray(tasks.status, filters.status))
  }

  if (filters?.priority && filters.priority.length > 0) {
    conditions.push(inArray(tasks.priority, filters.priority))
  }

  if (filters?.assigneeId) {
    conditions.push(eq(tasks.assignee_id, filters.assigneeId))
  }

  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.position))

  return rows.map(mapToTask)
}

/**
 * Updates task fields (title, description, priority, assignee, due date).
 * Does NOT change status or position — use move() for that.
 */
export async function update(
  taskId: string,
  workspaceId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  log.debug('Updating task', { taskId, fields: Object.keys(input) })

  const [task] = await db
    .update(tasks)
    .set(input)
    .where(
      and(
        eq(tasks.id, taskId),
        eq(tasks.workspace_id, workspaceId),
      ),
    )
    .returning()

  if (!task) {
    throw notFound('Task not found')
  }

  return mapToTask(task)
}

/**
 * Moves a task to a new status and/or position (drag-and-drop).
 * Separate from update() for distinct activity logging.
 * Checks if position rebalancing is needed after the move.
 */
export async function move(
  taskId: string,
  workspaceId: string,
  input: MoveTaskInput,
): Promise<Task> {
  log.info('Moving task', { taskId, status: input.status, position: input.position })

  const [task] = await db
    .update(tasks)
    .set({
      status: input.status,
      position: input.position,
    })
    .where(
      and(
        eq(tasks.id, taskId),
        eq(tasks.workspace_id, workspaceId),
      ),
    )
    .returning()

  if (!task) {
    throw notFound('Task not found')
  }

  // Check if the column needs rebalancing after this move
  const columnPositions = await db
    .select({ position: tasks.position })
    .from(tasks)
    .where(
      and(
        eq(tasks.project_id, task.project_id),
        eq(tasks.status, input.status),
      ),
    )
    .orderBy(asc(tasks.position))

  const positions = columnPositions.map((t) => t.position)

  if (shouldRebalance(positions)) {
    await rebalanceColumn(task.project_id, input.status)
  }

  return mapToTask(task)
}

/**
 * Deletes a task. CASCADE handles task_labels and comments.
 * Activity log entries are NOT deleted (immutable audit trail).
 */
export async function deleteTask(
  taskId: string,
  workspaceId: string,
): Promise<Task> {
  log.info('Deleting task', { taskId })

  const [task] = await db
    .delete(tasks)
    .where(
      and(
        eq(tasks.id, taskId),
        eq(tasks.workspace_id, workspaceId),
      ),
    )
    .returning()

  if (!task) {
    throw notFound('Task not found')
  }

  return mapToTask(task)
}

// ─── Mapper ────────────────────────────────────────────────────

/** Maps a Drizzle task row to the shared Task type */
function mapToTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    project_id: row.project_id,
    title: row.title,
    description: row.description,
    task_number: row.task_number,
    status: row.status,
    priority: row.priority,
    position: row.position,
    assignee_id: row.assignee_id,
    created_by: row.created_by,
    parent_id: row.parent_id,
    due_date: row.due_date,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}
