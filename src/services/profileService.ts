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

export async function getProfileByUserId(userId: string) {
  return supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
}

export async function checkIfProfileExists(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  return {
    hasProfile: !!data,
    error,
  }
}
