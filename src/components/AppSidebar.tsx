import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import useNotifications from '../hooks/useNotifications'
import supabase from '../lib/supabase'

type AppSidebarProps = {
  mobileOpen: boolean
  onCloseMobile: () => void
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-accent-muted text-accent-text shadow-[inset_0_0_0_1px_rgba(45,212,191,0.2)]'
      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
  }`

function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuthStatus()
  const { unreadCount } = useNotifications()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    setIsLoggingOut(false)
    onCloseMobile()
    navigate('/login')
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-surface-0/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-w)] flex-col border-r border-border bg-surface-1 transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent-muted font-display text-[11px] font-semibold text-accent-text">
            SB
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-medium text-text-primary">Study Buddy</p>
            <p className="truncate text-[10px] text-text-tertiary">Workspace</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <NavLink to="/dashboard" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Overview
          </NavLink>
          <NavLink to="/requests" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Create request
          </NavLink>
          <NavLink to="/discover" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 21l4-7 4 7m4-11A9 9 0 1112 3a9 9 0 018 7z" />
            </svg>
            Discover
          </NavLink>
          <NavLink to="/messages" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
          </NavLink>
          <NavLink to="/notifications" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
            </svg>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-surface-0">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/profile" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NavLink>
          <NavLink to="/settings" onClick={onCloseMobile} className={navItemClass}>
            <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.36.997 1.724 1.724 0 001.684 1.246 1.724 1.724 0 011.213 2.944 1.724 1.724 0 000 2.438 1.724 1.724 0 01-1.213 2.944 1.724 1.724 0 00-1.684 1.246 1.724 1.724 0 01-2.36.997 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.36-.997 1.724 1.724 0 00-1.684-1.246 1.724 1.724 0 01-1.213-2.944 1.724 1.724 0 000-2.438 1.724 1.724 0 011.213-2.944 1.724 1.724 0 001.684-1.246 1.724 1.724 0 012.36-.997 1.724 1.724 0 002.573-1.066z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={onCloseMobile} className={navItemClass}>
              <svg className="h-[18px] w-[18px] shrink-0 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text-tertiary transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
