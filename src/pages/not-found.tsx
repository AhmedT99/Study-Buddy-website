import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
        404
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">
        Page not found
      </h2>
      <p className="mt-3 text-sm text-text-secondary">
        This link is invalid or no longer available.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/"
          className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30"
        >
          Go home
        </Link>
        <Link
          to="/dashboard"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-surface-0 transition-colors hover:bg-accent-deep"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
