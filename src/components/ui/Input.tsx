'use client'

import { cn } from '@/lib/utils/cn'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'rounded-lg border px-3 py-2 text-sm transition-colors',
          'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})
