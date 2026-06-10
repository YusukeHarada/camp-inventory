import { describe, it, expect } from 'vitest'
import {
  calcGearUsageRanking,
  filterUnusedGears,
  calcUsageByCategory,
  calcConsumptionSuggestion,
} from '@/lib/utils/statistics'
import type { Gear, TripGear } from '@/types'
import type { Timestamp } from 'firebase/firestore'

const fakeTimestamp = { toDate: () => new Date() } as Timestamp

const gears: Gear[] = [
  { id: 'g1', userId: 'u1', name: 'テント', category: 'tent', isRequired: true, isConsumable: false, createdAt: fakeTimestamp },
  { id: 'g2', userId: 'u1', name: 'シュラフ', category: 'tent', isRequired: false, isConsumable: false, createdAt: fakeTimestamp },
  { id: 'g3', userId: 'u1', name: 'チェア', category: 'furniture', isRequired: false, isConsumable: false, createdAt: fakeTimestamp },
]

const tripGears: TripGear[] = [
  { id: 'tg1', userId: 'u1', tripId: 'trip1', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0 },
  { id: 'tg2', userId: 'u1', tripId: 'trip2', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0 },
  { id: 'tg3', userId: 'u1', tripId: 'trip1', gearId: 'g2', checked: true, quantity: 1, quantityUsed: 0 },
  { id: 'tg4', userId: 'u1', tripId: 'trip3', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0 },
]

describe('calcGearUsageRanking', () => {
  it('使用回数の降順で並ぶ', () => {
    const ranking = calcGearUsageRanking(gears, tripGears)
    expect(ranking[0].gear.id).toBe('g1')
    expect(ranking[0].usageCount).toBe(3)
    expect(ranking[1].gear.id).toBe('g2')
    expect(ranking[1].usageCount).toBe(1)
  })

  it('一度も使用されていないギアは usageCount が 0', () => {
    const ranking = calcGearUsageRanking(gears, tripGears)
    const chairUsage = ranking.find((r) => r.gear.id === 'g3')
    expect(chairUsage?.usageCount).toBe(0)
  })

  it('空の tripGears を渡しても安全に動作する', () => {
    const ranking = calcGearUsageRanking(gears, [])
    expect(ranking).toHaveLength(3)
    ranking.forEach((r) => expect(r.usageCount).toBe(0))
  })

  it('空の gears を渡すと空配列を返す', () => {
    const ranking = calcGearUsageRanking([], tripGears)
    expect(ranking).toHaveLength(0)
  })
})

describe('filterUnusedGears', () => {
  it('一度も使用されていないギアのみを返す', () => {
    const unused = filterUnusedGears(gears, tripGears)
    expect(unused).toHaveLength(1)
    expect(unused[0].id).toBe('g3')
  })

  it('全ギアが使用済みなら空配列を返す', () => {
    const allUsed: TripGear[] = [
      ...tripGears,
      { id: 'tg5', userId: 'u1', tripId: 'trip1', gearId: 'g3', checked: true, quantity: 1, quantityUsed: 0 },
    ]
    expect(filterUnusedGears(gears, allUsed)).toHaveLength(0)
  })

  it('全ギアが未使用なら全て返す', () => {
    expect(filterUnusedGears(gears, [])).toHaveLength(3)
  })
})

describe('calcUsageByCategory', () => {
  it('カテゴリ別の使用回数を集計する', () => {
    const result = calcUsageByCategory(gears, tripGears)
    expect(result['tent']).toBe(4)
    expect(result['furniture']).toBeUndefined()
  })
})

describe('calcConsumptionSuggestion', () => {
  it('全て使い切りの場合は多め推奨を返す', () => {
    const tgs: TripGear[] = [
      { id: 'tg1', userId: 'u1', tripId: 't1', gearId: 'g1', checked: true, quantity: 2, quantityUsed: 2 },
      { id: 'tg2', userId: 'u1', tripId: 't2', gearId: 'g1', checked: true, quantity: 2, quantityUsed: 2 },
      { id: 'tg3', userId: 'u1', tripId: 't3', gearId: 'g1', checked: true, quantity: 2, quantityUsed: 2 },
    ]
    expect(calcConsumptionSuggestion('g1', tgs)).toBe('多めに持参推奨')
  })

  it('残りの消費感が高い場合は多め推奨を返す', () => {
    const tgs: TripGear[] = [
      { id: 'tg1', userId: 'u1', tripId: 't1', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0, consumptionLevel: 'most' },
      { id: 'tg2', userId: 'u1', tripId: 't2', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0, consumptionLevel: 'all' },
      { id: 'tg3', userId: 'u1', tripId: 't3', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0, consumptionLevel: 'most' },
    ]
    expect(calcConsumptionSuggestion('g1', tgs)).toBe('多めに持参推奨')
  })

  it('消費が少ない場合は少量で十分を返す', () => {
    const tgs: TripGear[] = [
      { id: 'tg1', userId: 'u1', tripId: 't1', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0, consumptionLevel: 'little' },
      { id: 'tg2', userId: 'u1', tripId: 't2', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0, consumptionLevel: 'little' },
    ]
    expect(calcConsumptionSuggestion('g1', tgs)).toBe('少量で十分')
  })

  it('quantity/quantityUsed/consumptionLevel 全て未設定は null を返す', () => {
    const tgs: TripGear[] = [
      { id: 'tg1', userId: 'u1', tripId: 't1', gearId: 'g1', checked: true, quantity: 1, quantityUsed: 0 },
      { id: 'tg2', userId: 'u1', tripId: 't2', gearId: 'g1', checked: false, quantity: 1, quantityUsed: 0 },
    ]
    expect(calcConsumptionSuggestion('g1', tgs)).toBeNull()
  })

  it('対象ギアのデータがない場合は null を返す', () => {
    expect(calcConsumptionSuggestion('g99', tripGears)).toBeNull()
  })
})
