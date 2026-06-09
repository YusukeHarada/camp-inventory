'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
      <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">CampGear</h1>
      <div className="flex items-center gap-3">
        {user?.photoURL && (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <button
          onClick={signOut}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          title="ログアウト"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
