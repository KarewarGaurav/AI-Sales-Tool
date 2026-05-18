import { cn } from '@/lib/utils'

/**
 * Branded minimal loader — dual ring with accent glow.
 */
export default function Loader({ className, label = 'Generating outreach…' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 py-12',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative h-14 w-14">
        <div
          className="absolute inset-0 rounded-full border-2 border-[rgba(59,224,255,0.15)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#3BE0FF] border-r-[#4F8CFF] animate-spin-slow"
          aria-hidden
        />
        <div
          className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(59,224,255,0.2)_0%,transparent_70%)] animate-pulse-glow"
          aria-hidden
        />
      </div>
      <p className="font-heading text-sm font-medium tracking-wide text-[#8B9BB8]">
        {label}
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#3BE0FF] animate-pulse-glow"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

