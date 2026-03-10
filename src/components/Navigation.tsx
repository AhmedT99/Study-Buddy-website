import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import supabase from '../lib/supabase'

function Navigation() {
  const navigate = useNavigate()
  const { isLoading, user } = useAuthStatus()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    await supabase.auth.signOut()

    setIsLoggingOut(false)
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <Link
        to={user ? '/dashboard' : '/login'}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Study Buddy
      </Link>

      {!isLoading && user && (
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/dashboard"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Profile
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </nav>
      )}
    </div>
  )
}

export default Navigation
