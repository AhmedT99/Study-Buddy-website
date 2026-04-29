import supabase from '../lib/supabase'

export type ProfileData = {
  id?: string
  user_id: string
  name: string
  university: string
  education_level: string
  study_level: string
  major: string
  field_of_study: string
  preferred_study_style: string
  preferred_language: string
  timezone: string
  country: string
  gender: string
  bio: string
  profile_picture_url: string
}

export type SimpleProfileData = {
  user_id: string
  name: string
  university: string
  major: string
  country: string
  profile_picture_url: string
}

type ProfileQueryResult = {
  data: ProfileData | null
  error: { message: string } | null
  isMissing: boolean
  hasDuplicates: boolean
}

function getProfileQueryState(error: { code?: string; details?: string; message?: string } | null) {
  if (!error) {
    return {
      isMissing: false,
      hasDuplicates: false,
    }
  }

  if (error.code !== 'PGRST116') {
    return {
      isMissing: false,
      hasDuplicates: false,
    }
  }

  const errorText = `${error.details || ''} ${error.message || ''}`.toLowerCase()

  if (errorText.includes('0 rows')) {
    return {
      isMissing: true,
      hasDuplicates: false,
    }
  }

  return {
    isMissing: false,
    hasDuplicates: true,
  }
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!error) {
    return {
      data,
      error: null,
      isMissing: false,
      hasDuplicates: false,
    } satisfies ProfileQueryResult
  }

  const { isMissing, hasDuplicates } = getProfileQueryState(error)

  if (isMissing) {
    return {
      data: null,
      error: null,
      isMissing: true,
      hasDuplicates: false,
    } satisfies ProfileQueryResult
  }

  if (hasDuplicates) {
    return {
      data: null,
      error: {
        message: 'Multiple profile rows were found for this account. Please fix the duplicate profile data.',
      },
      isMissing: false,
      hasDuplicates: true,
    } satisfies ProfileQueryResult
  }

  return {
    data: null,
    error: {
      message: error.message || 'Could not load profile data.',
    },
    isMissing: false,
    hasDuplicates: false,
  } satisfies ProfileQueryResult
}

export async function getProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return {
      data: [] as SimpleProfileData[],
      error: null,
    }
  }

  return supabase
    .from('profiles')
    .select('user_id, name, university, major, country, profile_picture_url')
    .in('user_id', userIds)
}

export async function checkIfProfileExists(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!error) {
    return {
      hasProfile: !!data,
      error: null,
    }
  }

  const { isMissing, hasDuplicates } = getProfileQueryState(error)

  if (isMissing) {
    return {
      hasProfile: false,
      error: null,
    }
  }

  if (hasDuplicates) {
    return {
      hasProfile: true,
      error: null,
    }
  }

  return {
    hasProfile: false,
    error: {
      message: error.message || 'Could not check profile status.',
    },
  }
}
