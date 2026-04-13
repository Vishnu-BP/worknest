/**
 * @file project.service.ts — Project business logic
 * @module server/modules/project
 *
 * Handles project CRUD within a workspace. Projects are containers for
 * tasks, each with a unique key (e.g., "ENG") used as the task number
 * prefix (ENG-1, ENG-2). Key uniqueness is enforced per workspace via
 * a database constraint — this service catches violations and returns
 * a 409 Conflict error.
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/project/project.routes.ts — calls these functions
 */

import { and, eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { projects } from '../../core/db/schema'
import { conflict, createLogger, notFound } from '../../core/utils'

import type { CreateProjectInput, Project, UpdateProjectInput } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates a new project in the workspace. The key must be unique
 * within the workspace — duplicates are caught by the DB constraint
 * and surfaced as a 409 Conflict error.
 */
export async function create(
  workspaceId: string,
  userId: string,
  input: CreateProjectInput,
): Promise<Project> {
  log.info('Creating project', { name: input.name, key: input.key, workspaceId })

  try {
    const [project] = await db
      .insert(projects)
      .values({
        workspace_id: workspaceId,
        name: input.name,
        key: input.key,
        description: input.description ?? null,
        color: input.color ?? '#6366f1',
        created_by: userId,
      })
      .returning()

    if (!project) {
      throw new Error('Failed to create project')
    }

    log.info('Project created', { id: project.id, key: project.key })
    return mapToProject(project)
  } catch (error) {
    // Catch unique constraint violation on (workspace_id, key)
    if (error instanceof Error && error.message.includes('unique')) {
      throw conflict(`Project key "${input.key}" already exists in this workspace`)
    }
    throw error
  }
}

/**
 * Retrieves a project by ID, ensuring it belongs to the given workspace.
 */
export async function getById(
  projectId: string,
  workspaceId: string,
): Promise<Project> {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!project) {
    throw notFound('Project not found')
  }

  return mapToProject(project)
}

/**
 * Lists all non-archived projects in a workspace, ordered by creation date.
 */
export async function listByWorkspace(workspaceId: string): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.workspace_id, workspaceId),
        eq(projects.is_archived, false),
      ),
    )
    .orderBy(projects.created_at)

  return rows.map(mapToProject)
}

/**
 * Updates project fields. Only provided fields are changed.
 */
export async function update(
  projectId: string,
  workspaceId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  log.debug('Updating project', { projectId, fields: Object.keys(input) })

  const [project] = await db
    .update(projects)
    .set(input)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspace_id, workspaceId),
      ),
    )
    .returning()

  if (!project) {
    throw notFound('Project not found')
  }

  return mapToProject(project)
}

/**
 * Deletes a project. CASCADE foreign keys automatically remove
 * all related tasks, comments, task_labels, and activity_log entries.
 */
export async function deleteProject(
  projectId: string,
  workspaceId: string,
): Promise<void> {
  log.info('Deleting project', { projectId, workspaceId })

  const [deleted] = await db
    .delete(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspace_id, workspaceId),
      ),
    )
    .returning({ id: projects.id })

  if (!deleted) {
    throw notFound('Project not found')
  }
}

// ─── Mapper ────────────────────────────────────────────────────

/** Maps a Drizzle project row to the shared Project type */
function mapToProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    description: row.description,
    key: row.key,
    color: row.color,
    task_counter: row.task_counter,
    is_archived: row.is_archived,
    created_by: row.created_by,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}
