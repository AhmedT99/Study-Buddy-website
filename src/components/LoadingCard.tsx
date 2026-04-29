type LoadingCardProps = {
  text: string
}

function LoadingCard({ text }: LoadingCardProps) {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-surface-1 p-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted">
        <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      </div>
      <p className="font-display text-sm font-medium text-text-primary">{text}</p>
      <p className="mt-2 text-xs text-text-tertiary">
        Please wait while we prepare your page.
      </p>
    </div>
  )
}

export default LoadingCard
