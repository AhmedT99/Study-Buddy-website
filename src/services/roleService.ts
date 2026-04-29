import supabase from '../lib/supabase'

export async function checkIfUserIsAdmin(userId: string) {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single()

  if (!error) {
    return {
      isAdmin: !!data,
      error: null,
    }
  }

  if (error.code === 'PGRST116') {
    return {
      isAdmin: false,
      error: null,
    }
  }

  return {
    isAdmin: false,
    error: {
      message: error.message || 'Could not check admin role.',
    },
  }
}
