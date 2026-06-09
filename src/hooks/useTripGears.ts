'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getTripGears,
  addTripGear as addTripGearFS,
  updateTripGearChecked,
  deleteTripGear as deleteTripGearFS,
} from '@/lib/firestore/tripGears'
import { getGears } from '@/lib/firestore/gears'
import type { TripGear, Gear } from '@/types'

export function useTripGears(tripId: string) {
  const { user } = useAuth()
  const [tripGears, setTripGears] = useState<TripGear[]>([])
  const [allGears, setAllGears] = useState<Gear[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [tgs, gs] = await Promise.all([getTripGears(tripId), getGears(user.uid)])
      setTripGears(tgs)
      setAllGears(gs)
    } finally {
      setLoading(false)
    }
  }, [tripId, user])

  useEffect(() => {
    load()
  }, [load])

  const addTripGear = useCallback(
    async (gearId: string) => {
      if (!user) return
      await addTripGearFS(user.uid, tripId, gearId)
      await load()
    },
    [user, tripId, load]
  )

  const toggleCheck = useCallback(
    async (tripGearId: string, checked: boolean) => {
      setTripGears((prev) =>
        prev.map((tg) => (tg.id === tripGearId ? { ...tg, checked } : tg))
      )
      await updateTripGearChecked(tripGearId, checked)
    },
    []
  )

  const removeTripGear = useCallback(
    async (tripGearId: string) => {
      await deleteTripGearFS(tripGearId)
      await load()
    },
    [load]
  )

  const addRequiredGears = useCallback(async () => {
    if (!user) return
    const requiredGears = allGears.filter((g) => g.isRequired)
    await Promise.all(requiredGears.map((g) => addTripGearFS(user.uid, tripId, g.id)))
    await load()
  }, [user, tripId, allGears, load])

  const plannedGearIds = new Set(tripGears.map((tg) => tg.gearId))
  const unplannedGears = allGears.filter((g) => !plannedGearIds.has(g.id))

  return {
    tripGears,
    allGears,
    unplannedGears,
    loading,
    addTripGear,
    toggleCheck,
    removeTripGear,
    addRequiredGears,
    reload: load,
  }
}
