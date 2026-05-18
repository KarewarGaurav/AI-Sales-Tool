import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/utils/helpers'
import { toast } from '@/components/ui/use-toast'

/**
 * AI output display with copy action and entrance animation.
 */
export default function OutputCard({
  title,
  content,
  className,
  animationDelay = 0,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(content)
    if (ok) {
      setCopied(true)
      toast({
        title: 'Copied to clipboard',
        variant: 'success',
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        title: 'Copy failed',
        description: 'Please select and copy manually.',
        variant: 'destructive',
      })
    }
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[rgba(59,224,255,0.12)]',
        'bg-[linear-gradient(145deg,rgba(21,31,53,0.95)_0%,rgba(17,26,46,0.88)_100%)]',
        'shadow-[var(--shadow-card)] backdrop-blur-md',
        'animate-fade-slide-up',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3BE0FF]/40 to-transparent" />

      <header className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <h3 className="font-heading text-base font-semibold tracking-tight text-[#E8EDF7]">
          {title}
        </h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          disabled={!content}
          aria-label={`Copy ${title}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </header>

      <div className="custom-scrollbar max-h-[320px] overflow-y-auto overflow-x-hidden px-5 py-4">
        {content ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#C5D0E6]">
            {content}
          </p>
        ) : (
          <p className="text-sm italic text-[#5C6B88]">
            No content generated yet.
          </p>
        )}
      </div>
    </article>
  )
}

