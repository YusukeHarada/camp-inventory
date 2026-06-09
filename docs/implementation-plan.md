# camp-gear-manager 実装計画

## Context

キャンプギア管理Webアプリをゼロから構築する。CLAUDE.md に要件・技術スタックが定義済みで、現リポジトリには README と CLAUDE.md のみ存在する。Next.js 16 App Router + Firebase + TypeScript strict モードで実装し、モバイルファーストの PWA として提供する。

---

## 実装フェーズ

### Phase 1: プロジェクト初期化

**コマンド:**
```bash
npx create-next-app@16 . \
  --typescript --tailwind --app --src-dir --eslint --no-git
```

追加インストール:
```bash
npm install firebase@^12 react-hook-form@^7 zod@^4 @hookform/resolvers \
  recharts clsx tailwind-merge lucide-react date-fns@^4 next-pwa
npm install -D vitest@^4 @vitejs/plugin-react @testing-library/react@^16 \
  @testing-library/jest-dom @testing-library/user-event jsdom playwright@^1.60
```

**設定ファイル:**
- `vitest.config.ts` — jsdom 環境、globals: true、alias `@/`、setupFiles
- `vitest.setup.ts` — jest-dom import、next/navigation mock、Firebase mock
- `playwright.config.ts` — E2E 設定（baseURL localhost:3000）
- `tailwind.config.ts` — darkMode: 'class'、コンテンツパス `src/**`
- `src/app/globals.css` — `@import "tailwindcss"`（v4 書き方）
- `.env.example` — NEXT_PUBLIC_FIREBASE_* 6 変数

---

### Phase 2: 型定義・定数

**作成ファイル:** `src/types/index.ts`

```ts
type GearCategory = 'tent-tarp' | 'bedding' | 'furniture' | 'cookware' |
  'tableware' | 'fuel-ignition' | 'light-lantern' | 'coolerbox' |
  'storage' | 'carry-cart' | 'battery' | 'air-conditioning' |
  'field-gear' | 'apparel' | 'bag' | 'shoes' | 'other'

type Gear = { id: string; userId: string; name: string; category: GearCategory;
  isRequired: boolean; memo?: string; imageUrl?: string; createdAt: Timestamp }

type CampTrip = { id: string; userId: string; name: string; date: string;
  location?: string; memo?: string; createdAt: Timestamp }

type TripGear = { id: string; userId: string; tripId: string;
  gearId: string; checked: boolean }
```

`src/lib/constants/categories.ts` — カテゴリラベルの日本語マップ（UI表示用）

---

### Phase 3: Firebase 設定

**作成ファイル:** `src/lib/firebase.ts`

- `initializeApp` / `getAuth` / `getFirestore` を export
- 環境変数 `NEXT_PUBLIC_FIREBASE_*` から設定読み込み
- 注意: このファイルを Server Components から import しない（Client 専用）

---

### Phase 4: 認証基盤

**作成ファイル:**

`src/contexts/AuthContext.tsx` — `'use client'` 付き
- `onAuthStateChanged` で `user: User | null` と `loading: boolean` を管理
- `signIn()` → `signInWithPopup(auth, new GoogleAuthProvider())`（signInWithRedirect 禁止）
- `signOut()` → `signOut(auth)`

`src/middleware.ts` — 未認証ユーザーを `/login` にリダイレクト
- `(app)` グループ配下のパスを保護

`src/app/layout.tsx` — `AuthProvider` をラップ

---

### Phase 5: Firestore アクセス層

コンポーネントから直接 Firestore を叩かず、以下に集約:

**`src/lib/firestore/gears.ts`**
- `getGears(userId)` — where userId == で取得
- `addGear(data)` — serverTimestamp() で createdAt
- `updateGear(id, data)` — updateDoc
- `deleteGear(id)` — deleteDoc

**`src/lib/firestore/trips.ts`**
- `getTrips(userId)` — date 降順
- `addTrip(data)` / `updateTrip(id, data)` / `deleteTrip(id)`
- `getTrip(id)` — 単件取得

**`src/lib/firestore/tripGears.ts`**
- `getTripGears(tripId)` — tripId で絞り込み
- `addTripGear(data)` / `updateTripGearChecked(id, checked)`
- `deleteTripGear(id)` / `deleteTripGearsByTripId(tripId)`
- `getTripGearsByUserId(userId)` — 統計用（全キャンプ分）

---

### Phase 6: ドメインロジック + ユニットテスト

**`src/lib/utils/cn.ts`** — `clsx` + `twMerge` をラップ

**`src/lib/utils/date.ts`** — date-fns ja ロケールで日付フォーマット

**`src/lib/utils/statistics.ts`**（テスト必須）
```ts
// 純粋関数として実装
calcGearUsageRanking(gears, tripGears): GearUsage[]  // 降順ソート
filterUnusedGears(gears, tripGears): Gear[]          // 未使用ギア
calcUsageByCategory(gears, tripGears): Record<string, number>
```

**テストファイル:** `src/__tests__/lib/utils/statistics.test.ts`
- 各関数に describe/it ブロックでケース網羅（8テスト）

---

### Phase 7: 共通 UI コンポーネント

**`src/components/ui/`**

