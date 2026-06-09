'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getGears } from '@/lib/firestore/gears'
import { getTrips } from '@/lib/firestore/trips'
import { getTripGearsByUserId } from '@/lib/firestore/tripGears'
import { calcGearUsageRanking, filterUnusedGears } from '@/lib/utils/statistics'
import type { Gear, CampTrip, TripGear } from '@/types'

export function useStatistics() {
  const { user } = useAuth()
  const [gears, setGears] = useState<Gear[]>([])
  const [trips, setTrips] = useState<CampTrip[]>([])
  const [tripGears, setTripGears] = useState<TripGear[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      getGears(user.uid),
      getTrips(user.uid),
      getTripGearsByUserId(user.uid),
    ])
      .then(([g, t, tg]) => {
        setGears(g)
        setTrips(t)
        setTripGears(tg)
      })
      .finally(() => setLoading(false))
  }, [user])

  const ranking = useMemo(() => calcGearUsageRanking(gears, tripGears), [gears, tripGears])
  const unusedGears = useMemo(() => filterUnusedGears(gears, tripGears), [gears, tripGears])

  return {
    gears,
    trips,
    tripGears,
    ranking,
    unusedGears,
    totalGears: gears.length,
    totalTrips: trips.length,
    loading,
  }
}
