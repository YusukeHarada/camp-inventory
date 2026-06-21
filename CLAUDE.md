# CLAUDE.md

このファイルは、リポジトリ内のコードを扱う Claude Code (claude.ai/code) へのガイダンスを提供します。

## 注意: Next.js のバージョンについて

このプロジェクトは、学習データと異なる破壊的変更を含む Next.js バージョンを使用しています。Next.js 固有のコードを書く前に、`node_modules/next/dist/docs/` で最新の規約を確認してください。

## コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint
npx tsc --noEmit     # 型チェック

npm run test         # vitest (ウォッチモード)
npm run test:run     # vitest (1回実行)
npm run test:run -- src/__tests__/lib/utils/statistics.test.ts  # 単一ファイル実行
npm run test:coverage
```

変更を納品する前に、以下の3つがすべて通ることを確認すること:

```bash
npx tsc --noEmit && npm run test:run && npm run build
```

## アーキテクチャ

### リクエストの流れ

```
ページコンポーネント
  → カスタムフック (src/hooks/)
    → Firestore 関数 (src/lib/firestore/)
      → Firebase SDK
```

コンポーネントは Firestore を直接呼び出さない。すべての Firestore アクセスは `src/lib/firestore/{gears,trips,tripGears}.ts` に集約されている。ドメインロジック（統計・消費量計算など）は `src/lib/utils/` に純粋関数として実装されており、テストの主な対象となる。

### ルートグループ

- `src/app/(auth)/` — 未認証ページ（ログイン）
- `src/app/(app)/` — 認証必須ページ（gears, trips, statistics）

認証ガードは `src/app/(app)/layout.tsx` にある。`AuthContext` を参照し、未ログインの場合は `/login` にリダイレクトする。`AuthProvider` はルートレイアウトでアプリ全体を囲み、`SettingsProvider` は `(app)/layout.tsx` 内にのみ配置されている。

### フックのデータパターン

すべてのデータフック（`useGears`、`useTrips`、`useTripGears`、`useStatistics`）は「更新後に再取得」方式を採用している。ミューテーションのたびに共通の `load()` 関数を呼び出して Firestore からローカル状態を再取得する。`useTripGears` が最も複雑で、4つのコレクションを並列取得し、`unplannedGears`（まだ旅行に追加されていないギア）を派生値として公開する。

### 消耗品の在庫フロー

`usageCount`（持参回数）は Firestore に保存されず、`TripGear` ドキュメントを集計して算出する。`completeTrip()` が呼び出されると、`calcConsumedUnits()`（`src/lib/utils/statistics.ts`）が消耗品ごとの実際の使用数を計算し、Firestore の `Gear.stock` を減算する。その後、旅行の `status` が `'completed'` に更新される。

### 統計関数 (`src/lib/utils/statistics.ts`)

`Gear[]` と `TripGear[]` を引数に取る純粋関数群:
- `calcGearUsageRanking` — 持参回数の降順でソート
- `filterUnusedGears` — TripGear レコードがゼロのギアを返す
- `calcConsumptionSuggestion` — 過去の平均消費比率に基づく日本語サジェスト文字列を返す。データがない場合は `null`

## 規約

### TypeScript

`any` は禁止。strict モードを常に維持。`@` は `src/` へのパスエイリアス。

### 認証

- `signInWithPopup`（Google OAuth）のみ使用。`signInWithRedirect` は iOS Safari の ITP で sessionStorage が消去されるため禁止。
- `initializeAuth` には **必ず** `browserPopupRedirectResolver` を渡すこと。省略すると `signInWithPopup` が `auth/argument-error` で失敗する。`getAuth` はデフォルトで含むが `initializeAuth` は含まない。
- Firestore は `ignoreUndefinedProperties: true` で初期化し、オプショナルフィールドを適切に扱う。

### 設定

UI の表示設定は `SettingsContext` で管理し（`localStorage` のキー `campgear_settings` に永続化）、`useSettings()` フックでアクセスする。現在の設定項目: `showGearImages`（デフォルト `false`）。

### テスト

テストは `src/__tests__/` 以下に配置する。`src/__tests__/setup.ts` のグローバルセットアップで `next/navigation` と `@/lib/firebase` がすべてのテストでモック済み。テストフィクスチャの Firestore タイムスタンプには `{ toDate: () => new Date() } as Timestamp` を使用する。

ユニットテストはドメイン・ユーティリティ関数のみ必須。コンポーネントテストは任意。

## データモデル

```
gears/{gearId}       userId, name, category, isRequired, isConsumable, stock?, memo, imageUrl, createdAt
trips/{tripId}       userId, name, date (YYYY-MM-DD), location?, memo, status ('planned'|'completed'), createdAt
tripGears/{id}       userId, tripId, gearId, checked, quantity, quantityUsed, consumptionLevel?
```

`GearCategory`: `tent | furniture | kitchen | lighting | tools | apparel | other`

`ConsumptionLevel`: `little | half | most | all` — 1回のキャンプでの消耗品の部分的な使用感を表す。

カテゴリの表示ラベルは `src/lib/constants/categories.ts` にある。

## 環境変数

`.env.example` を `.env.local` にコピーし、Firebase プロジェクトの値（`NEXT_PUBLIC_FIREBASE_*`）を記入する。ローカル開発に必要な環境変数はこれのみ。
