import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import LoadingCard from './LoadingCard'

type PublicRouteProps = {
  children: ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isLoading, user, hasProfile, authError } = useAuthStatus()

  if (isLoading) {
    return <LoadingCard text="Loading page..." />
  }

  if (!user) {
    return <>{children}</>
  }

  if (authError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-danger/25 bg-danger/10 p-6 text-center">
        <p className="font-display text-base font-medium text-text-primary">
          Access check failed
        </p>
        <p className="mt-2 text-sm text-red-200">{authError}</p>
      </div>
    )
  }

  if (hasProfile) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/profile" replace />
}

export default PublicRoute
