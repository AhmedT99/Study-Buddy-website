import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import LoadingCard from './LoadingCard'

type ProtectedDashboardRouteProps = {
  children: ReactNode
}

function ProtectedDashboardRoute({
  children,
}: ProtectedDashboardRouteProps) {
  const { isLoading, user, hasProfile } = useAuthStatus()

  if (isLoading) {
    return <LoadingCard text="Loading page..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasProfile) {
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}

export default ProtectedDashboardRoute
