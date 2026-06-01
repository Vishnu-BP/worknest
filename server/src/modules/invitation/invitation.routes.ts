/**
 * @file invitation.routes.ts — Invitation API endpoints
 * @module server/modules/invitation
 *
 * Four endpoints for workspace invitation management:
 *   GET    /workspaces/:slug/invitations     — list pending (owner/admin)
 *   POST   /workspaces/:slug/invitations     — send invitation (owner/admin)
 *   POST   /invitations/accept               — accept by token (auth, not workspace-scoped)
 *   DELETE /workspaces/:slug/invitations/:id — revoke (owner/admin)
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/invitation/invitation.service.ts
 */

import { Router } from 'express'
import { z } from 'zod'

import { createInvitationSchema } from '@worknest/shared'

import { env } from '../../core/config'
import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import { logActivity } from '../activity'
import * as invitationService from './invitation.service'
import { sendInvitationEmail } from './email.service'

// ─── Accept Invitation Schema ──────────────────────────────────

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/invitations ─────────────────────────

router.get(
  '/workspaces/:slug/invitations',
  authMiddleware,
  workspaceMiddleware,
  rbac('invitation:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const invitations = await invitationService.listPending(
        req.membership!.workspaceId,
      )
      res.json({ data: invitations })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/invitations ────────────────────────

router.post(
  '/workspaces/:slug/invitations',
  authMiddleware,
  workspaceMiddleware,
  rbac('invitation:create'),
  writeLimiter,
  validate(createInvitationSchema),
  async (req, res, next) => {
    try {
      const { email, role } = req.body as { email: string; role: 'member' | 'viewer' }
      const slug = req.params['slug'] as string

      const invitation = await invitationService.create(
        req.membership!.workspaceId,
        email,
        role,
        req.user!.id,
      )

      // Send email (non-blocking — failure doesn't affect response)
      const acceptUrl = `${env.FRONTEND_URL}/invite-accept?token=${invitation.token}`
      const inviterName = req.user!.email
      await sendInvitationEmail(email, inviterName, slug, acceptUrl)

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'member_invited',
        'invitation',
        invitation.id,
        { email, role },
      )

      res.status(201).json({ data: invitation })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /invitations/accept ──────────────────────────────────
// Not workspace-scoped — invitee may not be a member yet.

router.post(
  '/invitations/accept',
  authMiddleware,
  writeLimiter,
  validate(acceptInvitationSchema),
  async (req, res, next) => {
    try {
      const { token } = req.body as { token: string }

      await invitationService.accept(token, req.user!.id, req.user!.email)

      res.json({ data: { message: 'Invitation accepted' } })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/invitations/:id ──────────────────

router.delete(
  '/workspaces/:slug/invitations/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('invitation:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      await invitationService.revoke(
        req.params['id'] as string,
        req.membership!.workspaceId,
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

export { router as invitationRouter }
