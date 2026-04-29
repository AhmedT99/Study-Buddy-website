import { useState } from 'react'
import type { RequestItem } from '../services/requestService'
import { updateRequestStatus } from '../services/requestService'
import { showToast } from './Toast'
import AppButton from './AppButton'

type RequestCardProps = {
  request: RequestItem
  currentUserId: string
  applicantCount?: number
  onOpenChat: (senderId: string, requestId: number) => void
  onView?: (requestId: number) => void
  onEdit?: (requestId: number) => void
  onDelete?: (requestId: number) => void
}

function RequestCard({
  request,
  currentUserId,
  applicantCount = 0,
  onOpenChat,
  onView,
  onEdit,
  onDelete,
}: RequestCardProps) {
  const isMyRequest = request.sender_id === currentUserId
  const [status, setStatus] = useState(request.status || 'open')
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggleStatus() {
    const newStatus = status === 'open' ? 'closed' : 'open'
    setIsUpdating(true)

    const { error } = await updateRequestStatus(request.id, newStatus)

    setIsUpdating(false)

    if (error) {
      showToast('Failed to update request status', 'error')
      return
    }

    setStatus(newStatus)
    showToast(
      newStatus === 'closed' ? 'Request marked as resolved' : 'Request reopened',
      'success',
    )
  }

  const isClosed = status === 'closed'

  return (
    <div className={`group rounded-2xl border bg-surface-1 p-5 transition-all duration-200 hover:border-border-hover hover:bg-surface-2 ${isClosed ? 'border-border opacity-60' : 'border-border'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {request.senderProfile?.profile_picture_url ? (
            <img
              src={request.senderProfile.profile_picture_url}
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted font-display text-xs font-semibold text-accent-text">
              SB
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-text-primary">
              {request.senderProfile?.name || 'Study Buddy User'}
            </p>
            <p className="text-xs text-text-tertiary">
              {request.senderProfile?.university || 'University not available'}
              {request.senderProfile?.major && ` · ${request.senderProfile.major}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            isClosed
              ? 'bg-surface-3 text-text-tertiary'
              : 'bg-accent-muted text-accent-text'
          }`}>
            {request.required_role || 'Any'}
          </span>
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-text-secondary">
            {request.optional_availability || 'Flexible'}
          </span>
          {isClosed && (
            <span className="rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-text-tertiary">
              Resolved
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className={`font-display text-base font-semibold ${isClosed ? 'text-text-secondary line-through decoration-text-tertiary/50' : 'text-text-primary'}`}>
          {request.title || 'Untitled request'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {request.description || 'No description available.'}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 text-xs text-text-tertiary">
          <span>{request.senderProfile?.country || 'Not available'}</span>
          <span className="capitalize">{status}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView?.(request.id)}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent/30 hover:text-accent-text"
          >
            View
          </button>
          {isMyRequest ? (
            <>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isUpdating}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 disabled:opacity-50 ${
                  isClosed
                    ? 'border-border bg-surface-2 text-text-secondary hover:border-accent/30 hover:text-accent-text'
                    : 'border-success/20 bg-success/10 text-emerald-300 hover:bg-success/20'
                }`}
              >
                {isUpdating ? 'Updating...' : isClosed ? 'Reopen' : 'Mark Resolved'}
              </button>
              <button
                type="button"
                onClick={() => onEdit?.(request.id)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-secondary transition-all duration-200 hover:border-accent/30 hover:text-accent-text"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(request.id)}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-all duration-200 hover:bg-red-500/20"
              >
                Delete
              </button>
            </>
          ) : !isClosed ? (
            <AppButton onClick={() => onOpenChat(request.sender_id, request.id)}>
              Respond
            </AppButton>
          ) : null}
        </div>
      </div>
      {isMyRequest && (
        <div className="mt-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs text-text-tertiary">
          Applicants: <span className="font-semibold text-text-primary">{applicantCount}</span>
        </div>
      )}
    </div>
  )
}

export default RequestCard
