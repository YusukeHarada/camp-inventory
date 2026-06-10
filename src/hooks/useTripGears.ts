'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getTripGears,
  getTripGearsByUserId,
  addTripGear as addTripGearFS,
  updateTripGearChecked,
  updateTripGearConsumption,
  updateTripGearQuantity,
  deleteTripGear as deleteTripGearFS,
} from '@/lib/firestore/tripGears'
import { getGears, updateGear } from '@/lib/firestore/gears'
import { getTrip, updateTripStatus } from '@/lib/firestore/trips'
import { calcConsumedUnits } from '@/lib/utils/statistics'
import type { TripGear, Gear, ConsumptionLevel, TripStatus } from '@/types'

export function useTripGears(tripId: string) {
  const { user } = useAuth()
  const [tripGears, setTripGears] = useState<TripGear[]>([])
  const [allTripGears, setAllTripGears] = useState<TripGear[]>([])
  const [allGears, setAllGears] = useState<Gear[]>([])
  const [tripStatus, setTripStatus] = useState<TripStatus>('planned')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [tgs, gs, allTgs, trip] = await Promise.all([
        getTripGears(tripId, user.uid),
        getGears(user.uid),
        getTripGearsByUserId(user.uid),
        getTrip(tripId),
      ])
      setTripGears(tgs)
      setAllGears(gs)
      setAllTripGears(allTgs)
      setTripStatus(trip?.status ?? 'planned')
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

  const updateQuantity = useCallback(
    async (tripGearId: string, quantity: number, quantityUsed: number) => {
      setTripGears((prev) =>
        prev.map((tg) =>
          tg.id === tripGearId ? { ...tg, quantity, quantityUsed } : tg
        )
      )
      await updateTripGearQuantity(tripGearId, quantity, quantityUsed)
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

  // キャンプ終了: 消耗品の消費本数を在庫から差し引き、status を completed に更新
  const completeTrip = useCallback(async () => {
    if (!user) return
    const gearMap = new Map(allGears.map((g) => [g.id, g]))
    await Promise.all(
      tripGears.map(async (tg) => {
        const gear = gearMap.get(tg.gearId)
        if (!gear?.isConsumable || gear.stock === undefined) return
        const consumed = calcConsumedUnits(tg)
        if (consumed === 0) return
        const nextStock = Math.max(0, gear.stock - consumed)
        await updateGear(gear.id, { stock: nextStock })
      })
    )
    await updateTripStatus(tripId, 'completed')
    await load()
  }, [user, tripId, tripGears, allGears, load])

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
    tripStatus,
    loading,
    error,
    addTripGear,
    toggleCheck,
    updateConsumptionLevel,
    updateQuantity,
    removeTripGear,
    addRequiredGears,
    completeTrip,
    reload: load,
  }
}
