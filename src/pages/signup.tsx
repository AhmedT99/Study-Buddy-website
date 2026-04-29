import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../lib/supabase'

function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      showToast(error.message, 'error')
      return
    }

    if (!data.session) {
      showToast('Account created. Verify your email before signing in.', 'success')
      navigate('/verify-email')
      return
    }

    showToast('Account created! Complete your profile.', 'success')
    navigate('/profile')
  }

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2">
      <div className="relative order-2 flex flex-col justify-center px-4 py-12 sm:px-8 lg:order-1 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text lg:hidden">
            Join
          </p>
          <h3 className="mt-3 font-display text-2xl font-medium text-text-primary">Create account</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Email and password — then we will guide you through your profile.
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium text-text-secondary">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.edu"
                className="w-full rounded-xl border border-border bg-surface-1 px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/15"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium text-text-secondary">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
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
              {isLoading ? 'Creating...' : 'Continue to profile'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent-text underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative order-1 hidden flex-col justify-between overflow-hidden border-b border-border bg-surface-1 px-10 py-12 lg:order-2 lg:flex lg:border-b-0 lg:border-l">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(195deg,transparent_0%,rgba(45,212,191,0.06)_50%,transparent_100%)]" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-accent/10 blur-[90px]" />
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.22em] text-accent-text">
            New member
          </p>
          <h2 className="mt-6 max-w-md font-display text-3xl font-medium leading-tight tracking-tight text-text-primary">
            Three steps. One calm onboarding path.
          </h2>
        </div>
        <ol className="relative max-w-sm space-y-5">
          {['Create your credentials', 'Tell us how you study', 'Open requests & messages'].map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 font-display text-xs font-semibold text-accent-text">
                {i + 1}
              </span>
              <span className="pt-1 text-sm text-text-secondary">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default SignupPage
