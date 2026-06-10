'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getTrips,
  addTrip as addTripFS,
  updateTrip as updateTripFS,
  deleteTrip as deleteTripFS,
} from '@/lib/firestore/trips'
import { deleteTripGearsByTripId } from '@/lib/firestore/tripGears'
import type { CampTrip } from '@/types'

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<CampTrip[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getTrips(user.uid)
      setTrips(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addTrip = useCallback(
    async (data: Omit<CampTrip, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return
      await addTripFS(user.uid, data)
      await load()
    },
    [user, load]
  )

  const updateTrip = useCallback(
    async (id: string, data: Partial<Omit<CampTrip, 'id' | 'userId' | 'createdAt'>>) => {
      await updateTripFS(id, data)
      await load()
    },
    [load]
  )

  const deleteTrip = useCallback(
    async (id: string) => {
      if (!user) return
      await deleteTripFS(id)
      await deleteTripGearsByTripId(id, user.uid)
      await load()
    },
    [user, load]
  )

  return { trips, loading, addTrip, updateTrip, deleteTrip, reload: load }
}
