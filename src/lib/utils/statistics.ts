import type { Gear, TripGear } from '@/types'

export type GearUsage = {
  gear: Gear
  usageCount: number
}

export function calcGearUsageRanking(gears: Gear[], tripGears: TripGear[]): GearUsage[] {
  const countMap = new Map<string, number>()
  for (const tg of tripGears) {
    countMap.set(tg.gearId, (countMap.get(tg.gearId) ?? 0) + 1)
  }
  return gears
    .map((gear) => ({ gear, usageCount: countMap.get(gear.id) ?? 0 }))
    .sort((a, b) => b.usageCount - a.usageCount)
}

export function filterUnusedGears(gears: Gear[], tripGears: TripGear[]): Gear[] {
  const usedGearIds = new Set(tripGears.map((tg) => tg.gearId))
  return gears.filter((g) => !usedGearIds.has(g.id))
}

export function calcUsageByCategory(
  gears: Gear[],
  tripGears: TripGear[]
): Record<string, number> {
  const result: Record<string, number> = {}
  const ranking = calcGearUsageRanking(gears, tripGears)
  for (const { gear, usageCount } of ranking) {
    if (usageCount > 0) {
      result[gear.category] = (result[gear.category] ?? 0) + usageCount
    }
  }
  return result
}

export function calcTotalUsage(tripGears: TripGear[]): number {
  return tripGears.length
}
