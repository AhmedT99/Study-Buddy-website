import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function MarketingHeader() {
  const [open, setOpen] = useState(false)

  function linkClass(isActive: boolean) {
    if (isActive) {
      return 'text-accent-text'
    }
    return 'text-text-secondary transition-colors duration-200 hover:text-text-primary'
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-0/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-85"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent-muted font-display text-[11px] font-semibold tracking-wide text-accent-text">
            SB
          </span>
          <span className="font-display text-sm font-medium tracking-tight text-text-primary">
            Study Buddy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={({ isActive }) => `text-sm font-medium ${linkClass(isActive)}`}>
            Home
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `text-sm font-medium ${linkClass(isActive)}`}>
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-surface-0'
                  : 'border border-border bg-surface-2 text-text-primary hover:border-accent/40 hover:text-accent-text'
              }`
            }
          >
            Get started
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary md:hidden"
          aria-label="Menu"
        >
          {open ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface-1 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-accent-muted text-accent-text' : 'text-text-secondary'}`}>
              Home
            </NavLink>
            <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-accent-muted text-accent-text' : 'text-text-secondary'}`}>
              Log in
            </NavLink>
            <NavLink to="/signup" onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-accent-muted text-accent-text' : 'text-text-secondary'}`}>
              Get started
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}

export default MarketingHeader
