import supabase from '../lib/supabase'
import {
  getProfilesByUserIds,
  type SimpleProfileData,
} from './profileService'

export type StudyRequestRow = {
  id: number
  sender_id: string
  receiver_id: string
  status: string
  title: string
  description: string
  required_role: string
  optional_availability: string
}

export type RequestItem = StudyRequestRow & {
  senderProfile: SimpleProfileData | null
}

export type CreateRequestData = {
  sender_id: string
  receiver_id: string
  status: string
  title: string
  description: string
  required_role: string
  optional_availability: string
}

const DEFAULT_REQUEST_PAGE_SIZE = 20

export async function getRequestsFeed(page = 0, pageSize = DEFAULT_REQUEST_PAGE_SIZE) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data: requests, error } = await supabase
    .from('study_requests')
    .select('*')
    .range(from, to)
    .order('id', { ascending: false })

  if (error || !requests) {
    return {
      data: [] as RequestItem[],
      error,
    }
  }

  const senderIds = [...new Set(requests.map((request) => request.sender_id))]
  const { data: profiles } = await getProfilesByUserIds(senderIds)

  const profileMap = new Map<string, SimpleProfileData>()

  if (profiles) {
    profiles.forEach((profile) => {
      profileMap.set(profile.user_id, profile)
    })
  }

  const requestItems = requests.map((request) => {
    return {
      ...request,
      sender_id: String(request.sender_id || ''),
      receiver_id: String(request.receiver_id || ''),
      title: String(request.title || ''),
      description: String(request.description || ''),
      required_role: String(request.required_role || ''),
      optional_availability: String(request.optional_availability || ''),
      status: String(request.status || ''),
      senderProfile: profileMap.get(request.sender_id) || null,
    }
  })

  return {
    data: requestItems,
    error: null,
  }
}

export async function createRequest(requestData: CreateRequestData) {
  return supabase.from('study_requests').insert(requestData).select().single()
}

export async function getMyRequests(
  userId: string,
  page = 0,
  pageSize = DEFAULT_REQUEST_PAGE_SIZE,
) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, error } = await supabase
    .from('study_requests')
    .select('*')
    .eq('sender_id', userId)
    .range(from, to)
    .order('id', { ascending: false })

  return { data: data || [], error }
}

export async function updateRequestStatus(requestId: number, status: string) {
  return supabase
    .from('study_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()
}

export async function getRequestById(requestId: number) {
  const { data, error } = await supabase
    .from('study_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error || !data) {
    return {
      data: null as RequestItem | null,
      error,
    }
  }

  const { data: profiles } = await getProfilesByUserIds([String(data.sender_id || '')])

  return {
    data: {
      ...data,
      sender_id: String(data.sender_id || ''),
      receiver_id: String(data.receiver_id || ''),
      title: String(data.title || ''),
      description: String(data.description || ''),
      required_role: String(data.required_role || ''),
      optional_availability: String(data.optional_availability || ''),
      status: String(data.status || ''),
      senderProfile: profiles?.[0] || null,
    } satisfies RequestItem,
    error: null,
  }
}

export async function updateRequest(
  requestId: number,
  input: {
    title: string
    description: string
    required_role: string
    optional_availability: string
  },
) {
  return supabase
    .from('study_requests')
    .update(input)
    .eq('id', requestId)
    .select()
    .single()
}

export async function deleteRequest(requestId: number) {
  return supabase.from('study_requests').delete().eq('id', requestId)
}

export async function getMyRequestCount(userId: string) {
  return supabase
    .from('study_requests')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', userId)
}
