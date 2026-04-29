import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppShell from './AppShell'
import MarketingHeader from './MarketingHeader'

type LayoutProps = {
  children: ReactNode
}

const marketingPaths = new Set(['/', '/login', '/signup'])

function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const isMarketingShell = marketingPaths.has(pathname)

  return (
    <div className="relative min-h-screen bg-surface-0">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(45,212,191,0.09),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(255,255,255,0.04),transparent)]" />
      <div className="noise-overlay" />

      {isMarketingShell ? (
        <div className="flex min-h-screen flex-col">
          <MarketingHeader />
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        <AppShell>{children}</AppShell>
      )}
    </div>
  )
}

export default Layout
