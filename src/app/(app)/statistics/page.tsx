'use client'

import { useStatistics } from '@/hooks/useStatistics'
import { UsageRankingChart } from '@/components/statistics/UsageRankingChart'
import { UnusedGearList } from '@/components/statistics/UnusedGearList'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { Backpack, Tent, TrendingUp } from 'lucide-react'

export default function StatisticsPage() {
  const { ranking, unusedGears, totalGears, totalTrips, loading } = useStatistics()

  if (loading) return <PageLoading />

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">統計</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Backpack size={16} />
            <span className="text-sm">総ギア数</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{totalGears}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Tent size={16} />
            <span className="text-sm">キャンプ回数</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{totalTrips}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">持参回数ランキング</h3>
        </div>
        <UsageRankingChart data={ranking} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          未使用ギア{' '}
          <span className="text-sm font-normal text-slate-500">({unusedGears.length}点)</span>
        </h3>
        <UnusedGearList gears={unusedGears} />
      </section>
    </div>
  )
}
