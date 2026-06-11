'use client'

import { useState } from 'react'
import { LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { Modal } from '@/components/ui/Modal'

export function Header() {
  const { user, signOut } = useAuth()
  const { showGearImages, setShowGearImages } = useSettings()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">CampGear</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="設定"
          >
            <Settings size={18} />
          </button>
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

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="設定">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">ギア画像を表示</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ギア一覧に画像URLのサムネイルを表示します
              </p>
            </div>
            <button
              role="switch"
              aria-checked={showGearImages}
              onClick={() => setShowGearImages(!showGearImages)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                showGearImages ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  showGearImages ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
