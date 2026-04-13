/**
 * @file comment.service.ts — Comment business logic
 * @module server/modules/comment
 *
 * Handles task comment CRUD with author-based access control.
 * Comments support markdown content (rendered safely on the frontend
 * via react-markdown which strips raw HTML by default).
 *
 * Access rules:
 *   - Create: any workspace member (member+)
 *   - Read: any workspace member
 *   - Update: author only
 *   - Delete: author OR admin/owner
 *
 * @dependencies drizzle-orm, server/src/core/db, server/src/core/utils
 * @related server/src/modules/comment/comment.routes.ts — calls these functions
 */

import { and, count, desc, eq } from 'drizzle-orm'

import { db } from '../../core/db'
import { comments } from '../../core/db/schema'
import { createLogger, forbidden, notFound } from '../../core/utils'

import type { Comment, CreateCommentInput, Role, UpdateCommentInput } from '@worknest/shared'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('DB')

// ─── Service Functions ─────────────────────────────────────────

/**
 * Creates a comment on a task. The author_id is set to the
 * requesting user — cannot be overridden.
 */
export async function create(
  workspaceId: string,
  taskId: string,
  userId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  log.debug('Creating comment', { taskId, userId })

  const [comment] = await db
    .insert(comments)
    .values({
      workspace_id: workspaceId,
      task_id: taskId,
      author_id: userId,
      body: input.body,
    })
    .returning()

  if (!comment) {
    throw new Error('Failed to create comment')
  }

  return mapToComment(comment)
}

/**
 * Lists comments for a task with offset-based pagination.
 * Ordered by created_at descending (newest first).
 */
export async function listByTask(
  workspaceId: string,
  taskId: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ comments: Comment[]; total: number }> {
  const offset = (page - 1) * limit

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.workspace_id, workspaceId),
          eq(comments.task_id, taskId),
        ),
      )
      .orderBy(desc(comments.created_at))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          eq(comments.workspace_id, workspaceId),
          eq(comments.task_id, taskId),
        ),
      ),
  ])

  return {
    comments: rows.map(mapToComment),
    total: totalRow?.count ?? 0,
  }
}

/**
 * Updates a comment's body. Only the author can edit their own comment.
 */
export async function update(
  commentId: string,
  workspaceId: string,
  userId: string,
  input: UpdateCommentInput,
): Promise<Comment> {
  // Fetch the comment to check ownership
  const [existing] = await db
    .select()
    .from(comments)
    .where(
      and(
        eq(comments.id, commentId),
        eq(comments.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!existing) {
    throw notFound('Comment not found')
  }

  if (existing.author_id !== userId) {
    throw forbidden('Only the comment author can edit this comment')
  }

  const [comment] = await db
    .update(comments)
    .set({ body: input.body })
    .where(eq(comments.id, commentId))
    .returning()

  if (!comment) {
    throw notFound('Comment not found')
  }

  return mapToComment(comment)
}

/**
 * Deletes a comment. The author can delete their own comment.
 * Admins and owners can delete any comment in the workspace.
 */
export async function deleteComment(
  commentId: string,
  workspaceId: string,
  userId: string,
  userRole: Role,
): Promise<void> {
  const [existing] = await db
    .select({ id: comments.id, author_id: comments.author_id })
    .from(comments)
    .where(
      and(
        eq(comments.id, commentId),
        eq(comments.workspace_id, workspaceId),
      ),
    )
    .limit(1)

  if (!existing) {
    throw notFound('Comment not found')
  }

  // Author can delete their own; admin/owner can delete any
  const isAuthor = existing.author_id === userId
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin'

  if (!isAuthor && !isAdminOrOwner) {
    throw forbidden('Only the comment author or admins can delete this comment')
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  log.info('Comment deleted', { commentId })
}

// ─── Mapper ────────────────────────────────────────────────────

function mapToComment(row: typeof comments.$inferSelect): Comment {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    task_id: row.task_id,
    author_id: row.author_id,
    body: row.body,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }
}
