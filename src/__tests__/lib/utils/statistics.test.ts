import { describe, it, expect } from 'vitest'
import {
  calcGearUsageRanking,
  filterUnusedGears,
  calcUsageByCategory,
} from '@/lib/utils/statistics'
import type { Gear, TripGear } from '@/types'
import type { Timestamp } from 'firebase/firestore'

const fakeTimestamp = { toDate: () => new Date() } as Timestamp

const gears: Gear[] = [
  { id: 'g1', userId: 'u1', name: 'テント', category: 'tent-tarp', isRequired: true, createdAt: fakeTimestamp },
  { id: 'g2', userId: 'u1', name: 'シュラフ', category: 'bedding', isRequired: false, createdAt: fakeTimestamp },
  { id: 'g3', userId: 'u1', name: 'チェア', category: 'furniture', isRequired: false, createdAt: fakeTimestamp },
]

const tripGears: TripGear[] = [
  { id: 'tg1', userId: 'u1', tripId: 'trip1', gearId: 'g1', checked: true },
  { id: 'tg2', userId: 'u1', tripId: 'trip2', gearId: 'g1', checked: true },
  { id: 'tg3', userId: 'u1', tripId: 'trip1', gearId: 'g2', checked: true },
  { id: 'tg4', userId: 'u1', tripId: 'trip3', gearId: 'g1', checked: true },
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
      { id: 'tg5', userId: 'u1', tripId: 'trip1', gearId: 'g3', checked: true },
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
    expect(result['tent-tarp']).toBe(3)
    expect(result['bedding']).toBe(1)
    expect(result['furniture']).toBeUndefined()
  })
})
