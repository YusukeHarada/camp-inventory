import type { Gear, TripGear, ConsumptionLevel } from '@/types'

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

const CONSUMPTION_SCORE: Record<ConsumptionLevel, number> = {
  little: 1,
  half: 2,
  most: 3,
  all: 4,
}

export function calcConsumptionSuggestion(
  gearId: string,
  allTripGears: TripGear[]
): string | null {
  const levels = allTripGears
    .filter((tg) => tg.gearId === gearId && tg.consumptionLevel !== undefined)
    .map((tg) => tg.consumptionLevel!)

  if (levels.length === 0) return null

  const avg = levels.reduce((sum, l) => sum + CONSUMPTION_SCORE[l], 0) / levels.length

  if (avg >= 3) return '多めに持参推奨'
  if (avg >= 2) return '通常量でOK'
  return '少量で十分'
}
