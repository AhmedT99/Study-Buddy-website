import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import LoadingCard from './LoadingCard'

type LandingRouteProps = {
  children: ReactNode
}

function LandingRoute({ children }: LandingRouteProps) {
  const { isLoading, user } = useAuthStatus()

  if (isLoading) {
    return <LoadingCard text="Loading page..." />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default LandingRoute
