/**
 * @file chat-message.routes.ts — Chat message API endpoints
 * @module server/modules/chat-message
 *
 * Endpoints:
 *   GET    /workspaces/:slug/channels/:channelId/messages?cursor&limit — list (paginated)
 *   POST   /workspaces/:slug/channels/:channelId/messages              — post
 *   PATCH  /workspaces/:slug/messages/:id                              — edit (author only)
 *   DELETE /workspaces/:slug/messages/:id                              — delete (author/admin)
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/chat-message/chat-message.service.ts
 */

import { Router } from 'express'

import { createMessageSchema, updateMessageSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import { logActivity } from '../activity'

import * as messageService from './chat-message.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/channels/:channelId/messages ────────

router.get(
  '/workspaces/:slug/channels/:channelId/messages',
  authMiddleware,
  workspaceMiddleware,
  rbac('message:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const channelId = req.params['channelId'] as string
      const cursor = (req.query['cursor'] as string | undefined) ?? undefined
      const limit = req.query['limit'] ? Number(req.query['limit']) : undefined

      const result = await messageService.listByChannel(
        req.membership!.workspaceId,
        channelId,
        req.user!.id,
        { cursor, limit },
      )

      res.json({ data: result.messages, nextCursor: result.nextCursor })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/channels/:channelId/messages ───────

router.post(
  '/workspaces/:slug/channels/:channelId/messages',
  authMiddleware,
  workspaceMiddleware,
  rbac('message:create'),
  writeLimiter,
  validate(createMessageSchema),
  async (req, res, next) => {
    try {
      const channelId = req.params['channelId'] as string
      const message = await messageService.create(
        req.membership!.workspaceId,
        channelId,
        req.user!.id,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'message_posted',
        'chat_message',
        message.id,
        { channel_id: channelId },
      )

      res.status(201).json({ data: message })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/messages/:id ──────────────────────

router.patch(
  '/workspaces/:slug/messages/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('message:update'),
  writeLimiter,
  validate(updateMessageSchema),
  async (req, res, next) => {
    try {
      const messageId = req.params['id'] as string
      const message = await messageService.update(
        messageId,
        req.membership!.workspaceId,
        req.user!.id,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'message_edited',
        'chat_message',
        messageId,
        {},
      )

      res.json({ data: message })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/messages/:id ─────────────────────

router.delete(
  '/workspaces/:slug/messages/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('message:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const messageId = req.params['id'] as string
      const removed = await messageService.deleteMessage(
        messageId,
        req.membership!.workspaceId,
        req.user!.id,
        req.membership!.role,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'message_deleted',
        'chat_message',
        messageId,
        { channel_id: removed.channel_id },
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

export { router as chatMessageRouter }
