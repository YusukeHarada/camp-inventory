'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import type { Gear } from '@/types'

type Props = {
  gear: Gear
  usageCount?: number
  onEdit: (gear: Gear) => void
  onDelete: (gear: Gear) => void
}

export function GearCard({ gear, usageCount, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{gear.name}</p>
          {gear.isRequired && <Badge variant="warning">必須</Badge>}
          {gear.isConsumable && <Badge variant="primary">消耗品</Badge>}
          {gear.isConsumable && gear.stock !== undefined && (
            <Badge variant={gear.stock === 0 ? 'danger' : gear.stock <= 2 ? 'warning' : 'secondary'}>
              在庫 {gear.stock}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{GEAR_CATEGORY_LABELS[gear.category]}</Badge>
          {usageCount !== undefined && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{usageCount}回持参</span>
          )}
        </div>
        {gear.memo && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{gear.memo}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(gear)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          title="編集"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(gear)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
          title="削除"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
