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

function normalizeStudyRequestRow(request: Record<string, unknown>): StudyRequestRow {
  return {
    id: Number(request.id) || 0,
    sender_id: String(request.sender_id ?? ''),
    receiver_id: String(request.receiver_id ?? ''),
    status: String(request.status ?? ''),
    title: String(request.title ?? ''),
    description: String(request.description ?? ''),
    required_role: String(request.required_role ?? ''),
    optional_availability: String(request.optional_availability ?? ''),
  }
}

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
    const normalized = normalizeStudyRequestRow(request as Record<string, unknown>)
    return {
      ...normalized,
      senderProfile: profileMap.get(normalized.sender_id) || null,
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

  return {
    data: (data || []).map((request) =>
      normalizeStudyRequestRow(request as Record<string, unknown>),
    ),
    error,
  }
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

  const normalized = normalizeStudyRequestRow(data as Record<string, unknown>)

  return {
    data: {
      ...normalized,
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
