import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import RequestCard from '../components/RequestCard'
import { addNotification } from '../lib/notifications'
import supabase from '../lib/supabase'
import { getRequestsFeed, type RequestItem } from '../services/requestService'
import { addRequestApplicant } from '../services/requestInterestService'

function DiscoverPage() {
  const navigate = useNavigate()
  const [currentUserId, setCurrentUserId] = useState('')
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [countryFilter, setCountryFilter] = useState('All Countries')
  const [availabilityFilter, setAvailabilityFilter] = useState('Any Availability')
  const [sortBy, setSortBy] = useState<'newest' | 'role'>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [feedPage, setFeedPage] = useState(0)
  const [hasMoreFeed, setHasMoreFeed] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    async function loadData() {
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
      const { data, error } = await getRequestsFeed(0)

      if (error) {
        setErrorMessage(error.message || 'Failed to load discover feed.')
        setIsLoading(false)
        return
      }

      setRequests(data.filter((item) => item.sender_id !== user.id))
      setHasMoreFeed(data.length >= 20)
      setFeedPage(0)
      setIsLoading(false)
    }

    loadData()
  }, [navigate])

  const countryOptions = useMemo(() => {
    const options = requests
      .map((request) => request.senderProfile?.country || '')
      .filter((country) => country !== '')
    return [...new Set(options)]
  }, [requests])

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      const matchesRole =
        roleFilter === 'All Roles' || request.required_role === roleFilter
      const matchesCountry =
        countryFilter === 'All Countries' ||
        request.senderProfile?.country === countryFilter
      const matchesAvailability =
        availabilityFilter === 'Any Availability' ||
        (request.optional_availability || '')
          .toLowerCase()
          .includes(availabilityFilter.toLowerCase())
      const normalizedQuery = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery.trim() === '' ||
        (request.title || '').toLowerCase().includes(normalizedQuery) ||
        (request.description || '').toLowerCase().includes(normalizedQuery) ||
        (request.senderProfile?.name || '')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesRole && matchesCountry && matchesAvailability && matchesSearch
    })

    if (sortBy === 'role') {
      return [...filtered].sort((a, b) =>
        (a.required_role || '').localeCompare(b.required_role || ''),
      )
    }

    return filtered
  }, [
    availabilityFilter,
    countryFilter,
    requests,
    roleFilter,
    searchQuery,
    sortBy,
  ])

  async function handleLoadMoreFeed() {
    if (isLoadingMore || !hasMoreFeed) {
      return
    }

    setIsLoadingMore(true)
    const nextPage = feedPage + 1
    const { data, error } = await getRequestsFeed(nextPage)
    setIsLoadingMore(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setRequests((current) => [
      ...current,
      ...data.filter((item) => item.sender_id !== currentUserId),
    ])
    setFeedPage(nextPage)
    setHasMoreFeed(data.length >= 20)
  }

  function handleOpenChat(senderId: string, requestId: number) {
    addRequestApplicant(requestId, currentUserId)
    addNotification({
      title: 'Applied to request',
      body: 'Your response was sent to the request owner.',
      type: 'request',
      href: `/requests/${requestId}`,
    })
    navigate(`/messages?userId=${senderId}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
            Discover
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium text-text-primary">
            Find requests to join
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Browse open requests and respond directly from the feed.
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as 'newest' | 'role')}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-primary"
        >
          <option value="newest">Sort: Newest</option>
          <option value="role">Sort: Role</option>
        </select>
      </header>

      <div className="rounded-2xl border border-border bg-surface-1 p-1">
        <div className="relative p-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title, description, or user…"
            className="w-full rounded-xl border border-transparent bg-surface-2 px-4 py-3 text-sm text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-accent/35 focus:ring-2 focus:ring-accent/10"
          />
        </div>
      </div>

      <FilterBar
        roleValue={roleFilter}
        countryValue={countryFilter}
        availabilityValue={availabilityFilter}
        countryOptions={countryOptions}
        onRoleChange={setRoleFilter}
        onCountryChange={setCountryFilter}
        onAvailabilityChange={setAvailabilityFilter}
      />

      {errorMessage && (
        <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-surface-1 py-16 text-center text-sm text-text-secondary">
          Loading discover feed...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-1/50 py-16 text-center">
          <p className="font-display text-base font-medium text-text-primary">
            No matching requests
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Try broadening filters or check again later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={currentUserId}
              onOpenChat={handleOpenChat}
              onView={(requestId) => navigate(`/requests/${requestId}`)}
            />
          ))}
          {hasMoreFeed && (
            <button
              type="button"
              onClick={handleLoadMoreFeed}
              disabled={isLoadingMore}
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMore ? 'Loading more…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DiscoverPage
