import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStatus from '../hooks/useAuthStatus'
import LoadingCard from './LoadingCard'

type ProtectedProfileRouteProps = {
  children: ReactNode
}

function ProtectedProfileRoute({ children }: ProtectedProfileRouteProps) {
  const { isLoading, user } = useAuthStatus()

  if (isLoading) {
    return <LoadingCard text="Loading page..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedProfileRoute
