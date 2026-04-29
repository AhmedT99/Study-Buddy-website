import { Link } from 'react-router-dom'

function VerifyEmailPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
        Verify email
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">
        Check your inbox
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        We sent a verification link to your email. Open it to activate your account, then sign in.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/login"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-surface-0 transition-colors hover:bg-accent-deep"
        >
          Go to login
        </Link>
        <Link
          to="/signup"
          className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30"
        >
          Use another email
        </Link>
      </div>
    </div>
  )
}

export default VerifyEmailPage
