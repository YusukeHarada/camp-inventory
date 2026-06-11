'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Settings = {
  showGearImages: boolean
}

type SettingsContextValue = Settings & {
  setShowGearImages: (value: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const STORAGE_KEY = 'campgear_settings'

function loadSettings(): Settings {
  if (typeof window === 'undefined') return { showGearImages: false }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { showGearImages: false, ...JSON.parse(stored) }
  } catch {}
  return { showGearImages: false }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [showGearImages, setShowGearImagesState] = useState(false)

  useEffect(() => {
    setShowGearImagesState(loadSettings().showGearImages)
  }, [])

  const setShowGearImages = (value: boolean) => {
    setShowGearImagesState(value)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ showGearImages: value }))
    } catch {}
  }

  return (
    <SettingsContext.Provider value={{ showGearImages, setShowGearImages }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
