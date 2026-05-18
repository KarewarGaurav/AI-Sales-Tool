import { cn } from '@/lib/utils'
import { FOLLOW_UP_STATUS, STATUS_LABELS } from '@/utils/helpers'

const statusStyles = {
  [FOLLOW_UP_STATUS.PENDING]:
    'bg-amber-500/15 text-amber-300 border-amber-500/30',
  [FOLLOW_UP_STATUS.FOLLOWED_UP]:
    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  [FOLLOW_UP_STATUS.REPLIED]:
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

/**
 * Color-coded follow-up status indicator.
 */
export default function StatusBadge({ status, className }) {
  const label = STATUS_LABELS[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
        statusStyles[status] || statusStyles[FOLLOW_UP_STATUS.PENDING],
        className
      )}
    >
      <span
        className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80"
        aria-hidden
      />
      {label}
    </span>
  )
}

