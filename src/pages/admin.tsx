import { useCallback, useEffect, useState } from 'react'
import AppButton from '../components/AppButton'
import {
  deleteAdminMessage,
  deleteAdminProfile,
  deleteAdminRequest,
  getAdminMessages,
  getAdminProfiles,
  getAdminRequests,
  type AdminMessageItem,
  type AdminProfileItem,
  type AdminRequestItem,
} from '../services/adminService'

function AdminPage() {
  const pageSize = 20
  const [profileList, setProfileList] = useState<AdminProfileItem[]>([])
  const [requestList, setRequestList] = useState<AdminRequestItem[]>([])
  const [messageList, setMessageList] = useState<AdminMessageItem[]>([])
  const [profilePage, setProfilePage] = useState(0)
  const [requestPage, setRequestPage] = useState(0)
  const [messagePage, setMessagePage] = useState(0)
  const [hasMoreProfiles, setHasMoreProfiles] = useState(false)
  const [hasMoreRequests, setHasMoreRequests] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadAdminData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    const [profilesResult, requestsResult, messagesResult] = await Promise.all([
      getAdminProfiles(profilePage, pageSize),
      getAdminRequests(requestPage, pageSize),
      getAdminMessages(messagePage, pageSize),
    ])

    if (profilesResult.error || requestsResult.error || messagesResult.error) {
      setErrorMessage(
        profilesResult.error?.message ||
          requestsResult.error?.message ||
          messagesResult.error?.message ||
          'Could not load admin dashboard.',
      )
      setIsLoading(false)
      return
    }

    setProfileList(profilesResult.data || [])
    setRequestList(requestsResult.data || [])
    setMessageList(messagesResult.data || [])
    setHasMoreProfiles((profilesResult.data || []).length >= pageSize)
    setHasMoreRequests((requestsResult.data || []).length >= pageSize)
    setHasMoreMessages((messagesResult.data || []).length >= pageSize)
    setIsLoading(false)
  }, [messagePage, pageSize, profilePage, requestPage])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdminData()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadAdminData])

  async function handleDeleteProfile(profileId: string) {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this profile row?',
    )

    if (!shouldDelete) {
      return
    }

    const { error } = await deleteAdminProfile(profileId)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setProfileList((currentList) =>
      currentList.filter((profile) => profile.id !== profileId),
    )
  }

  async function handleDeleteRequest(requestId: number) {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this request?',
    )

    if (!shouldDelete) {
      return
    }

    const { error } = await deleteAdminRequest(requestId)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setRequestList((currentList) =>
      currentList.filter((request) => request.id !== requestId),
    )
  }

  async function handleDeleteMessage(messageId: number) {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this message?',
    )

    if (!shouldDelete) {
      return
    }

    const { error } = await deleteAdminMessage(messageId)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessageList((currentList) =>
      currentList.filter((message) => message.id !== messageId),
    )
  }

  function getShortText(text: string, maxLength: number) {
    if (text.length <= maxLength) {
      return text
    }

    return `${text.slice(0, maxLength)}...`
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">Admin</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-text-primary">Operations</h2>
          <p className="mt-2 max-w-xl text-sm text-text-secondary">
            Moderate profiles, requests, and messages. Same actions as before — structured as dense review panels.
          </p>
        </div>
        <AppButton kind="secondary" onClick={loadAdminData}>
          {isLoading ? 'Loading…' : 'Refresh data'}
        </AppButton>
      </header>

      {errorMessage && (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface-1 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Profiles</p>
          <p className="mt-1 font-display text-3xl font-medium text-text-primary">{profileList.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-1 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Requests</p>
          <p className="mt-1 font-display text-3xl font-medium text-text-primary">{requestList.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-1 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Messages</p>
          <p className="mt-1 font-display text-3xl font-medium text-text-primary">{messageList.length}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-1">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-medium text-text-primary">Profiles</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">Row actions on the right.</p>
          <p className="mt-1 text-[11px] text-text-tertiary">Page {profilePage + 1}</p>
        </div>
        <div className="overflow-x-auto">
          {profileList.length === 0 ? (
            <p className="px-5 py-8 text-sm text-text-secondary">No profiles.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-surface-0/50 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">School · major · country</th>
                  <th className="px-5 py-2.5 font-medium">User id</th>
                  <th className="w-36 px-5 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profileList.map((profile) => (
                  <tr key={profile.id} className="hover:bg-surface-2/40">
                    <td className="px-5 py-3 font-medium text-text-primary">{profile.name || '—'}</td>
                    <td className="max-w-xs px-5 py-3 text-sm text-text-secondary">
                      <span className="line-clamp-2">
                        {profile.university || '—'} · {profile.major || '—'}
                      </span>
                      <span className="mt-0.5 block text-xs text-text-tertiary">
                        {profile.country || '—'}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3 font-mono text-xs text-text-tertiary">
                      {profile.user_id}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AppButton kind="dark" onClick={() => handleDeleteProfile(profile.id)}>
                        Delete
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <AppButton kind="secondary" onClick={() => setProfilePage((current) => Math.max(0, current - 1))} disabled={profilePage === 0 || isLoading}>
          Previous
        </AppButton>
        <AppButton kind="secondary" onClick={() => setProfilePage((current) => current + 1)} disabled={!hasMoreProfiles || isLoading}>
          Next
        </AppButton>
      </div>

      <div className="rounded-2xl border border-border bg-surface-1">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-medium text-text-primary">Requests</h3>
          <p className="mt-1 text-[11px] text-text-tertiary">Page {requestPage + 1}</p>
        </div>
        <div className="overflow-x-auto">
          {requestList.length === 0 ? (
            <p className="px-5 py-8 text-sm text-text-secondary">No requests.</p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-surface-0/50 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Title</th>
                  <th className="px-5 py-2.5 font-medium">Status / role</th>
                  <th className="px-5 py-2.5 font-medium">IDs</th>
                  <th className="w-36 px-5 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requestList.map((request) => (
                  <tr key={request.id} className="hover:bg-surface-2/40">
                    <td className="max-w-xs px-5 py-3 font-medium text-text-primary">
                      {request.title || 'Untitled'}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {request.status || 'open'} · {request.required_role || 'Any'}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-text-tertiary">
                      <div className="max-w-[200px] truncate">{request.sender_id}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AppButton kind="dark" onClick={() => handleDeleteRequest(request.id)}>
                        Delete
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <AppButton kind="secondary" onClick={() => setRequestPage((current) => Math.max(0, current - 1))} disabled={requestPage === 0 || isLoading}>
          Previous
        </AppButton>
        <AppButton kind="secondary" onClick={() => setRequestPage((current) => current + 1)} disabled={!hasMoreRequests || isLoading}>
          Next
        </AppButton>
      </div>

      <div className="rounded-2xl border border-border bg-surface-1">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-medium text-text-primary">Messages</h3>
          <p className="mt-1 text-[11px] text-text-tertiary">Page {messagePage + 1}</p>
        </div>
        <div className="overflow-x-auto">
          {messageList.length === 0 ? (
            <p className="px-5 py-8 text-sm text-text-secondary">No messages.</p>
          ) : (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-border bg-surface-0/50 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Preview</th>
                  <th className="px-5 py-2.5 font-medium">Route</th>
                  <th className="px-5 py-2.5 font-medium">Time</th>
                  <th className="w-36 px-5 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messageList.map((message) => (
                  <tr key={message.id} className="hover:bg-surface-2/40">
                    <td className="max-w-md px-5 py-3 text-text-primary">
                      {getShortText(message.content || '—', 100)}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-text-tertiary">
                      {message.sender_id?.slice(0, 8)}… → {message.receiver_id?.slice(0, 8)}…
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-text-secondary">
                      {message.created_at}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <AppButton kind="dark" onClick={() => handleDeleteMessage(message.id)}>
                        Delete
                      </AppButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <AppButton kind="secondary" onClick={() => setMessagePage((current) => Math.max(0, current - 1))} disabled={messagePage === 0 || isLoading}>
          Previous
        </AppButton>
        <AppButton kind="secondary" onClick={() => setMessagePage((current) => current + 1)} disabled={!hasMoreMessages || isLoading}>
          Next
        </AppButton>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h3 className="font-display text-sm font-medium text-amber-200/90">Secure admin actions</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
          Destructive actions must run server-side. This page now calls protected RPC functions that should validate admin role before deleting records.
        </p>
        <p className="mt-3 text-sm text-text-tertiary">
          Required RPCs: <code>admin_delete_profile</code>, <code>admin_delete_request</code>, and <code>admin_delete_message</code>.
        </p>
      </div>
    </div>
  )
}

export default AdminPage
