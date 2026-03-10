type LoadingCardProps = {
  text: string
}

function LoadingCard({ text }: LoadingCardProps) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100" />
      <p className="text-base font-medium text-slate-700">{text}</p>
      <p className="mt-2 text-sm text-slate-500">
        Please wait while we prepare your page.
      </p>
    </div>
  )
}

export default LoadingCard
