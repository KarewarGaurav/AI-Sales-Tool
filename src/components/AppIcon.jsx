import { cn } from '@/lib/utils'

/**
 * FreightAI brand mark — ship / container motif (sidebar, headers).
 */
export default function AppIcon({ className, size = 40 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#0B1220" />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="7"
        stroke="url(#appIconGrad)"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <path d="M6 19.5h20l-2.2 4.5H8.2L6 19.5z" fill="url(#appIconGrad)" />
      <path d="M9 11h14v8.5H9V11z" fill="#4F8CFF" opacity="0.85" />
      <path d="M11 8.5h10l1.5 2.5H9.5L11 8.5z" fill="#3BE0FF" />
      <circle cx="11.5" cy="21" r="1.1" fill="#0B1220" />
      <circle cx="20.5" cy="21" r="1.1" fill="#0B1220" />
      <path d="M14 14h4v2h-4v-2z" fill="#3BE0FF" opacity="0.9" />
      <defs>
        <linearGradient
          id="appIconGrad"
          x1="6"
          y1="8"
          x2="26"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3BE0FF" />
          <stop offset="1" stopColor="#4F8CFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
