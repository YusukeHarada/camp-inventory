'use client'

import { Trash2, Minus, Plus } from 'lucide-react'
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
  onUpdateQuantity?: (tripGearId: string, quantity: number, quantityUsed: number) => void
}

export function TripGearItem({
  tripGear,
  gear,
  onToggle,
  onRemove,
  onUpdateConsumption,
  onUpdateQuantity,
}: Props) {
  const quantity = tripGear.quantity ?? 1
  const quantityUsed = tripGear.quantityUsed ?? 0

  const handleQuantityChange = (delta: number) => {
    const next = Math.max(1, quantity + delta)
    const nextUsed = Math.min(quantityUsed, next)
    onUpdateQuantity?.(tripGear.id, next, nextUsed)
  }

  const handleQuantityUsedChange = (delta: number) => {
    const next = Math.max(0, Math.min(quantity, quantityUsed + delta))
    onUpdateQuantity?.(tripGear.id, quantity, next)
  }

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
            {quantity > 1 && (
              <Badge variant="secondary" className="text-xs">{quantity}本</Badge>
            )}
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

      {gear.isConsumable && onUpdateQuantity && (
        <div className="mt-2 pl-8 flex flex-col gap-2">
          {/* 持参数 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 w-14 shrink-0">持参数:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-400 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* 使い切り数 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 w-14 shrink-0">使切数:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuantityUsedChange(-1)}
                disabled={quantityUsed <= 0}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
                {quantityUsed}
              </span>
              <button
                onClick={() => handleQuantityUsedChange(1)}
                disabled={quantityUsed >= quantity}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* 残り1本の消費感（使い切り数 < 持参数の場合のみ表示） */}
          {quantityUsed < quantity && onUpdateConsumption && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-14 shrink-0">残りの消費:</span>
              <div className="flex gap-1">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
