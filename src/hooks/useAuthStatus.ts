import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import supabase from '../lib/supabase'
import { checkIfProfileExists } from '../services/profileService'

function useAuthStatus() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    async function loadAuthStatus() {
      setIsLoading(true)

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        setUser(null)
        setHasProfile(false)
        setIsLoading(false)
        return
      }

      setUser(currentUser)

      const { hasProfile: profileExists } = await checkIfProfileExists(
        currentUser.id,
      )

      setHasProfile(profileExists)
      setIsLoading(false)
    }

    loadAuthStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAuthStatus()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    isLoading,
    user,
    hasProfile,
  }
}

export default useAuthStatus
