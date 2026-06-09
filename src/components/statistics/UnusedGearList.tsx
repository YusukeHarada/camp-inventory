import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import type { Gear } from '@/types'

type Props = {
  gears: Gear[]
}

export function UnusedGearList({ gears }: Props) {
  if (gears.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        全てのギアを少なくとも1回持参しています
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {gears.map((gear) => (
        <li
          key={gear.id}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {gear.name}
            </p>
          </div>
          <Badge variant="secondary">{GEAR_CATEGORY_LABELS[gear.category]}</Badge>
        </li>
      ))}
    </ul>
  )
}
