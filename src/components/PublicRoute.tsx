import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import LoadingCard from './LoadingCard'

type PublicRouteProps = {
  children: ReactNode
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isLoading, user, hasProfile } = useAuthStatus()

  if (isLoading) {
    return <LoadingCard text="Loading page..." />
  }

  if (!user) {
    return <>{children}</>
  }

  if (hasProfile) {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/profile" replace />
}

export default PublicRoute
