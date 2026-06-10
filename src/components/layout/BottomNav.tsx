'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Backpack, Tent, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/gears', label: 'ギア', icon: Backpack },
  { href: '/trips', label: 'キャンプ', icon: Tent },
  { href: '/statistics', label: '統計', icon: BarChart2 },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex h-16 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
              active
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
