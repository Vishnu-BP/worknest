/**
 * @file member.routes.ts — Member management API endpoints
 * @module server/modules/member
 *
 * Three endpoints for workspace member management:
 *   GET    /workspaces/:slug/members             — list members with profiles
 *   PATCH  /workspaces/:slug/members/:memberId   — change member role
 *   DELETE /workspaces/:slug/members/:memberId   — remove member
 *
 * All endpoints require workspace membership (workspaceMiddleware).
 * Role changes and removals are gated by RBAC (owner/admin only).
 * Business rule guards (owner protection) are in member.service.ts.
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/member/member.service.ts — business logic
 */

import { Router } from 'express'

import { updateMemberRoleSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import * as memberService from './member.service'

import type { Role } from '@worknest/shared'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/members ─────────────────────────────
// List all members of the workspace with their user profiles.

router.get(
  '/workspaces/:slug/members',
  authMiddleware,
  workspaceMiddleware,
  rbac('member:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const members = await memberService.listByWorkspace(
        req.membership!.workspaceId,
      )
      res.json({ data: members })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/members/:memberId ─────────────────
// Change a member's role. Owner/admin only. Guards in service.

router.patch(
  '/workspaces/:slug/members/:memberId',
  authMiddleware,
  workspaceMiddleware,
  rbac('member:update'),
  writeLimiter,
  validate(updateMemberRoleSchema),
  async (req, res, next) => {
    try {
      const memberId = req.params['memberId'] as string
      const { role } = req.body as { role: Role }

      const member = await memberService.updateRole(
        memberId,
        req.membership!.workspaceId,
        role,
        req.membership!.role,
      )
      res.json({ data: member })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/members/:memberId ─────────────────
// Remove a member from the workspace. Owner/admin only.

router.delete(
  '/workspaces/:slug/members/:memberId',
  authMiddleware,
  workspaceMiddleware,
  rbac('member:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const memberId = req.params['memberId'] as string

      await memberService.removeMember(
        memberId,
        req.membership!.workspaceId,
      )
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

// ─── Export ────────────────────────────────────────────────────

export { router as memberRouter }
