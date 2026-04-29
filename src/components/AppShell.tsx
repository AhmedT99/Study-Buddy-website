import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppSidebar from './AppSidebar'

type AppShellProps = {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const title = getRouteTitle(pathname)

  return (
    <div className="flex min-h-screen bg-surface-0">
      <AppSidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col lg:pl-[var(--sidebar-w)]">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface-0/90 px-4 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary lg:hidden"
            aria-label="Open navigation"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-medium tracking-tight text-text-primary md:text-xl">
              {title}
            </h1>
            <p className="hidden text-xs text-text-tertiary sm:block">
              Study Buddy Finder workspace
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="page-shell-enter mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppShell

function getRouteTitle(pathname: string) {
  if (pathname === '/dashboard') return 'Overview'
  if (pathname === '/requests') return 'Create Request'
  if (pathname.startsWith('/requests/')) return 'Request Details'
  if (pathname === '/discover') return 'Discover'
  if (pathname === '/messages') return 'Messages'
  if (pathname === '/notifications') return 'Notifications'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/profile') return 'Profile'
  if (pathname === '/admin') return 'Admin'
  return 'Workspace'
}
