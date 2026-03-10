import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      return
    }

    if (!data.user) {
      setErrorMessage('Login failed. Please try again.')
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
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-md sm:p-10">
        <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-blue-50">
          Welcome back
        </p>
        <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
          Study smarter with the right people.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
          Login to continue your journey, finish your profile, and connect with
          study partners who match your goals.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Better matching</p>
            <p className="mt-2 text-sm text-blue-50">
              Find students with similar study styles and goals.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">Simple workflow</p>
            <p className="mt-2 text-sm text-blue-50">
              Login, complete your profile, and go straight to the dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Login
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">
            Access your account
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email and password to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@email.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Do not have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
