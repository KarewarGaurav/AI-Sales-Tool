import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#3BE0FF] to-[#4F8CFF] text-[#0B1220] font-semibold shadow-[0_0_24px_rgba(59,224,255,0.25)] hover:brightness-110 active:scale-[0.98]',
        secondary:
          'border border-[rgba(59,224,255,0.2)] bg-[rgba(21,31,53,0.8)] text-[#E8EDF7] hover:border-[rgba(59,224,255,0.4)] hover:bg-[rgba(21,31,53,1)]',
        ghost:
          'text-[#8B9BB8] hover:text-[#E8EDF7] hover:bg-[rgba(255,255,255,0.04)]',
        outline:
          'border border-[rgba(79,140,255,0.35)] bg-transparent text-[#E8EDF7] hover:bg-[rgba(79,140,255,0.08)]',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

