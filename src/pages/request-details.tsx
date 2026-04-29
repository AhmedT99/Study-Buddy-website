import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppButton from '../components/AppButton'
import { showToast } from '../components/Toast'
import { addNotification } from '../lib/notifications'
import supabase from '../lib/supabase'
import { getProfilesByUserIds } from '../services/profileService'
import {
  deleteRequest,
  getRequestById,
  updateRequest,
  type RequestItem,
} from '../services/requestService'
import {
  addRequestApplicant,
  getRequestApplicantIds,
} from '../services/requestInterestService'

function RequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams()
  const [searchParams] = useSearchParams()
  const startsInEdit = searchParams.get('mode') === 'edit'
  const numericRequestId = Number(requestId)

  const [currentUserId, setCurrentUserId] = useState('')
  const [request, setRequest] = useState<RequestItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isEditing, setIsEditing] = useState(startsInEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [applicantProfiles, setApplicantProfiles] = useState<
    Array<{ user_id: string; name: string }>
  >([])

  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    required_role: '',
    optional_availability: '',
  })

  useEffect(() => {
    async function loadPage() {
      if (!Number.isFinite(numericRequestId) || numericRequestId <= 0) {
        navigate('/requests')
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setCurrentUserId(user.id)
      const { data, error } = await getRequestById(numericRequestId)

      if (error || !data) {
        setErrorMessage(error?.message || 'Request was not found.')
        setIsLoading(false)
        return
      }

      setRequest(data)
      setFormValues({
        title: data.title,
        description: data.description,
        required_role: data.required_role,
        optional_availability: data.optional_availability,
      })

      const applicantIds = getRequestApplicantIds(data.id)
      if (applicantIds.length > 0) {
        const { data: profiles } = await getProfilesByUserIds(applicantIds)
        setApplicantProfiles(
          (profiles || []).map((profile) => ({
            user_id: profile.user_id,
            name: profile.name || 'Study Buddy User',
          })),
        )
      }

      setIsLoading(false)
    }

    loadPage()
  }, [navigate, numericRequestId])

  const isOwner = useMemo(
    () => request?.sender_id === currentUserId,
    [currentUserId, request?.sender_id],
  )

  async function handleSaveEdits() {
    if (!request) {
      return
    }
    setIsSaving(true)
    const { data, error } = await updateRequest(request.id, formValues)
    setIsSaving(false)

    if (error || !data) {
      setErrorMessage(error?.message || 'Failed to update request.')
      return
    }

    setRequest((current) =>
      current
        ? {
            ...current,
            ...formValues,
          }
        : current,
    )
    setIsEditing(false)
    showToast('Request updated', 'success')
  }

  async function handleDelete() {
    if (!request || !window.confirm('Delete this request permanently?')) {
      return
    }

    setIsDeleting(true)
    const { error } = await deleteRequest(request.id)
    setIsDeleting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    showToast('Request deleted', 'success')
    navigate('/requests')
  }

  function handleRespond() {
    if (!request) {
      return
    }
    addRequestApplicant(request.id, currentUserId)
    addNotification({
      title: 'Response sent',
      body: `You responded to "${request.title}".`,
      type: 'request',
      href: `/messages?userId=${request.sender_id}`,
    })
    navigate(`/messages?userId=${request.sender_id}`)
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface-1 py-16 text-center text-sm text-text-secondary">
        Loading request details...
      </div>
    )
  }

  if (!request) {
    return (
      <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-red-200">
        {errorMessage || 'Request could not be loaded.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-border bg-surface-1 p-5">
        <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
          Request details
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-text-primary">
          {request.title}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {request.senderProfile?.name || 'Study Buddy User'} ·{' '}
          {request.senderProfile?.university || 'University not listed'}
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface-1 p-5">
        {isEditing && isOwner ? (
          <div className="space-y-3">
            <input
              value={formValues.title}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary"
            />
            <textarea
              value={formValues.description}
              rows={5}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={formValues.required_role}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    required_role: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary"
              />
              <input
                value={formValues.optional_availability}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    optional_availability: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary"
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-text-secondary">
              {request.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-accent-muted px-2 py-1 text-accent-text">
                {request.required_role || 'Any'}
              </span>
              <span className="rounded-md bg-surface-2 px-2 py-1 text-text-secondary">
                {request.optional_availability || 'Flexible'}
              </span>
              <span className="rounded-md bg-surface-2 px-2 py-1 text-text-secondary">
                Status: {request.status}
              </span>
            </div>
          </>
        )}
      </section>

      {isOwner ? (
        <section className="rounded-2xl border border-border bg-surface-1 p-5">
          <h3 className="font-display text-base font-semibold text-text-primary">Applicants</h3>
          {applicantProfiles.length === 0 ? (
            <p className="mt-2 text-sm text-text-secondary">
              No applicants yet. Once users respond, they appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {applicantProfiles.map((profile) => (
                <li
                  key={profile.user_id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2"
                >
                  <span className="text-sm text-text-primary">{profile.name}</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/messages?userId=${profile.user_id}`)}
                    className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface-0"
                  >
                    Message
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <AppButton kind="secondary" onClick={() => navigate(-1)}>
          Back
        </AppButton>
        {isOwner ? (
          <>
            {isEditing ? (
              <AppButton onClick={handleSaveEdits} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </AppButton>
            ) : (
              <AppButton kind="secondary" onClick={() => setIsEditing(true)}>
                Edit request
              </AppButton>
            )}
            <AppButton kind="dark" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete request'}
            </AppButton>
          </>
        ) : (
          <AppButton onClick={handleRespond}>Respond to request</AppButton>
        )}
      </div>
    </div>
  )
}

export default RequestDetailsPage
