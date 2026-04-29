import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequestCard from '../components/RequestCard'
import RequestForm from '../components/RequestForm'
import { showToast } from '../components/Toast'
import { addNotification } from '../lib/notifications'
import supabase from '../lib/supabase'
import { getProfileByUserId, type ProfileData } from '../services/profileService'
import {
  createRequest,
  deleteRequest,
  getMyRequests,
  type RequestItem,
} from '../services/requestService'
import { getRequestApplicantIds } from '../services/requestInterestService'

function RequestsPage() {
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null)
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadRequestsPage() {
      try {
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

        const { data: profileData, error: profileError } = await getProfileByUserId(
          user.id,
        )

        if (profileError) {
          setErrorMessage(profileError.message)
        }

        if (profileData) {
          setCurrentProfile(profileData)
        }

        const { data, error } = await getMyRequests(user.id, 0, 100)

        if (error) {
          setErrorMessage(error.message)
          setIsLoading(false)
          return
        }

        setRequests(
          data.map((request) => ({
            ...request,
            senderProfile: profileData
              ? {
                  user_id: profileData.user_id,
                  name: profileData.name,
                  university: profileData.university,
                  major: profileData.major,
                  country: profileData.country,
                  profile_picture_url: profileData.profile_picture_url,
                }
              : null,
          })),
        )
        setIsLoading(false)
      } catch {
        setErrorMessage('Could not load requests page.')
        setIsLoading(false)
      }
    }

    loadRequestsPage()
  }, [navigate])

  const filteredMyRequests = useMemo(() => {
    return requests.filter((request) => {
      if (!request) {
        return false
      }

      const matchesSearch =
        searchQuery.trim() === '' ||
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [requests, searchQuery])

  async function handleCreateRequest(values: {
    title: string
    description: string
    required_role: string
    optional_availability: string
  }) {
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const { data, error } = await createRequest({
      sender_id: currentUserId,
      receiver_id: currentUserId,
      status: 'open',
      title: values.title,
      description: values.description,
      required_role: values.required_role,
      optional_availability: values.optional_availability,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      showToast('Failed to publish request', 'error')
      return false
    }

    if (data) {
      const newRequest: RequestItem = {
        ...data,
        senderProfile: currentProfile
          ? {
              user_id: currentProfile.user_id,
              name: currentProfile.name,
              university: currentProfile.university,
              major: currentProfile.major,
              country: currentProfile.country,
              profile_picture_url: currentProfile.profile_picture_url,
            }
          : null,
      }

      setRequests((currentRequests) => [newRequest, ...currentRequests])
    }

    setSuccessMessage('Your request has been published successfully.')
    showToast('Request published successfully', 'success')
    addNotification({
      title: 'Request published',
      body: values.title,
      type: 'request',
      href: '/requests',
    })
    return true
  }

  function handleOpenChat(senderId: string, requestId: number) {
    navigate(`/messages?userId=${senderId}`)
    addNotification({
      title: 'Response sent',
      body: 'You reached out to help on a request.',
      type: 'request',
      href: `/requests/${requestId}`,
    })
  }

  async function handleDeleteRequest(requestId: number) {
    const confirmed = window.confirm('Delete this request? This action cannot be undone.')
    if (!confirmed || isDeleting) {
      return
    }

    setIsDeleting(true)
    const { error } = await deleteRequest(requestId)
    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setRequests((current) => current.filter((request) => request.id !== requestId))
    showToast('Request deleted', 'success')
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">Request workspace</p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Publish and manage your requests. Browse community opportunities from the Discover page.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <RequestForm
              isLoading={isSubmitting}
              successMessage={successMessage}
              errorMessage={errorMessage}
              onSubmitRequest={handleCreateRequest}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-7">
          {errorMessage && (
            <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface-1 p-1">
            <div className="relative p-3">
              <svg
                className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title or description…"
                className="w-full rounded-xl border border-transparent bg-surface-2 py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-accent/35 focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="font-display text-sm font-medium text-text-primary">Your requests</h3>
              <p className="text-xs text-text-tertiary">
                {filteredMyRequests.length} item{filteredMyRequests.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:border-accent/30 hover:text-accent-text"
            >
              Open discover
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-1 py-20">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <p className="mt-3 text-sm text-text-secondary">Loading your requests…</p>
            </div>
          ) : filteredMyRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-1/50 py-16 text-center">
              <p className="font-display text-base font-medium text-text-primary">No requests yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
                Publish your first request to start receiving responses.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMyRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  currentUserId={currentUserId}
                  applicantCount={getRequestApplicantIds(request.id).length}
                  onOpenChat={handleOpenChat}
                  onView={(requestId) => navigate(`/requests/${requestId}`)}
                  onEdit={(requestId) => navigate(`/requests/${requestId}?mode=edit`)}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestsPage
