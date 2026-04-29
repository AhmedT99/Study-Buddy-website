import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppButton from '../components/AppButton'
import { showToast } from '../components/Toast'
import { addNotification } from '../lib/notifications'
import supabase from '../lib/supabase'
import { timeAgo } from '../lib/timeAgo'
import {
  getConversationList,
  getMessagesWithUser,
  sendMessage,
  subscribeToUserMessages,
  type ConversationItem,
  type MessageRow,
} from '../services/messageService'
import { getProfilesByUserIds, type SimpleProfileData } from '../services/profileService'

function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedUserId = searchParams.get('userId') || ''
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [currentUserId, setCurrentUserId] = useState('')
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SimpleProfileData | null>(
    null,
  )
  const [messageList, setMessageList] = useState<MessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState(false)
  const [conversationPage, setConversationPage] = useState(0)
  const [hasMoreConversations, setHasMoreConversations] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadMessagesPage() {
      setIsLoading(true)
      setErrorMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setCurrentUserId(user.id)

      const { data, error } = await getConversationList(user.id)

      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
        return
      }

      setConversationList(data)
      setConversationPage(0)
      setHasMoreConversations(data.length >= 30)
      setIsLoading(false)
    }

    loadMessagesPage()
  }, [navigate])

  useEffect(() => {
    async function loadSelectedChat() {
      if (!currentUserId || !selectedUserId) {
        setMessageList([])
        setSelectedProfile(null)
        return
      }

      const { data, error } = await getMessagesWithUser(currentUserId, selectedUserId)

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setMessageList(data || [])

      const currentConversation = conversationList.find(
        (conversation) => conversation.userId === selectedUserId,
      )

      if (currentConversation?.profile) {
        setSelectedProfile(currentConversation.profile)
        return
      }

      const { data: profiles } = await getProfilesByUserIds([selectedUserId])
      setSelectedProfile(profiles?.[0] || null)
    }

    loadSelectedChat()
  }, [conversationList, currentUserId, selectedUserId])

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    const unsubscribe = subscribeToUserMessages(
      currentUserId,
      async (incomingMessage) => {
        const involvesCurrentUser =
          incomingMessage.sender_id === currentUserId ||
          incomingMessage.receiver_id === currentUserId

        if (!involvesCurrentUser) {
          return
        }

        const partnerId =
          incomingMessage.sender_id === currentUserId
            ? incomingMessage.receiver_id
            : incomingMessage.sender_id

        const isActiveThread =
          !!selectedUserId &&
          ((incomingMessage.sender_id === currentUserId &&
            incomingMessage.receiver_id === selectedUserId) ||
            (incomingMessage.sender_id === selectedUserId &&
              incomingMessage.receiver_id === currentUserId))

        if (isActiveThread) {
          setMessageList((currentList) => {
            if (currentList.some((message) => message.id === incomingMessage.id)) {
              return currentList
            }

            return [...currentList, incomingMessage]
          })
        }

        let needsProfileFetch = false

        setConversationList((currentList) => {
          const existingConversation = currentList.find(
            (conversation) => conversation.userId === partnerId,
          )

          needsProfileFetch = !existingConversation?.profile

          const updatedConversation: ConversationItem = {
            userId: partnerId,
            lastMessage: incomingMessage.content || '',
            lastMessageTime: incomingMessage.created_at || '',
            profile: existingConversation?.profile || null,
          }

          const nextList = currentList.filter(
            (conversation) => conversation.userId !== partnerId,
          )

          return [updatedConversation, ...nextList]
        })

        if (needsProfileFetch) {
          const { data: profiles } = await getProfilesByUserIds([partnerId])
          const partnerProfile = profiles?.[0] || null

          if (!partnerProfile) {
            return
          }

          setConversationList((currentList) =>
            currentList.map((conversation) =>
              conversation.userId === partnerId
                ? {
                    ...conversation,
                    profile: partnerProfile,
                  }
                : conversation,
            ),
          )
        }

        if (incomingMessage.sender_id !== currentUserId) {
          addNotification({
            title: 'New message',
            body: incomingMessage.content.slice(0, 90) || 'You received a new message.',
            type: 'message',
            href: `/messages?userId=${partnerId}`,
          })
        }
      },
    )

    return () => {
      unsubscribe()
    }
  }, [currentUserId, selectedUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageList])

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newMessage.trim() || !selectedUserId) {
      return
    }

    setErrorMessage('')
    setIsSending(true)

    const { data, error } = await sendMessage(
      currentUserId,
      selectedUserId,
      newMessage.trim(),
    )

    setIsSending(false)

    if (error) {
      setErrorMessage(error.message)
      showToast('Failed to send message', 'error')
      return
    }

    if (data) {
      setMessageList((currentList) => {
        if (currentList.some((message) => message.id === data.id)) {
          return currentList
        }

        return [...currentList, data]
      })
      setNewMessage('')
    }
  }

  function handleOpenConversation(userId: string) {
    setSearchParams({ userId })
  }

  async function handleLoadMoreConversations() {
    if (!currentUserId || isLoadingMoreConversations || !hasMoreConversations) {
      return
    }

    setIsLoadingMoreConversations(true)
    const nextPage = conversationPage + 1
    const { data, error } = await getConversationList(currentUserId, nextPage)
    setIsLoadingMoreConversations(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setConversationList((current) => {
      const seen = new Set(current.map((item) => item.userId))
      const nextItems = data.filter((item) => !seen.has(item.userId))
      return [...current, ...nextItems]
    })
    setConversationPage(nextPage)
    setHasMoreConversations(data.length >= 30)
  }

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
        Inbox on the left, thread on the right. Same data as before — only the frame changed.
      </p>

      <div className="flex min-h-[min(520px,calc(100dvh-11rem))] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 lg:h-[calc(100dvh-10rem)] lg:min-h-[480px] lg:flex-row">
        <aside className="flex max-h-[42vh] w-full shrink-0 flex-col border-b border-border lg:max-h-none lg:w-[min(100%,17.5rem)] lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-display text-sm font-medium text-text-primary">Inbox</h3>
            <p className="text-[11px] text-text-tertiary">
              {conversationList.length} thread{conversationList.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex flex-col items-center py-12">
                <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <p className="mt-2 text-xs text-text-tertiary">Loading…</p>
              </div>
            ) : conversationList.length === 0 ? (
              <div className="m-2 rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-text-secondary">No threads yet.</p>
                <p className="mt-1 text-xs text-text-tertiary">Offer help on a request to start.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {conversationList.map((conversation) => (
                  <button
                    key={conversation.userId}
                    type="button"
                    onClick={() => handleOpenConversation(conversation.userId)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                      selectedUserId === conversation.userId
                        ? 'bg-accent-muted shadow-[inset_0_0_0_1px_rgba(45,212,191,0.2)]'
                        : 'hover:bg-surface-2'
                    }`}
                  >
                    {conversation.profile?.profile_picture_url ? (
                      <img
                        src={conversation.profile.profile_picture_url}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-muted font-display text-[10px] font-semibold text-accent-text">
                        SB
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-text-primary">
                          {conversation.profile?.name || 'Study Buddy'}
                        </span>
                        {conversation.lastMessageTime && (
                          <span className="shrink-0 text-[10px] text-text-tertiary">
                            {timeAgo(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-text-tertiary">
                        {conversation.lastMessage || 'No messages'}
                      </p>
                    </div>
                  </button>
                ))}
                {hasMoreConversations && (
                  <button
                    type="button"
                    onClick={handleLoadMoreConversations}
                    disabled={isLoadingMoreConversations}
                    className="mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMoreConversations ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {selectedUserId ? (
            <>
              <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedProfile?.profile_picture_url ? (
                    <img
                      src={selectedProfile.profile_picture_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-muted font-display text-xs font-semibold text-accent-text">
                      SB
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-medium text-text-primary">
                      {selectedProfile?.name || 'Study Buddy User'}
                    </h3>
                    <p className="truncate text-xs text-text-tertiary">
                      {selectedProfile?.university || '—'}
                      {selectedProfile?.major ? ` · ${selectedProfile.major}` : ''}
                    </p>
                  </div>
                </div>
                <span className="rounded-lg bg-success/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  Active
                </span>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                {messageList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-12 text-center">
                    <p className="text-sm text-text-secondary">Say hello to open the thread.</p>
                  </div>
                ) : (
                  <>
                    {messageList.map((message) => {
                      const isMyMessage = message.sender_id === currentUserId
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[min(100%,28rem)] rounded-2xl px-3.5 py-2.5 text-sm ${
                              isMyMessage
                                ? 'bg-accent text-surface-0'
                                : 'border border-border bg-surface-2 text-text-primary'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`mt-1.5 text-[10px] ${
                                isMyMessage ? 'text-surface-0/55' : 'text-text-tertiary'
                              }`}
                            >
                              {timeAgo(message.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="shrink-0 border-t border-border bg-surface-0/40 p-4 backdrop-blur-sm sm:px-5"
              >
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  rows={3}
                  placeholder="Message…"
                  className="w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-accent/45 focus:ring-2 focus:ring-accent/10"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                />
                {errorMessage && (
                  <p className="mt-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-red-200">
                    {errorMessage}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[10px] text-text-tertiary">Enter send · Shift+Enter newline</p>
                  <AppButton type="submit" disabled={isSending}>
                    {isSending ? 'Sending…' : 'Send'}
                  </AppButton>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-2">
                <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-display text-base font-medium text-text-primary">Select a thread</p>
              <p className="mt-2 max-w-xs text-sm text-text-secondary">
                Choose someone from the inbox or deep-link from a request card.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default MessagesPage