| ファイル | 概要 |
|---|---|
| `Button.tsx` | variant: primary / secondary / danger / ghost、size: sm / md / lg |
| `Input.tsx` | react-hook-form 連携、エラー表示付き |
| `Select.tsx` | カテゴリフィルタ・フォーム用 |
| `Modal.tsx` | `<dialog>` ネイティブ要素ベース |
| `Badge.tsx` | 「必須」「カテゴリ」表示用 |
| `EmptyState.tsx` | データなし時の表示 |
| `LoadingSpinner.tsx` | ローディング状態 |

**`src/components/layout/`**

| ファイル | 概要 |
|---|---|
| `Header.tsx` | アプリ名、ユーザーアイコン、サインアウトボタン |
| `BottomNav.tsx` | モバイル用下部ナビ（ギア・キャンプ・統計） |

---

### Phase 8: ギア一覧ページ `/gears`

**ルート:** `src/app/(app)/gears/page.tsx`

**コンポーネント群 `src/components/gears/`:**

| ファイル | 概要 |
|---|---|
| `GearCard.tsx` | 個別カード（名前・カテゴリ・必須バッジ・編集削除ボタン） |
| `GearForm.tsx` | 登録・編集フォーム（react-hook-form + zod） |
| `CategoryFilter.tsx` | カテゴリ別フィルタボタン群（横スクロール） |

**`src/hooks/useGears.ts`**
- `getGears` でデータ取得、追加/更新/削除時に再取得
- ギア削除時に関連 TripGear を連鎖削除

---

### Phase 9: キャンプ記録ページ

**`/trips` — `src/app/(app)/trips/page.tsx`**

コンポーネント `src/components/trips/`:
- `TripCard.tsx` — 日付・名前・場所表示、詳細リンク
- `TripForm.tsx` — date input 付き登録フォーム

**`/trips/[id]` — `src/app/(app)/trips/[id]/page.tsx`**

- チェックリストタブ / プランニングタブ の 2 タブ構成
- `TripGearItem.tsx` — チェックボックス + ギア名
- 「必須ギアを一括追加」ボタン

**`src/hooks/useTrips.ts`** / **`src/hooks/useTripGears.ts`**

---

### Phase 10: 統計ページ `/statistics`

**ルート:** `src/app/(app)/statistics/page.tsx`

| コンポーネント | 概要 |
|---|---|
| `UsageRankingChart.tsx` | 持参回数上位10件の横棒グラフ（recharts） |
| `UnusedGearList.tsx` | 一度も持参していないギア一覧 |
| サマリカード | 総ギア数・キャンプ回数 |

**`src/hooks/useStatistics.ts`** — statistics.ts の純粋関数で計算

---

### Phase 11: 認証ページ `/login`

**`src/app/(auth)/login/page.tsx`**
- 「Google でログイン」ボタン
- 既にログイン済みなら `/gears` にリダイレクト
- エラー表示

---

### Phase 12: PWA 対応

**`public/manifest.json`** — アプリ名・アイコン・theme_color（#059669 エメラルドグリーン）

> 注意: `next-pwa@5` は Next.js 16 の Turbopack と非互換のため、`next.config.ts` への組み込みは保留。
> Service Worker は Turbopack 対応版（`@ducanh2912/next-pwa` など）が安定してから追加する。

---

### Phase 13: CI/CD

**`.github/workflows/ci.yml`**
```yaml
on: [push, pull_request]
jobs:
  ci:
    steps:
      - npx tsc --noEmit
      - npm run test:run
      - npm run build
        env: NEXT_PUBLIC_FIREBASE_* via GitHub Secrets
```

---

## 実装順序のまとめ

```
Phase 1 (初期化) → Phase 2 (型) → Phase 3 (Firebase) → Phase 4 (認証)
→ Phase 5 (Firestore層) → Phase 6 (ドメインロジック+テスト)
→ Phase 7 (UI基盤) → Phase 11 (認証ページ)
→ Phase 8 (ギア一覧) → Phase 9 (キャンプ記録) → Phase 10 (統計)
→ Phase 12 (PWA) → Phase 13 (CI)
```

---

## 技術的注意点

| 項目 | 方針 |
|---|---|
| Firebase Client 専用 | `src/lib/firebase.ts` は Server Components から import 禁止 |
| 認証方法 | `signInWithPopup` のみ（`signInWithRedirect` 禁止） |
| Tailwind v4 記法 | `globals.css` で `@import "tailwindcss"`（@tailwind ディレクティブ不使用） |
| any 禁止 | tsconfig strict: true |
| テスト対象 | `src/lib/utils/` の純粋関数は必ずユニットテスト |
| usageCount | Firestore に冗長保存せず TripGear を集計して算出 |
| ビルド時 Firebase | 環境変数未設定時のクラッシュを防ぐためプレースホルダー値を使用 |
| next-pwa + Turbopack | 非互換のため next.config.ts への組み込みは保留（manifest.json のみ設置） |

---

## 検証方法

各フェーズ完了時に以下を実行:
```bash
npx tsc --noEmit   # 型エラーなし
npm run test:run   # 全ユニットテスト通過（8 tests）
npm run build      # ビルド成功
```

最終確認（実機）:
- ログイン → ギア登録 → キャンプ記録作成 → チェックリスト操作 → 統計確認
- iPhone Safari でホーム画面追加（PWA manifest）
- ダークモード切り替え確認
