'use client'

import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import { cn } from '@/lib/utils/cn'
import type { Gear, TripGear, ConsumptionLevel } from '@/types'

const CONSUMPTION_LEVELS: { value: ConsumptionLevel; label: string }[] = [
  { value: 'little', label: '少し' },
  { value: 'half', label: '半分' },
  { value: 'most', label: 'ほぼ' },
  { value: 'all', label: '使切' },
]

type Props = {
  tripGear: TripGear
  gear: Gear
  onToggle: (tripGearId: string, checked: boolean) => void
  onRemove: (tripGearId: string) => void
  onUpdateConsumption?: (tripGearId: string, level: ConsumptionLevel | null) => void
}

export function TripGearItem({ tripGear, gear, onToggle, onRemove, onUpdateConsumption }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
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
      {gear.isConsumable && onUpdateConsumption && (
        <div className="mt-2 flex items-center gap-1.5 pl-8">
          <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">使用量:</span>
          {CONSUMPTION_LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                onUpdateConsumption(
                  tripGear.id,
                  tripGear.consumptionLevel === value ? null : value
                )
              }
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
                tripGear.consumptionLevel === value
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 text-slate-500 hover:border-emerald-400 dark:border-slate-600 dark:text-slate-400'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
