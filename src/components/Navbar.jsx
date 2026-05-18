import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import AppIcon from '@/components/AppIcon'

/**
 * Top navigation bar with page title and user placeholder.
 */
export default function Navbar({
  title = 'Sales Dashboard',
  subtitle,
  onMenuClick,
  sidebarCollapsed,
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4',
        'border-b border-[rgba(59,224,255,0.08)] bg-[rgba(11,18,32,0.85)] px-4 backdrop-blur-xl',
        'lg:px-8',
        sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AppIcon size={32} className="hidden sm:block lg:hidden" />
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-[#E8EDF7] md:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden text-xs text-[#5C6B88] sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-[#8B9BB8]"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 rounded-full border border-[rgba(59,224,255,0.15)] bg-[rgba(21,31,53,0.6)] py-1.5 pl-1.5 pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3BE0FF] to-[#4F8CFF] text-xs font-bold text-[#0B1220]">
            SA
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-[#E8EDF7]">Sales Agent</p>
            <p className="text-[10px] text-[#5C6B88]">Freight Forwarder</p>
          </div>
        </div>
      </div>
    </header>
  )
}
