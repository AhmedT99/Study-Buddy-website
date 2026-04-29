import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import supabase from '../lib/supabase'
import { checkIfProfileExists } from '../services/profileService'
import { checkIfUserIsAdmin } from '../services/roleService'

function useAuthStatus() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAuthStatus() {
      if (!isMounted) {
        return
      }

      setIsLoading(true)
      setAuthError('')

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (!isMounted) {
        return
      }

      if (userError) {
        setUser(null)
        setHasProfile(false)
        setIsAdmin(false)
        setAuthError(userError.message || 'Could not verify your authentication status.')
        setIsLoading(false)
        return
      }

      if (!currentUser) {
        setUser(null)
        setHasProfile(false)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      setUser(currentUser)
      const [profileResult, adminResult] = await Promise.all([
        checkIfProfileExists(currentUser.id),
        checkIfUserIsAdmin(currentUser.id),
      ])

      if (!isMounted) {
        return
      }

      if (profileResult.error || adminResult.error) {
        setAuthError(
          profileResult.error?.message ||
            adminResult.error?.message ||
            'Could not verify account access.',
        )
      }

      setHasProfile(profileResult.hasProfile)
      setIsAdmin(adminResult.isAdmin)
      setIsLoading(false)
    }

    loadAuthStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAuthStatus()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    isLoading,
    user,
    hasProfile,
    isAdmin,
    authError,
  }
}

export default useAuthStatus
