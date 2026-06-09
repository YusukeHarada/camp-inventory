'use client'

import { cn } from '@/lib/utils/cn'
import { GEAR_CATEGORY_KEYS, GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import type { GearCategory } from '@/types'

type Props = {
  selected: GearCategory | null
  onChange: (category: GearCategory | null) => void
}

export function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          selected === null
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
        )}
      >
        すべて
      </button>
      {GEAR_CATEGORY_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            selected === key
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
          )}
        >
          {GEAR_CATEGORY_LABELS[key]}
        </button>
      ))}
    </div>
  )
}
