import { LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import AppIcon from '@/components/AppIcon'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
]

/**
 * Collapsible sidebar — drawer on mobile via parent layout state.
 */
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[rgba(59,224,255,0.1)]',
          'bg-[linear-gradient(180deg,#0B1220_0%,#111A2E_100%)] transition-all duration-300 ease-out',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-5',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3BE0FF]/20 to-[#4F8CFF]/20 shadow-[0_0_20px_rgba(59,224,255,0.25)] ring-1 ring-[rgba(59,224,255,0.25)]">
            <AppIcon size={28} />
          </div>
          {!collapsed && (
            <div>
              <p className="font-heading text-sm font-bold tracking-tight text-[#E8EDF7]">
                FreightAI
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[#5C6B88]">
                Sales Intelligence
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.id}
                href="#dashboard"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-[rgba(59,224,255,0.12)] text-[#3BE0FF] border border-[rgba(59,224,255,0.2)]'
                    : 'text-[#8B9BB8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#E8EDF7]',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </a>
            )
          })}
        </nav>

        {/* Collapse toggle — desktop */}
        <div className="hidden border-t border-[rgba(255,255,255,0.06)] p-3 lg:block">
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn('w-full', collapsed && 'mx-auto')}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}

