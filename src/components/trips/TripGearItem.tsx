'use client'

import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import type { Gear, TripGear } from '@/types'

type Props = {
  tripGear: TripGear
  gear: Gear
  onToggle: (tripGearId: string, checked: boolean) => void
  onRemove: (tripGearId: string) => void
}

export function TripGearItem({ tripGear, gear, onToggle, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <input
        type="checkbox"
        checked={tripGear.checked}
        onChange={(e) => onToggle(tripGear.id, e.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            tripGear.checked
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {gear.name}
        </p>
        <div className="mt-0.5 flex gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {GEAR_CATEGORY_LABELS[gear.category]}
          </Badge>
          {gear.isRequired && <Badge variant="warning" className="text-xs">必須</Badge>}
        </div>
      </div>
      <button
        onClick={() => onRemove(tripGear.id)}
        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
        title="リストから削除"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
