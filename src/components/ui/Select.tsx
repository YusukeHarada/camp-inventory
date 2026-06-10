'use client'

import { cn } from '@/lib/utils/cn'
import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

type Option = {
  value: string
  label: string
}

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, options, placeholder, className, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'rounded-lg border px-3 py-2 text-sm transition-colors',
          'border-slate-300 bg-white text-slate-900',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})
