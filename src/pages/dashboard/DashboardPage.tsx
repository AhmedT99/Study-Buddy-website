import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { showToast } from '../../components/Toast'
import useNotifications from '../../hooks/useNotifications'
import supabase from '../../lib/supabase'
import {
  getConversationList,
  getMyMessageCount,
  type ConversationItem,
} from '../../services/messageService'
import { getProfileByUserId } from '../../services/profileService'
import { getProfileMeta } from '../../services/profileMetaService'
import {
  getMyRequests,
  getMyRequestCount,
  updateRequestStatus,
  type StudyRequestRow,
} from '../../services/requestService'

function DashboardPage() {
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [requestCount, setRequestCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [myRequests, setMyRequests] = useState<StudyRequestRow[]>([])
  const [conversationPreview, setConversationPreview] = useState<ConversationItem[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [completionPercent, setCompletionPercent] = useState(0)
  const { items: notifications, unreadCount } = useNotifications()

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data } = await getProfileByUserId(user.id)
      const { count: requestsTotal } = await getMyRequestCount(user.id)
      const { count: messagesTotal } = await getMyMessageCount(user.id)
      const { data: conversationData } = await getConversationList(user.id, 0, 3)

      setRequestCount(requestsTotal || 0)
      setMessageCount(messagesTotal || 0)
      setConversationPreview(conversationData || [])

      const { data: requestsData } = await getMyRequests(user.id, 0, 5)
      setMyRequests(requestsData)
      setIsLoadingRequests(false)

      if (!data) {
        return
      }

      const profileMeta = getProfileMeta(user.id)
      const completionFields = [
        data.name,
        data.university,
        data.major,
        data.bio,
        data.preferred_language,
        data.country,
        profileMeta.skills.join(','),
      ]
      const filledCount = completionFields.filter((field) => field?.trim()).length
      setCompletionPercent(Math.round((filledCount / completionFields.length) * 100))

      setName(data.name || '')
      setUniversity(data.university || '')
      setProfilePictureUrl(data.profile_picture_url || '')
    }

    loadProfile()
  }, [])

  async function handleToggleRequestStatus(requestId: number, currentStatus: string) {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open'

    const { error } = await updateRequestStatus(requestId, newStatus)

    if (error) {
      showToast('Failed to update request', 'error')
      return
    }

    setMyRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
    )
    showToast(newStatus === 'closed' ? 'Request resolved' : 'Request reopened', 'success')
  }

  const displayName = name || 'Study Buddy User'
  const displayUniversity = university || 'University not added yet'
  const openRequests = myRequests.filter((r) => r.status === 'open').length

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface-1 p-6">
        <p className="text-xs uppercase tracking-wider text-text-tertiary">Today</p>
        <h2 className="mt-2 font-display text-3xl font-medium text-text-primary">
          {name ? `Welcome back, ${name.split(' ')[0]}` : 'Welcome back'}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Start with one clear action: publish a request or respond to someone in Discover.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/requests" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-surface-0">
            Create request
          </Link>
          <Link to="/discover" className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text-primary">
            Discover feed
          </Link>
          <Link to="/messages" className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text-primary">
            Open inbox
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total requests" value={requestCount} />
        <MetricCard label="Open requests" value={openRequests} />
        <MetricCard label="Conversations" value={messageCount} />
        <MetricCard label="Unread alerts" value={unreadCount} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-1 p-5">
          <p className="text-xs uppercase tracking-wider text-text-tertiary">Profile health</p>
          <div className="mt-3 flex items-center gap-3">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent-text">
                SB
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-text-primary">{displayName}</p>
              <p className="text-xs text-text-tertiary">{displayUniversity}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-text-secondary">Completion {completionPercent}%</p>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${completionPercent}%` }} />
          </div>
          <Link to="/profile" className="mt-4 inline-block text-xs font-semibold text-accent-text hover:underline">
            Improve profile
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface-1 p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-base font-medium text-text-primary">Your active requests</h3>
              <p className="mt-1 text-xs text-text-tertiary">Quickly resolve or reopen requests.</p>
            </div>
            <Link to="/requests" className="text-xs font-semibold text-accent-text hover:underline">
              Manage all
            </Link>
          </div>
          <div className="mt-4">
            {isLoadingRequests ? (
              <div className="py-10 text-center text-sm text-text-secondary">Loading requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="text-sm text-text-secondary">No requests yet.</p>
                <Link to="/requests" className="mt-2 inline-block text-xs font-semibold text-accent-text hover:underline">
                  Create your first request
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface-0/50">
                {myRequests.map((request) => {
                  const isClosed = request.status === 'closed'
                  return (
                    <li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${isClosed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                          {request.title || 'Untitled'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-tertiary">
                          {request.required_role || 'Any'} · {isClosed ? 'Resolved' : 'Open'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleRequestStatus(request.id, request.status)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent/35 hover:text-accent-text"
                      >
                        {isClosed ? 'Reopen' : 'Resolve'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-1 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-medium text-text-primary">Recent activity</h3>
            <p className="mt-1 text-xs text-text-tertiary">Messages, responses, and system updates.</p>
          </div>
          <Link to="/notifications" className="text-xs font-semibold text-accent-text hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {notifications.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{item.body}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-secondary">
              No activity yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-1 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-medium text-text-primary">Message preview</h3>
            <p className="mt-1 text-xs text-text-tertiary">Jump back into recent conversations.</p>
          </div>
          <Link to="/messages" className="text-xs font-semibold text-accent-text hover:underline">
            Open inbox
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {conversationPreview.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-secondary">
              No conversations yet. Respond to a request to start.
            </p>
          ) : (
            conversationPreview.map((conversation) => (
              <Link
                key={conversation.userId}
                to={`/messages?userId=${conversation.userId}`}
                className="block rounded-xl border border-border bg-surface-2 px-3 py-2.5 transition-colors hover:border-accent/30"
              >
                <p className="text-sm font-semibold text-text-primary">
                  {conversation.profile?.name || 'Study Buddy'}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {conversation.lastMessage || 'No messages yet'}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 px-4 py-3">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium text-text-primary">{value}</p>
    </div>
  )
}

export default DashboardPage
