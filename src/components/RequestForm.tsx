import { type FormEvent, useState } from 'react'
import AppButton from './AppButton'

type RequestFormValues = {
  title: string
  description: string
  required_role: string
  optional_availability: string
}

type RequestFormProps = {
  isLoading: boolean
  successMessage: string
  errorMessage: string
  onSubmitRequest: (values: RequestFormValues) => Promise<boolean>
}

const roleOptions = ['Student', 'Professional', 'Any']
const dayOptions = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function RequestForm({
  isLoading,
  successMessage,
  errorMessage,
  onSubmitRequest,
}: RequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requiredRole, setRequiredRole] = useState('Student')
  const [selectedDay, setSelectedDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const inputClassName =
    'w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-tertiary focus:border-accent/40 focus:ring-1 focus:ring-accent/20'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    let optionalAvailability = ''

    if (selectedDay && startTime && endTime) {
      optionalAvailability = `${selectedDay} ${startTime} - ${endTime}`
    } else if (selectedDay) {
      optionalAvailability = selectedDay
    }

    const isSuccess = await onSubmitRequest({
      title,
      description,
      required_role: requiredRole,
      optional_availability: optionalAvailability,
    })

    if (!isSuccess) {
      return
    }

    setTitle('')
    setDescription('')
    setRequiredRole('Student')
    setSelectedDay('')
    setStartTime('')
    setEndTime('')
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5">
      <div className="mb-5">
        <span className="inline-flex items-center rounded-md bg-accent-muted px-2 py-0.5 font-display text-xs font-medium text-accent-text">
          New Request
        </span>
        <h3 className="mt-3 font-display text-lg font-semibold text-text-primary">
          Post a new request
        </h3>
        <p className="mt-1.5 text-sm text-text-secondary">
          Publish a request so the right student or professional can find you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Title
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Need help with my exam revision"
            className={inputClassName}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Explain what you need, your goals, and the kind of help you want."
            className={inputClassName}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Required Role
          </label>
          <select
            value={requiredRole}
            onChange={(event) => setRequiredRole(event.target.value)}
            className={inputClassName}
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Day
            </label>
            <select
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
              className={inputClassName}
            >
              <option value="">Flexible</option>
              {dayOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        {successMessage && (
          <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2.5 text-sm text-emerald-300">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <AppButton type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Publishing request...' : 'Publish Request'}
        </AppButton>
      </form>
    </div>
  )
}

export default RequestForm
