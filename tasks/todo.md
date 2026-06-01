# WorkNest — Task Tracker

> Active checklist for current phase + completed work log.
> Per CLAUDE.md: never delete completed items — move to Completed Work Log.

---

## Current: Phase 11 — Realtime + Invitations + Command Palette

### Step 1: Server — Invitation Module
- [ ] Install `resend` on server
- [ ] Create `invitation.service.ts` — create, listPending, accept, revoke
- [ ] Create `email.service.ts` — sendInvitationEmail via Resend
- [ ] Create `invitation.routes.ts` — 4 endpoints
- [ ] Update `app.ts` — mount invitationRouter

### Step 2: Client — Realtime Provider
- [ ] Create `RealtimeProvider.tsx` — subscribe per project, invalidate on changes
- [ ] Update `ProjectBoard.tsx` — wrap with RealtimeProvider
- [ ] Update `cleanup.ts` — unsubscribe Realtime on sign-out

### Step 3: Client — Invitation Hooks + Components
- [ ] Create 4 invitation hooks + InviteDialog + InvitationList
- [ ] Update `Members.tsx` — invite button + pending list
- [ ] Update `keys.ts` — add invitationKeys

### Step 4: Client — InviteAccept + Signup
- [ ] Create `InviteAccept.tsx` page
- [ ] Update `Signup.tsx` + `App.tsx`

### Step 5: Client — Command Palette
- [ ] Install `cmdk` + create `CommandPalette.tsx` + update `Header.tsx`

### Step 6: Verify
- [ ] `tsc --noEmit` zero errors, Vite starts

---

## Deferred — install when testing/lint phase begins

- [ ] Install ESLint + config in `client/` and `server/` (scripts already reference `eslint src/` but package isn't installed)
- [ ] Install Playwright + add `test:e2e` script to root `package.json` for end-to-end tests
- [ ] Write actual Vitest tests in both workspaces (currently 0 tests)

---

## Completed Work Log

### Phase 1-3: Monorepo, database, Express foundation
### Phase 4-5: Auth, restructure, workspace + members backend
### Phase 6-7: Frontend shell, projects full-stack
### Phase 8-9: Tasks backend + Kanban board UI
### Phase 10: Comments, labels, task detail modal, activity feed (33 endpoints total)
