'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { GearUsage } from '@/lib/utils/statistics'

type Props = {
  data: GearUsage[]
  limit?: number
}

export function UsageRankingChart({ data, limit = 10 }: Props) {
  const chartData = data
    .filter((d) => d.usageCount > 0)
    .slice(0, limit)
    .map(({ gear, usageCount }) => ({
      name: gear.name.length > 12 ? gear.name.slice(0, 12) + '…' : gear.name,
      count: usageCount,
    }))

  if (chartData.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        持参記録がまだありません
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 200)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value) => [`${value}回`, '持参回数']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((_, idx) => (
            <Cell key={idx} fill={idx === 0 ? '#059669' : idx === 1 ? '#10b981' : '#34d399'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
