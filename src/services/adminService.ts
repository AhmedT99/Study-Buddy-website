import supabase from '../lib/supabase'

export type AdminProfileItem = {
  id: string
  user_id: string
  name: string
  university: string
  major: string
  country: string
}

export type AdminRequestItem = {
  id: number
  sender_id: string
  receiver_id: string
  title: string
  status: string
  required_role: string
}

export type AdminMessageItem = {
  id: number
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

const DEFAULT_ADMIN_PAGE_SIZE = 20

function withSecureDeleteError(error: { message?: string } | null) {
  if (!error) {
    return { error: null }
  }

  return {
    error: {
      message:
        error.message ||
        'Admin delete action failed. Ensure secure RPC functions are deployed.',
    },
  }
}

export async function getAdminProfiles(page = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE) {
  const from = page * pageSize
  const to = from + pageSize - 1

  return supabase
    .from('profiles')
    .select('id, user_id, name, university, major, country')
    .range(from, to)
    .order('id', { ascending: false })
}

export async function deleteAdminProfile(profileId: string) {
  const { error } = await supabase.rpc('admin_delete_profile', {
    target_profile_id: profileId,
  })
  return withSecureDeleteError(error)
}

export async function getAdminRequests(page = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE) {
  const from = page * pageSize
  const to = from + pageSize - 1

  return supabase
    .from('study_requests')
    .select('id, sender_id, receiver_id, title, status, required_role')
    .range(from, to)
    .order('id', { ascending: false })
}

export async function deleteAdminRequest(requestId: number) {
  const { error } = await supabase.rpc('admin_delete_request', {
    target_request_id: requestId,
  })
  return withSecureDeleteError(error)
}

export async function getAdminMessages(page = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE) {
  const from = page * pageSize
  const to = from + pageSize - 1

  return supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at')
    .range(from, to)
    .order('created_at', { ascending: false })
}

export async function deleteAdminMessage(messageId: number) {
  const { error } = await supabase.rpc('admin_delete_message', {
    target_message_id: messageId,
  })
  return withSecureDeleteError(error)
}
