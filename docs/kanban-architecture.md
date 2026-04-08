# Kanban Board Architecture

Four systems powering the board: ordering, interaction, perceived performance, multi-user sync.

---

## 1. Fractional Indexing (Ordering)

Every task has a `position` column (REAL/float). Tasks render in ascending position order within each column.

**Position calculation:**
- Top of column → first task position − 1.0
- Bottom of column → last task position + 1.0
- Between two tasks → average of above and below
- Empty column → 1.0

**Rebalancing:** When gap between adjacent positions falls below 0.001, background job resets to clean integers. Rarely needed. Implementation: a utility function `shouldRebalance(positions: number[])` checks after each move — if triggered, a service call resets positions for the entire column to 1.0, 2.0, 3.0, etc. in a single transaction.

## 2. Drag and Drop (dnd-kit)

**DndContext** wraps the board → **SortableContext** wraps each column → **useSortable** on each TaskCard.

**Drag lifecycle:**
- `onDragStart` — record dragged task, show DragOverlay, dim original
- `onDragOver` — detect hover target, shift cards to show drop preview
- `onDragEnd` — calculate position (fractional indexing), fire optimistic update + mutation
- `onDragCancel` — revert, no mutation

Cross-column drag changes `status` + `position`. Within-column changes `position` only. Both use PATCH `/move`.

## 3. Optimistic Updates

On drop → snapshot cache → cancel refetches → update cache immediately → fire PATCH → on success: background refetch → on failure: restore snapshot + error toast.

User sees instant result. Server round trip happens invisibly.

## 4. Real-time Sync (Supabase Realtime)

Subscribe per project: `tasks` table changes where `project_id` matches.

User A drags → optimistic on A's screen → server updates DB → Realtime broadcasts → User B's cache invalidated → refetch → B's board updates (1-2s delay).

**Conflict:** Last write wins (industry standard for Kanban).
**Cleanup:** Unsubscribe on navigate away, resubscribe on return.
**Channel limits:** Supabase free tier allows ~200 concurrent connections. One channel per open project board. Unsubscribe aggressively on navigation to stay within limits.

## Complete Drag Sequence

User grabs card → dnd-kit tracks → drops between two cards in different column → `onDragEnd` fires → calculate position (fractional) → TanStack Query snapshots + optimistic update → board re-renders → PATCH fires → Express validates → DB updates → Realtime broadcasts → other clients invalidate + refetch → all boards converge.
