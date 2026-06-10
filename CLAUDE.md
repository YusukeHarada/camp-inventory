# camp-gear-manager — CLAUDE.md

## プロジェクト概要

個人・家族向けのキャンプギア管理Webアプリ。
所持ギアの把握、キャンプごとの持ち物プランニング、持参履歴・回数の記録を目的とする。

## ユーザーストーリー

- 所持しているギアを一覧で確認したい
- 次のキャンプで何を持っていくかプランニングしたい
- ギアごとに「何回持っていったか」を把握したい
- 必須ギア（忘れてはいけないもの）を設定しておきたい
- 過去のキャンプで実際に持っていったギアを振り返りたい

## 技術スタック

|役割      |ライブラリ                     |バージョン      |
|--------|--------------------------|-----------|
|フレームワーク |Next.js (App Router)      |16         |
|UI ランタイム|React                     |19         |
|言語      |TypeScript                |^5         |
|スタイリング  |Tailwind CSS              |^4         |
|クラス結合   |clsx + tailwind-merge     |latest     |
|アイコン    |lucide-react              |latest     |
|グラフ     |recharts                  |latest     |
|フォーム管理  |react-hook-form           |^7         |
|スキーマ検証  |zod                       |^4         |
|リゾルバー連携 |@hookform/resolvers       |latest     |
|日付処理    |date-fns                  |^4（ja ロケール）|
|認証・DB   |Firebase（Auth + Firestore）|^12        |
|ホスティング  |Vercel                    |—          |

### テスト

|役割        |ライブラリ                                |
|----------|-------------------------------------|
|単体・コンポーネント|Vitest ^4 + React Testing Library ^16|
|DOM 検証    |@testing-library/jest-dom            |
|E2E       |Playwright ^1.60                     |
|テスト DOM   |jsdom                                |

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/        # ログインページ
│   └── (app)/         # 認証必須ページ（gears, trips, statistics）
├── components/
│   ├── ui/            # 汎用UIコンポーネント
│   ├── layout/        # ヘッダー・ナビゲーション
│   ├── gears/         # ギア関連コンポーネント
│   ├── trips/         # キャンプ記録関連
│   └── statistics/    # 統計関連
├── hooks/             # useGears, useTrips, useTripGears, useStatistics
├── lib/
│   ├── firebase.ts
│   ├── firestore/     # gears.ts, trips.ts, tripGears.ts
│   └── utils/         # cn.ts, date.ts, statistics.ts
├── types/             # Gear, CampTrip, TripGear
└── contexts/          # AuthContext
```

## データモデル（Firestore）

```
gears/{gearId}
  userId, name, category, isRequired, isConsumable, memo, imageUrl, createdAt

trips/{tripId}
  userId, name, date, location, memo, createdAt

tripGears/{tripGearId}
  userId, tripId, gearId, checked, quantity, quantityUsed, consumptionLevel?
```

### 型定義

```ts
type GearCategory =
  | 'tent'        // テント・タープ・寝具
  | 'furniture'   // チェア・テーブル・収納・キャリー・冷暖房・バッグ
  | 'kitchen'     // 調理器具・食器・燃料・クーラーボックス
  | 'lighting'    // ランタン・ライト・電源・バッテリー
  | 'tools'       // フィールドギア
  | 'apparel'     // ウェア・シューズ
  | 'other'       // その他

// 消耗品の使用感覚（キャンプ後に記録）
type ConsumptionLevel = 'little' | 'half' | 'most' | 'all'

type Gear = {
  id: string
  userId: string
  name: string
  category: GearCategory
  isRequired: boolean      // 必須ギアフラグ
  isConsumable: boolean    // 消耗品フラグ（ガス・電池など）
  memo?: string
  imageUrl?: string
  createdAt: Timestamp
}

type CampTrip = {
  id: string
  userId: string
  name: string             // 例: "奥多摩キャンプ 2025夏"
  date: string             // YYYY-MM-DD
  location?: string
  memo?: string
  createdAt: Timestamp
}

type TripGear = {
  id: string
  userId: string
  tripId: string
  gearId: string
  checked: boolean                     // チェックリスト用
  quantity: number                     // 持参数（デフォルト1）
  quantityUsed: number                 // 使い切った数（0〜quantity）
  consumptionLevel?: ConsumptionLevel  // 使い切れなかった残り1本の消費感（任意・キャンプ後に記録）
}
```

※ usageCount（持参回数）は TripGear を集計して算出する（Firestore に冗長保存しない）

## 画面構成

1. **ギア一覧** `/gears` — 所持ギアの表示・登録・編集・削除、カテゴリフィルタ
1. **キャンプ一覧** `/trips` — 過去・予定のキャンプ記録一覧
1. **キャンプ詳細** `/trips/[id]` — 持ち物プランニング＆チェックリスト
1. **統計** `/statistics` — 持参回数ランキング、未使用ギア一覧（recharts）

## 開発ルール

### コーディング規約

- TypeScript strict mode を常に維持（`any` 禁止）
- Firestoreアクセスは `src/lib/firestore/` に集約し、コンポーネントから直接叩かない
- ドメインロジック（統計計算など）は `src/lib/utils/` に純粋関数として実装しテスト対象とする

### 認証

- `signInWithPopup` のみ使用
- `signInWithRedirect` は使用禁止（iOS Safari の ITP で sessionStorage が消去されるため）
- `onAuthStateChanged` でローディング状態を管理
- **`initializeAuth` を使う場合は `browserPopupRedirectResolver` を必ず渡すこと**
  `getAuth` はデフォルトで含めるが `initializeAuth` は含めないため、省略すると `signInWithPopup` が `auth/argument-error` で失敗する

### テスト

- ドメインロジック・ユーティリティ関数はユニットテストを必ず書く
- コード変更後は必ず以下を実行してエラーがないことを確認してから納品すること:
  
  ```
  npx tsc --noEmit
  npm run test:run
  npm run build
  ```

### Firebase設定

- 環境変数は `.env.local` で管理（`.env.example` をリポジトリに含める）
- Firestoreセキュリティルール: 認証済みユーザーが自分のデータのみ読み書き可能

### デプロイ

- `main` ブランチへのマージで Vercel に自動デプロイ
- GitHub Actions でCIを構成（tsc + test + build）

## UI/UXの方針

- モバイルファースト（iPhone での利用がメイン、PC でも使用）
- next-pwa でPWA対応し、iPhoneホーム画面への追加を可能にする
- キャンプ準備中でも直感的に操作できるシンプルなUI
- ダークモード対応（アウトドアシーンでの視認性を考慮）

## 参考にした既存アプリ

- GEAR STACK: コレクション管理・チェックリスト
- GEARR: 使用履歴・重量管理・分析
- geargear: パッキングリスト＋コミュニティ

**自作アプリの差別化ポイント**:

- 持参回数の可視化（既存アプリは弱い）
- プランニングと過去履歴の紐付け
- Webアプリ（PC＋iPhone両対応）
- プライベート専用（SNS要素なし）
