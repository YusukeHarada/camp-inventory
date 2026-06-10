# CampGear

個人・家族向けのキャンプギア管理Webアプリ。

https://camp-inventory.vercel.app

## 機能

- 所持ギアの一覧管理（カテゴリフィルタ・必須フラグ・消耗品フラグ）
- キャンプごとの持ち物プランニング＆チェックリスト
- 消耗品の持参数・使い切り数・残りの消費感を記録し、次回持参量をサジェスト
- キャンプ終了ボタンで消耗品の消費量を在庫に自動反映
- 持参回数ランキング・未使用ギア一覧（統計）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + React 19
- **言語**: TypeScript 5（strict mode）
- **スタイリング**: Tailwind CSS 4
- **認証・DB**: Firebase Auth + Firestore
- **ホスティング**: Vercel

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に Firebase の設定値を記入
npm run dev
```

## 環境変数

`.env.example` を参照。Firebase Console のプロジェクト設定から取得する。

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firebase 設定

### 認証

Google サインインを有効化し、使用するドメイン（Vercel の URL 等）を **承認済みドメイン** に追加する。

### 注意: `initializeAuth` を使う場合は `popupRedirectResolver` が必須

`initializeAuth` でカスタム persistence を設定する場合、`browserPopupRedirectResolver` を渡さないと `signInWithPopup` が `auth/argument-error` で失敗する。`getAuth` はデフォルトで含めるが `initializeAuth` は含めない。

```ts
initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver, // 必須
})
```

### Firestore セキュリティルール

認証済みユーザーが自分のデータのみ読み書き可能なルールを設定すること。

## テスト・ビルド

```bash
npx tsc --noEmit   # 型チェック
npm run test:run   # ユニットテスト
npm run build      # 本番ビルド
```
