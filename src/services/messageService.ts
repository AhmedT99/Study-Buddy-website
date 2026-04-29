import supabase from '../lib/supabase'
import {
  getProfilesByUserIds,
  type SimpleProfileData,
} from './profileService'

export type MessageRow = {
  id: number
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}

export type ConversationItem = {
  userId: string
  lastMessage: string
  lastMessageTime: string
  profile: SimpleProfileData | null
}

const DEFAULT_CONVERSATION_PAGE_SIZE = 30

export async function getConversationList(
  userId: string,
  page = 0,
  pageSize = DEFAULT_CONVERSATION_PAGE_SIZE,
) {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error || !messages) {
    return {
      data: [] as ConversationItem[],
      error,
    }
  }

  const partnerIds: string[] = []
  const conversationMap = new Map<string, MessageRow>()

  messages.forEach((message) => {
    const partnerId =
      message.sender_id === userId ? message.receiver_id : message.sender_id

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, message)
      partnerIds.push(partnerId)
    }
  })

  const { data: profiles } = await getProfilesByUserIds(partnerIds)
  const profileMap = new Map<string, SimpleProfileData>()

  if (profiles) {
    profiles.forEach((profile) => {
      profileMap.set(profile.user_id, profile)
    })
  }

  const conversationList = partnerIds.map((partnerId) => {
    const lastMessage = conversationMap.get(partnerId)

    return {
      userId: partnerId,
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.created_at || '',
      profile: profileMap.get(partnerId) || null,
    }
  })

  return {
    data: conversationList,
    error: null,
  }
}

export async function getMessagesWithUser(userId: string, partnerId: string) {
  return supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`,
    )
    .order('created_at', { ascending: true })
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
) {
  return supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    })
    .select()
    .single()
}

export async function getMyMessageCount(userId: string) {
  return supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
}

export function subscribeToUserMessages(
  userId: string,
  onMessageInserted: (message: MessageRow) => void,
) {
  const channel = supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`,
      },
      (payload) => {
        onMessageInserted(payload.new as MessageRow)
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        onMessageInserted(payload.new as MessageRow)
      },
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
