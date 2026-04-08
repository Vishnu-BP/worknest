/**
 * @file comment.types.ts — Comment entity types
 * @module shared/types
 *
 * Defines task discussion comments with markdown body support.
 * workspace_id is stored directly for fast RLS checks.
 * Comments are rendered with react-markdown (strips raw HTML by default).
 *
 * @dependencies none
 * @related shared/src/types/task.types.ts — comments belong to tasks
 */

export interface Comment {
  readonly id: string
  readonly workspace_id: string
  readonly task_id: string
  readonly author_id: string
  readonly body: string
  readonly created_at: string
  readonly updated_at: string
}

export interface CreateCommentInput {
  readonly body: string
}

export interface UpdateCommentInput {
  readonly body: string
}
