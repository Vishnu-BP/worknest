/**
 * @file PriorityBadge.tsx — Priority level icon with color
 * @module client/features/task/components
 *
 * Displays a colored icon representing the task's priority level.
 * Colors match the design tokens from docs/design-tokens.md.
 * Wrapped in a tooltip showing the priority name.
 *
 * @dependencies lucide-react, shadcn/ui
 * @related client/src/features/task/components/TaskCard.tsx — renders this
 */

import { AlertCircle, ArrowDown, ArrowUp, Minus, Signal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@core/components/ui/tooltip'
import { cn } from '@core/lib'

import type { Priority } from '@worknest/shared'

// ─── Priority Config ───────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { icon: LucideIcon; color: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-priority-urgent', label: 'Urgent' },
  high: { icon: ArrowUp, color: 'text-priority-high', label: 'High' },
  medium: { icon: Signal, color: 'text-priority-medium', label: 'Medium' },
  low: { icon: ArrowDown, color: 'text-priority-low', label: 'Low' },
  none: { icon: Minus, color: 'text-priority-none', label: 'None' },
}

// ─── Component ─────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: Priority
  showTooltip?: boolean
}

export function PriorityBadge({ priority, showTooltip = true }: PriorityBadgeProps): JSX.Element {
  const config = PRIORITY_CONFIG[priority]
  const Icon = config.icon

  if (priority === 'none') return <></>

  const iconElement = <Icon className={cn('h-3.5 w-3.5', config.color)} />

  if (!showTooltip) return iconElement

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center">{iconElement}</span>
        </TooltipTrigger>
        <TooltipContent className="border-border bg-surface text-text">
          <p className="text-xs">{config.label} priority</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
