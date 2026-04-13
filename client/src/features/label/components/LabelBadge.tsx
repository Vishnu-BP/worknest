/**
 * @file LabelBadge.tsx — Colored label pill
 * @module client/features/label/components
 *
 * Displays a label as a small colored pill with the label name.
 * Used on task cards and in the task detail modal properties panel.
 * The background uses the label's color at low opacity for readability.
 *
 * @dependencies client/src/core/lib
 * @related client/src/features/task/components/TaskCard.tsx — renders these
 */

import type { Label } from '@worknest/shared'

// ─── Component ─────────────────────────────────────────────────

interface LabelBadgeProps {
  label: Label
  /** Compact mode shows just the color dot (used on task cards) */
  compact?: boolean
}

export function LabelBadge({ label, compact }: LabelBadgeProps): JSX.Element {
  if (compact) {
    return (
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: label.color }}
        title={label.name}
      />
    )
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
        border: `1px solid ${label.color}40`,
      }}
    >
      {label.name}
    </span>
  )
}
