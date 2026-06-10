'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getTripGears,
  getTripGearsByUserId,
  addTripGear as addTripGearFS,
  updateTripGearChecked,
  updateTripGearConsumption,
  deleteTripGear as deleteTripGearFS,
} from '@/lib/firestore/tripGears'
import { getGears } from '@/lib/firestore/gears'
import type { TripGear, Gear, ConsumptionLevel } from '@/types'

export function useTripGears(tripId: string) {
  const { user } = useAuth()
  const [tripGears, setTripGears] = useState<TripGear[]>([])
  const [allTripGears, setAllTripGears] = useState<TripGear[]>([])
  const [allGears, setAllGears] = useState<Gear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [tgs, gs, allTgs] = await Promise.all([
        getTripGears(tripId, user.uid),
        getGears(user.uid),
        getTripGearsByUserId(user.uid),
      ])
      setTripGears(tgs)
      setAllGears(gs)
      setAllTripGears(allTgs)
    } catch (e) {
      console.error('useTripGears load error:', e)
      setError(e instanceof Error ? e.message : 'データの読み込みに失敗しました')
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

  const updateConsumptionLevel = useCallback(
    async (tripGearId: string, level: ConsumptionLevel | null) => {
      setTripGears((prev) =>
        prev.map((tg) =>
          tg.id === tripGearId ? { ...tg, consumptionLevel: level ?? undefined } : tg
        )
      )
      await updateTripGearConsumption(tripGearId, level)
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
    allTripGears,
    allGears,
    unplannedGears,
    loading,
    error,
    addTripGear,
    toggleCheck,
    updateConsumptionLevel,
    removeTripGear,
    addRequiredGears,
    reload: load,
  }
}
