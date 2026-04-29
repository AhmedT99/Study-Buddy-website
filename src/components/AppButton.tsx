import type { ReactNode } from 'react'

type AppButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
  kind?: 'primary' | 'secondary' | 'dark'
}

function AppButton({
  children,
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  kind = 'primary',
}: AppButtonProps) {
  const baseClassName =
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'

  const widthClassName = fullWidth ? ' w-full' : ''

  let colorClassName =
    ' bg-accent text-surface-0 hover:bg-accent-deep shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'

  if (kind === 'secondary') {
    colorClassName =
      ' border border-border bg-surface-2 text-text-primary hover:border-border-hover hover:bg-surface-3'
  }

  if (kind === 'dark') {
    colorClassName =
      ' border border-border bg-surface-1 text-text-secondary hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClassName + widthClassName + colorClassName}
    >
      {children}
    </button>
  )
}

export default AppButton
