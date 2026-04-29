import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

type ToastMessage = {
  id: number
  text: string
  type: ToastType
}

let toastId = 0
let addToastCallback: ((text: string, type: ToastType) => void) | null = null

export function showToast(text: string, type: ToastType = 'info') {
  if (addToastCallback) {
    addToastCallback(text, type)
  }
}

function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    addToastCallback = (text: string, type: ToastType) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, text, type }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }

    return () => {
      addToastCallback = null
    }
  }, [])

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'border-success/20 bg-surface-1 text-emerald-300'
              : toast.type === 'error'
                ? 'border-danger/20 bg-surface-1 text-red-300'
                : 'border-border bg-surface-1 text-text-primary'
          }`}
        >
          {toast.type === 'success' && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm">{toast.text}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-2 shrink-0 text-text-tertiary transition-colors hover:text-text-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
