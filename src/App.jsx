import { useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Dashboard from '@/pages/Dashboard'
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const openMobileMenu = useCallback(() => {
    setMobileMenuOpen(true)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[#E8EDF7]">
      <div className="pointer-events-none fixed inset-0 bg-grid-texture opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,224,255,0.06)_0%,transparent_50%)]" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      <div
        className={`relative min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <Navbar
          title="Sales Dashboard"
          subtitle="AI outreach for freight forwarders"
          onMenuClick={openMobileMenu}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main>
          <Dashboard />
        </main>
      </div>

      <Toaster />
    </div>
  )
}
