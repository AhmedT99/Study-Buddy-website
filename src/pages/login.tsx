import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../lib/supabase'
import { checkIfProfileExists } from '../services/profileService'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      showToast(error.message, 'error')
      return
    }

    if (!data.user) {
      setErrorMessage('Login failed. Please try again.')
      showToast('Login failed. Please try again.', 'error')
      return
    }

    const { hasProfile, error: profileError } = await checkIfProfileExists(
      data.user.id,
    )

    if (profileError) {
      setErrorMessage(profileError.message)
      return
    }

    if (hasProfile) {
      navigate('/dashboard')
      return
    }

    navigate('/profile')
  }

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-1 px-10 py-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(45,212,191,0.07)_0%,transparent_45%,rgba(255,255,255,0.02)_100%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.22em] text-accent-text">
            Welcome back
          </p>
          <h2 className="mt-6 max-w-md font-display text-3xl font-medium leading-tight tracking-tight text-text-primary">
            A workspace built for focused study collaboration.
          </h2>
        </div>
        <ul className="relative max-w-sm space-y-4 text-sm text-text-secondary">
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            Requests, messages, and profile in one rail.
          </li>
          <li className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
            Jump back into threads without losing context.
          </li>
        </ul>
      </div>

      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text lg:hidden">
            Welcome back
          </p>
          <h3 className="mt-3 font-display text-2xl font-medium text-text-primary">Sign in</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Use your email and password to open your workspace.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-text-secondary">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-text-secondary">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
                required
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-accent py-3 font-display text-sm font-semibold text-surface-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-accent-text underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
