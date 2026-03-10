import type { ReactNode } from 'react'
import Navigation from './Navigation'

type LayoutProps = {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-blue-50 via-white to-indigo-100" />

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Study Buddy Finder
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Find the right study partner faster
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              A clean place to connect with students, build better study habits,
              and stay organized.
            </p>
          </div>

          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}

export default Layout
