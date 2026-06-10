'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getGears,
  addGear as addGearFS,
  updateGear as updateGearFS,
  deleteGear as deleteGearFS,
} from '@/lib/firestore/gears'
import { deleteTripGearsByGearId } from '@/lib/firestore/tripGears'
import type { Gear } from '@/types'

export function useGears() {
  const { user } = useAuth()
  const [gears, setGears] = useState<Gear[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getGears(user.uid)
      setGears(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addGear = useCallback(
    async (data: Omit<Gear, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return
      await addGearFS(user.uid, data)
      await load()
    },
    [user, load]
  )

  const updateGear = useCallback(
    async (id: string, data: Partial<Omit<Gear, 'id' | 'userId' | 'createdAt'>>) => {
      await updateGearFS(id, data)
      await load()
    },
    [load]
  )

  const deleteGear = useCallback(
    async (id: string) => {
      if (!user) return
      await deleteGearFS(id)
      await deleteTripGearsByGearId(id, user.uid)
      await load()
    },
    [user, load]
  )

  return { gears, loading, addGear, updateGear, deleteGear, reload: load }
}
