# Auth & RBAC

Authentication flow, JWT handling, role permissions, and invitation system.

---

## Authentication (Supabase Auth)

**Tokens:** Access token (JWT, 1hr expiry) + Refresh token (long-lived). Stored by Supabase client. Auto-refresh is transparent to the user.

**Signup flow:** Credentials → Supabase creates account → trigger creates `public.users` row → tokens returned → redirect to workspace creation.

**Login flow:** Credentials → Supabase verifies → fresh tokens → redirect to last workspace.

**Google OAuth:** Click → Google consent → redirect back → Supabase exchanges code → tokens issued.

**Token in every request:** `api.ts` attaches `Authorization: Bearer <token>` to all HTTP requests automatically.

## JWT Flow Through Layers

1. Frontend `api.ts` attaches token
2. `auth.middleware.ts` — verify signature, extract user ID → `req.user`
3. `workspace.middleware.ts` — verify membership, extract role → `req.membership`
4. `rbac.middleware.ts` — check role permission → allow or 403
5. Database — JWT passed to session, RLS reads `auth.uid()`

## RBAC Roles

| Role | Count | Purpose |
|---|---|---|
| Owner | Exactly 1 | Full control, can delete workspace, transfer ownership |
| Admin | Unlimited | Near-full, manages members and roles |
| Member | Unlimited | Create/edit tasks, comment, default role |
| Viewer | Unlimited | Read-only |

## Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View workspace/projects/tasks | ✓ | ✓ | ✓ | ✓ |
| Create/edit project | ✓ | ✓ | ✓ | ✗ |
| Archive/delete project | ✓ | ✓ | ✗ | ✗ |
| Create/edit/move task | ✓ | ✓ | ✓ | ✗ |
| Delete task | ✓ | ✓ | ✗ | ✗ |
| Comment (create) | ✓ | ✓ | ✓ | ✗ |
| Delete any comment | ✓ | ✓ | ✗ | ✗ |
| Invite/remove members | ✓ | ✓ | ✗ | ✗ |
| Change roles | ✓ | ✓ (not to owner) | ✗ | ✗ |
| Update workspace | ✓ | ✓ | ✗ | ✗ |
| Transfer ownership | ✓ | ✗ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ | ✗ |

## Edge Cases

- Owner NEVER removed/demoted — only transferred
- Ownership transfer is atomic transaction (current→admin, target→owner)
- Admins cannot promote to admin/owner — only owner can
- Self-demotion allowed for admin, not owner

## Invitation System

**Happy path:** Admin invites email → generate token (crypto.randomUUID, 48hr expiry) → send email via Resend → invitee clicks link → verify token → create member row → status = accepted.

**New user path:** Invitee has no account → redirect to signup with token in query param → after signup → auto-accept → join workspace.

**Edge cases:** Duplicate invitation (error), already member (error), expired token (update status, reject), revoked (reject), email mismatch (reject), simultaneous accept (first wins).

**Token security:** Cryptographically secure, single-use, 48hr expiry, never exposed in API responses.

**Rate limit:** 10 invitations per hour per workspace.

## Route Protection (Frontend)

`AuthGuard` component wraps protected routes. Checks Supabase session → valid: render page → invalid: redirect to login.
