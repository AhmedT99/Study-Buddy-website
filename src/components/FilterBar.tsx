type FilterBarProps = {
  roleValue: string
  countryValue: string
  availabilityValue: string
  countryOptions: string[]
  onRoleChange: (value: string) => void
  onCountryChange: (value: string) => void
  onAvailabilityChange: (value: string) => void
}

const roleOptions = ['All Roles', 'Student', 'Professional', 'Any']
const availabilityOptions = [
  'Any Availability',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function FilterBar({
  roleValue,
  countryValue,
  availabilityValue,
  countryOptions,
  onRoleChange,
  onCountryChange,
  onAvailabilityChange,
}: FilterBarProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-display text-sm font-medium text-text-primary">
            Filters
          </h4>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Narrow the feed by role, country, or availability.
          </p>
        </div>
        <span className="rounded-md bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent-text">
          Live
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Role
          </label>
          <select
            value={roleValue}
            onChange={(event) => onRoleChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Country
          </label>
          <select
            value={countryValue}
            onChange={(event) => onCountryChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          >
            <option value="All Countries">All Countries</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Availability
          </label>
          <select
            value={availabilityValue}
            onChange={(event) => onAvailabilityChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-200 focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
