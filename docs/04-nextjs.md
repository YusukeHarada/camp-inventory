# 第4章 Next.js — ページとルーティング

## Next.js とは何か

React だけでは「どの URL でどのコンポーネントを表示するか」を自分で設定しなければいけません。  
**Next.js** は React のフレームワークで、多くのことを自動化してくれます：

- URL とページファイルを自動で紐付け（**ファイルベースルーティング**）
- ブラウザ（クライアント）とサーバーの処理を分離
- 最適化・ビルド・デプロイの仕組み

---

## ファイルベースルーティング — URL = ファイルパス

Next.js では `src/app/` の下にファイルを置くだけで、自動的に URL が決まります：

| ファイルパス | URL |
|------------|-----|
| `src/app/page.tsx` | `/` |
| `src/app/(auth)/login/page.tsx` | `/login` |
| `src/app/(app)/gears/page.tsx` | `/gears` |
| `src/app/(app)/trips/page.tsx` | `/trips` |
| `src/app/(app)/trips/[id]/page.tsx` | `/trips/abc123`（`[id]` は変数） |
| `src/app/(app)/statistics/page.tsx` | `/statistics` |

C言語で言えば、関数名とファイル名で機能が決まるのに似ています。

---

## 特殊なファイル名

`src/app/` の中には特別な意味を持つファイル名があります：

| ファイル名 | 役割 |
|-----------|------|
| `page.tsx` | そのURLで表示するページ本体 |
| `layout.tsx` | ページを囲む共通の枠（ヘッダーなど） |
| `loading.tsx` | ローディング中に表示する画面 |
| `error.tsx` | エラー時に表示する画面 |

---

## layout.tsx — 共通の枠組み

`layout.tsx` は「子ページを囲む枠」です。HTML の `<template>` に相当します。

```
src/app/
├── layout.tsx          ← 全ページ共通（<html>, <body>, AuthProvider）
├── page.tsx
└── (app)/
    ├── layout.tsx      ← 認証済みページ共通（Header, BottomNav）
    ├── gears/page.tsx
    └── trips/page.tsx
```

**外側の layout.tsx（全ページ共通）：**

```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,  // ← ここに各ページが入る
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-slate-50 dark:bg-slate-900">
        <AuthProvider>{children}</AuthProvider>
        {/* AuthProvider で全ページを囲む → どこでも useAuth() が使える */}
      </body>
    </html>
  )
}
```

**内側の layout.tsx（認証済みページ共通）：**

```typescript
// src/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // ログインしていなければログインページへリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) return <PageLoading />
  if (!user) return null

  return (
    <SettingsProvider>
      <div className="flex flex-col min-h-screen">
        <Header />                              {/* ヘッダー */}
        <main className="flex-1 pb-20 pt-4 px-4">{children}</main>  {/* ページ本体 */}
        <BottomNav />                           {/* 下部ナビゲーション */}
      </div>
    </SettingsProvider>
  )
}
```

C言語でのイメージ：

```c
// C言語でのページ描画のイメージ
void renderPage(void (*renderContent)()) {
    renderHeader();
    renderContent();   // ← 各ページの中身
    renderBottomNav();
}
```

---

## `(auth)` と `(app)` — グループフォルダ

フォルダ名を `(かっこ)` で囲むと、**URL には影響しないグループ** を作れます：

```
(auth)/login/page.tsx  → URL: /login     （(auth) は URL に含まれない）
(app)/gears/page.tsx   → URL: /gears     （(app) は URL に含まれない）
```

これはコードの整理のためだけに使います。  
`(auth)` グループにはログイン不要なページ、`(app)` グループにはログイン必須のページをまとめています。

---

## `[id]` — 動的ルーティング

フォルダ名を `[かっこ]` で囲むと、URL の一部を変数として受け取れます：

```
trips/[id]/page.tsx  →  /trips/abc123 にアクセスすると id = "abc123"
```

```typescript
// src/app/(app)/trips/[id]/page.tsx
type Props = {
  params: Promise<{ id: string }>
}

export default function TripDetailPage({ params }: Props) {
  const { id: tripId } = use(params)  // id を取り出す
  // tripId = "abc123"
  // ...
}
```

C言語で例えると、コマンドライン引数で `./app abc123` と渡すようなイメージです：

```c
int main(int argc, char *argv[]) {
    char *tripId = argv[1];  // "abc123"
    // ...
}
```

---

## 'use client' — クライアントとサーバーの分離

Next.js のコンポーネントには2種類あります：

| 種類 | 実行場所 | 用途 |
|------|---------|------|
| **サーバーコンポーネント** | サーバー上 | DB 直接アクセス、SEO に有利（デフォルト） |
| **クライアントコンポーネント** | ブラウザ上 | インタラクション（ボタン、フォームなど） |

クライアントコンポーネントにするには、ファイルの先頭に `'use client'` を書きます：

```typescript
'use client'  // ← この宣言があるとブラウザで動く

import { useState } from 'react'

export default function GearsPage() {
  const [showModal, setShowModal] = useState(false)  // useState はクライアントのみ
  // ...
}
```

**`'use client'` が必要な場合：**
- `useState`, `useEffect` などのフックを使う
- `onClick` などのイベントハンドラを使う
- ブラウザの API（`localStorage`, `window` など）を使う

このアプリのほとんどのファイルは `'use client'` を宣言しています。Firebase との通信もブラウザ側で行うためです。

---

## useRouter — プログラムでページ移動

リンクを押した遷移ではなく、コードでページ移動する場合は `useRouter` を使います：

```typescript
// src/app/(app)/layout.tsx より
const router = useRouter()

useEffect(() => {
  if (!loading && !user) {
    router.replace('/login')  // ログインしていなければ /login へ強制移動
  }
}, [user, loading, router])
```

C言語でプロセスを起動するときの `exec()` に少し似ています（現在の内容を置き換えて別ページへ）。

---

## Next.js のビルドとデプロイ

```bash
npm run build    # TypeScript → JavaScript に変換してビルド
npx tsc --noEmit # 型チェックのみ（ビルドしない）
```

ビルドすると `main` ブランチへのプッシュで Vercel が自動デプロイします。  
C言語での `make && scp a.out server:/app/` に相当します。

---

## まとめ

| 概念 | Next.js | C言語 |
|------|---------|-------|
| URL とコード対応 | ファイルパス = URL | `case` 文でルーティング |
| 共通部分 | `layout.tsx` | 共通ヘッダー関数 |
| URL 変数 | `[id]` フォルダ | `argv[]` |
| ページ移動 | `router.replace()` | `exec()` |
| ビルド | `npm run build` | `make` |

次の章では、クラウド上のデータベース（Firebase Firestore）と認証について説明します。  
→ [第5章 Firebase](./05-firebase.md)
