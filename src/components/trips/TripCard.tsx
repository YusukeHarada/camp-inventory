'use client'

import Link from 'next/link'
import { MapPin, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { formatTripDate } from '@/lib/utils/date'
import type { CampTrip } from '@/types'

type Props = {
  trip: CampTrip
  onEdit: (trip: CampTrip) => void
  onDelete: (trip: CampTrip) => void
}

export function TripCard({ trip, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <Link href={`/trips/${trip.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-t-xl transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{trip.name}</p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {formatTripDate(trip.date)}
          </p>
          {trip.location && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={11} />
              <span className="truncate">{trip.location}</span>
            </div>
          )}
        </div>
        <ChevronRight size={18} className="text-slate-400 shrink-0" />
      </Link>
      <div className="flex border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => onEdit(trip)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors rounded-bl-xl"
        >
          <Pencil size={13} />
          編集
        </button>
        <button
          onClick={() => onDelete(trip)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors rounded-br-xl border-l border-slate-100 dark:border-slate-700"
        >
          <Trash2 size={13} />
          削除
        </button>
      </div>
    </div>
  )
}
