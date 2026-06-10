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

export const GEAR_CATEGORY_DESCRIPTIONS: Record<GearCategory, string> = {
  tent:      'テント・タープ・寝袋・マットなど就寝・居住空間のギア',
  furniture: 'チェア・テーブル・収納・キャリー・冷暖房・バッグ類',
  kitchen:   '調理器具・食器・バーナー・燃料・クーラーボックス',
  lighting:  'ランタン・ヘッドライト・電源・バッテリー類',
  tools:     'ペグ・ハンマー・ロープ・マルチツールなどフィールドギア',
  apparel:   'ウェア・シューズ・帽子・グローブなどウェア類',
  other:     '上記に当てはまらないその他のギア',
}

export const GEAR_CATEGORY_EXAMPLES: Record<GearCategory, string[]> = {
  tent:      ['テント', 'タープ', '寝袋', 'マット', 'ピロー'],
  furniture: ['チェア', 'テーブル', 'クーラーボックス', 'キャリーワゴン', 'ハンモック'],
  kitchen:   ['バーナー', 'クッカー', 'スキレット', 'カトラリー', 'OD缶'],
  lighting:  ['ランタン', 'ヘッドライト', 'モバイルバッテリー', '電源タップ'],
  tools:     ['ペグ', 'ハンマー', 'ロープ', 'マルチツール', 'ファーストエイドキット'],
  apparel:   ['レインウェア', 'トレッキングシューズ', 'フリース', 'グローブ', '帽子'],
  other:     ['虫除けスプレー', '日焼け止め', 'ゴミ袋'],
}
