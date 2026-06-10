import type { GearCategory } from '@/types'

export const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  'tent': 'テント',
  'furniture': 'ファニチャー',
  'kitchen': 'キッチン',
  'lighting': 'ライティング',
  'tools': 'ツール',
  'apparel': 'アパレル',
  'other': 'その他',
}

export const GEAR_CATEGORY_KEYS = Object.keys(GEAR_CATEGORY_LABELS) as GearCategory[]
