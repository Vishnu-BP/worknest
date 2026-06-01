/**
 * @file chat-channel.routes.ts — Channel API endpoints
 * @module server/modules/chat-channel
 *
 * Endpoints:
 *   GET    /workspaces/:slug/projects/:projectId/channels — list project channels
 *   POST   /workspaces/:slug/projects/:projectId/channels — create
 *   GET    /workspaces/:slug/dms                          — list current user's DMs
 *   POST   /workspaces/:slug/dms                          — getOrCreate a DM with a user
 *   PATCH  /workspaces/:slug/channels/:id                 — rename
 *   DELETE /workspaces/:slug/channels/:id                 — delete
 *
 * @dependencies express, @worknest/shared, server/src/core/middleware
 * @related server/src/modules/chat-channel/chat-channel.service.ts
 */

import { Router } from 'express'

import { createChannelSchema, createDMSchema, updateChannelSchema } from '@worknest/shared'

import {
  authMiddleware,
  rbac,
  readLimiter,
  validate,
  workspaceMiddleware,
  writeLimiter,
} from '../../core/middleware'

import { logActivity } from '../activity'

import * as channelService from './chat-channel.service'

// ─── Router ────────────────────────────────────────────────────

const router = Router()

// ─── GET /workspaces/:slug/projects/:projectId/channels ────────

router.get(
  '/workspaces/:slug/projects/:projectId/channels',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const projectId = req.params['projectId'] as string
      const channels = await channelService.listByProject(
        req.membership!.workspaceId,
        projectId,
      )
      res.json({ data: channels })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/projects/:projectId/channels ───────

router.post(
  '/workspaces/:slug/projects/:projectId/channels',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:create'),
  writeLimiter,
  validate(createChannelSchema),
  async (req, res, next) => {
    try {
      const projectId = req.params['projectId'] as string
      const channel = await channelService.create(
        req.membership!.workspaceId,
        projectId,
        req.user!.id,
        req.body,
      )

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'channel_created',
        'chat_channel',
        channel.id,
        { channel_name: channel.name, project_id: projectId },
      )

      res.status(201).json({ data: channel })
    } catch (error) {
      next(error)
    }
  },
)

// ─── GET /workspaces/:slug/dms ─────────────────────────────────

router.get(
  '/workspaces/:slug/dms',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:read'),
  readLimiter,
  async (req, res, next) => {
    try {
      const dms = await channelService.listDMsForUser(
        req.membership!.workspaceId,
        req.user!.id,
      )
      res.json({ data: dms })
    } catch (error) {
      next(error)
    }
  },
)

// ─── POST /workspaces/:slug/dms ────────────────────────────────

router.post(
  '/workspaces/:slug/dms',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:create'),
  writeLimiter,
  validate(createDMSchema),
  async (req, res, next) => {
    try {
      const channel = await channelService.getOrCreateDM(
        req.membership!.workspaceId,
        req.user!.id,
        req.body.user_id,
      )
      res.status(201).json({ data: channel })
    } catch (error) {
      next(error)
    }
  },
)

// ─── PATCH /workspaces/:slug/channels/:id ──────────────────────

router.patch(
  '/workspaces/:slug/channels/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:update'),
  writeLimiter,
  validate(updateChannelSchema),
  async (req, res, next) => {
    try {
      const channelId = req.params['id'] as string
      const channel = await channelService.update(
        channelId,
        req.membership!.workspaceId,
        req.body,
      )
      res.json({ data: channel })
    } catch (error) {
      next(error)
    }
  },
)

// ─── DELETE /workspaces/:slug/channels/:id ─────────────────────

router.delete(
  '/workspaces/:slug/channels/:id',
  authMiddleware,
  workspaceMiddleware,
  rbac('channel:delete'),
  writeLimiter,
  async (req, res, next) => {
    try {
      const channelId = req.params['id'] as string
      await channelService.deleteChannel(channelId, req.membership!.workspaceId)

      await logActivity(
        req.membership!.workspaceId,
        req.user!.id,
        'channel_deleted',
        'chat_channel',
        channelId,
        {},
      )

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

export { router as chatChannelRouter }
