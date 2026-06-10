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

// 1回のキャンプで実際に開封した本数（使い切り数 + 残りがあれば+1）
export function calcConsumedUnits(tg: TripGear): number {
  const quantityUsed = tg.quantityUsed ?? 0
  const hasPartial = quantityUsed < (tg.quantity ?? 1) && tg.consumptionLevel !== undefined
  return quantityUsed + (hasPartial ? 1 : 0)
}

// 1回のキャンプでの消費量を 0〜1 の比率で算出（使い切り数 + 残りの消費感を合算）
function calcConsumptionRatio(tg: TripGear): number | null {
  const quantity = tg.quantity ?? 1
  const quantityUsed = tg.quantityUsed ?? 0
  const remainderScore = tg.consumptionLevel !== undefined
    ? CONSUMPTION_SCORE[tg.consumptionLevel] / 4
    : null

  if (quantityUsed === 0 && remainderScore === null) return null

  const usedRatio = quantityUsed / quantity
  const remainderContribution = remainderScore !== null ? (1 / quantity) * remainderScore : 0
  return Math.min(1, usedRatio + remainderContribution)
}

export function calcConsumptionSuggestion(
  gearId: string,
  allTripGears: TripGear[]
): string | null {
  const ratios = allTripGears
    .filter((tg) => tg.gearId === gearId)
    .map(calcConsumptionRatio)
    .filter((r): r is number => r !== null)

  if (ratios.length === 0) return null

  const avg = ratios.reduce((sum, r) => sum + r, 0) / ratios.length

  if (avg >= 0.75) return '多めに持参推奨'
  if (avg >= 0.4) return '通常量でOK'
  return '少量で十分'
}
