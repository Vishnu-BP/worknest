# Coding Standards

Rules for writing every file in WorkNest. Read this before creating or editing any file.

---

## File Headers

Every file MUST start with a JSDoc block:

```typescript
/**
 * @file filename.ts — one-line purpose
 * @module client/hooks | server/services | etc.
 *
 * 2-3 sentences: what this file does, why it exists,
 * its role in the architecture.
 *
 * @dependencies key external deps
 * @related related files this works with
 */
```

## Section Separators

Files longer than 50 lines use dash separators:

```typescript
// ─── Types ─────────────────────────────────────────

// ─── Constants ─────────────────────────────────────

// ─── Helpers ───────────────────────────────────────

// ─── Component / Main ──────────────────────────────

// ─── Exports ───────────────────────────────────────
```

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React component file | PascalCase.tsx | `TaskCard.tsx` |
| Hook file | camelCase with "use" | `useTasks.ts` |
| Store file | camelCase with "Store" | `uiStore.ts` |
| Service file | .service.ts | `task.service.ts` |
| Route file | .routes.ts | `task.routes.ts` |
| Middleware file | .middleware.ts | `auth.middleware.ts` |
| Schema file | .schema.ts | `task.schema.ts` |
| Validator file | .validators.ts | `task.validators.ts` |
| Type file | .types.ts | `task.types.ts` |
| Variables | camelCase | `taskList`, `isLoading` |
| Functions | camelCase, verb-first | `createTask()`, `getMemberRole()` |
| Constants | UPPER_SNAKE_CASE | `MAX_INVITE_EXPIRY_HOURS` |
| Types/Interfaces | PascalCase, no "I" prefix | `Task`, `CreateTaskInput` |
| Booleans | is/has/can/should prefix | `isLoading`, `hasPermission` |
| Event handlers | handle prefix | `handleDragEnd`, `handleSubmit` |
| DB tables | snake_case, plural | `task_labels`, `activity_log` |
| DB columns | snake_case | `workspace_id`, `created_at` |

## Tagged Loggers

NEVER use raw `console.log`. Every file with runtime logic gets a tagged logger:

```typescript
import { createLogger } from '@/lib/logger'
const log = createLogger('BOARD')

log.info('Optimistic update: moved task', taskId)
log.error('Move failed, rolling back', error)
```

Pre-configured tags: `AUTH`, `API`, `BOARD`, `WS`, `STORE`, `UI`, `DB`, `RBAC`, `MAIL`, `MW`.

## Barrel Exports

Every folder acting as a public API has an `index.ts`:

```typescript
// hooks/index.ts
export { useTasks, taskKeys } from './useTasks'
export { useCreateTask } from './useCreateTask'
```

Consumers import from the barrel, never internal files.

## TypeScript Rules

- `strict: true` — no exceptions
- NEVER use `any` — use `unknown` and narrow
- NEVER use `@ts-ignore` without a WHY comment
- Always explicit return types on exported functions
- Use `import type` for type-only imports
- Prefer `interface` for objects, `type` for unions/aliases

## Import Order

1. External libraries
2. Shared imports (`@shared/`)
3. Internal absolute (`@/`)
4. Relative (max 2 levels up)
5. Type-only imports

## File Size Limits

- Components: 200 lines max
- Services: 300 lines max
- Routes: 200 lines max
- Utilities: 150 lines max

Split before continuing if exceeded.

## Comments

Explain WHY, not WHAT. Never reference refactoring history:

```typescript
// BAD: Moved from TaskCard.tsx during refactor
// GOOD: workspace_id is redundant but stored directly for fast RLS checks
```

## Code Discipline

- **Reuse before creating** — search codebase for existing logic first
- **Never delete files** — rename with `_DEPRECATED` suffix
- **Simplicity over cleverness** — if a junior can't read it in 30 seconds, simplify
- **No magic numbers** — extract to named constants with descriptive names
- **Isolated try/catch** — one service failure must never crash another
