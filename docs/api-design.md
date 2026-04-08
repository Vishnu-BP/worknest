# API Design

Complete endpoint map, middleware chain, request validation, and response format.

---

## Response Format

Success: `{ data: ... }` with status 200/201/204.
Error: `{ error: "ERROR_CODE", message: "Human-readable", details?: {...} }` with appropriate status.

## Middleware Chain

Every workspace-scoped route: `cors → rateLimiter → authMiddleware → workspaceMiddleware → rbacMiddleware(permission) → routeHandler`

## Endpoints

### Auth
| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/callback` | OAuth callback, ensure user exists | Public |
| GET | `/api/auth/me` | Current user profile | Auth |
| PATCH | `/api/auth/me` | Update profile | Auth |

### Workspaces
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces` | List user's workspaces | Auth |
| POST | `/api/workspaces` | Create workspace (+ owner member) | Auth |
| GET | `/api/workspaces/:slug` | Get workspace | Any member |
| PATCH | `/api/workspaces/:slug` | Update workspace | Owner, Admin |
| DELETE | `/api/workspaces/:slug` | Delete workspace (cascades) | Owner |

### Members
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/members` | List members | Any member |
| PATCH | `/api/workspaces/:slug/members/:id` | Change role | Owner, Admin |
| DELETE | `/api/workspaces/:slug/members/:id` | Remove member | Owner, Admin |

### Invitations
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/invitations` | List pending | Owner, Admin |
| POST | `/api/workspaces/:slug/invitations` | Create (send email) | Owner, Admin |
| POST | `/api/invitations/accept` | Accept by token | Auth (not scoped) |
| DELETE | `/api/workspaces/:slug/invitations/:id` | Revoke | Owner, Admin |

### Projects
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/projects` | List projects | Any member |
| POST | `/api/workspaces/:slug/projects` | Create project | Member+ |
| GET | `/api/workspaces/:slug/projects/:id` | Get project | Any member |
| PATCH | `/api/workspaces/:slug/projects/:id` | Update project | Member+ |
| DELETE | `/api/workspaces/:slug/projects/:id` | Delete project | Owner, Admin |

### Tasks
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/projects/:projectId/tasks` | List (filterable) | Any member |
| POST | `/api/workspaces/:slug/projects/:projectId/tasks` | Create task | Member+ |
| GET | `/api/workspaces/:slug/tasks/:taskId` | Get full detail | Any member |
| PATCH | `/api/workspaces/:slug/tasks/:taskId` | Update fields | Member+ |
| PATCH | `/api/workspaces/:slug/tasks/:taskId/move` | Drag-and-drop move | Member+ |
| DELETE | `/api/workspaces/:slug/tasks/:taskId` | Delete task | Owner, Admin |

### Comments
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/tasks/:taskId/comments` | List (paginated) | Any member |
| POST | `/api/workspaces/:slug/tasks/:taskId/comments` | Add comment | Member+ |
| PATCH | `/api/workspaces/:slug/comments/:id` | Edit comment | Author |
| DELETE | `/api/workspaces/:slug/comments/:id` | Delete comment | Author/Admin/Owner |

### Labels
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/labels` | List labels | Any member |
| POST | `/api/workspaces/:slug/labels` | Create label | Member+ |
| PATCH | `/api/workspaces/:slug/labels/:id` | Update label | Owner, Admin |
| DELETE | `/api/workspaces/:slug/labels/:id` | Delete label | Owner, Admin |

### Task-Labels
| Method | Route | Purpose | Permission |
|---|---|---|---|
| POST | `/api/workspaces/:slug/tasks/:taskId/labels` | Add label | Member+ |
| DELETE | `/api/workspaces/:slug/tasks/:taskId/labels/:labelId` | Remove label | Member+ |

### Activity Log
| Method | Route | Purpose | Permission |
|---|---|---|---|
| GET | `/api/workspaces/:slug/activity` | List (paginated, filterable) | Any member |

## Validation

Every POST/PATCH validates request body with Zod before the route handler runs. Zod schemas live in `shared/validators/` — same schemas validate frontend forms and backend requests.

## Pagination Standard

All list endpoints support offset-based pagination:

**Request:** `?page=1&limit=20` (defaults: page=1, limit=20, maxLimit=100)

**Response shape:**
```
{
  data: T[],
  pagination: { page, limit, total, totalPages }
}
```

Endpoints requiring pagination: comments (by task), activity log (by workspace), task list (by project), invitations (by workspace).

## Markdown Sanitization (XSS Prevention)

Comments and task descriptions accept markdown. Use `react-markdown` with `remarkGfm` on the frontend — it strips raw HTML by default. NEVER use `dangerouslySetInnerHTML` for user content. Optionally sanitize on backend INSERT with `sanitize-html` as defense in depth.

## Rate Limiting

- Generous on reads (GET)
- Strict on writes (POST/PATCH/DELETE)
- Very strict on invitations (10/hour/workspace) and auth attempts
