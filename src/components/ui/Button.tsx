'use client'

import { cn } from '@/lib/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variant === 'primary' && 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600',
        variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
