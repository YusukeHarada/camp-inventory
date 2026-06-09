import type { GearCategory } from '@/types'

export const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  'tent-tarp': 'テント・タープ',
  'bedding': '寝具',
  'furniture': 'ファニチャー',
  'cookware': '調理器具',
  'tableware': '食器',
  'fuel-ignition': '燃料・着火',
  'light-lantern': 'ランタン・ライト',
  'coolerbox': 'クーラーボックス',
  'storage': '収納',
  'carry-cart': 'カート・キャリー',
  'battery': '電源・バッテリー',
  'air-conditioning': '冷暖房器具',
  'field-gear': 'フィールドギア',
  'apparel': 'ウェア',
  'bag': 'バッグ',
  'shoes': 'シューズ',
  'other': 'その他',
}

export const GEAR_CATEGORY_KEYS = Object.keys(GEAR_CATEGORY_LABELS) as GearCategory[]
