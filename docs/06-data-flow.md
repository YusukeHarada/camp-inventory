# 第6章 データフロー — 全体を繋げて理解する

## この章の目的

ここまでで学んだ技術（TypeScript・React・Next.js・Firebase）が、実際のアプリでどう連携しているかを追います。

題材として「**ギアを追加する**」操作を最初から最後まで追跡します。

---

## 登場人物（ファイル）の整理

```
src/
├── app/(app)/gears/page.tsx          ← ギア一覧ページ（UI + 操作の起点）
├── components/gears/GearCard.tsx     ← ギア1件の表示部品
├── components/gears/GearForm.tsx     ← 追加・編集フォーム
├── hooks/useGears.ts                 ← ギアのデータ管理（状態 + DB呼び出し）
├── lib/firestore/gears.ts            ← Firestore への直接操作
├── contexts/AuthContext.tsx          ← ログイン状態管理
└── types/index.ts                    ← データの型定義
```

---

## Step 1: ページが開かれる

ユーザーがブラウザで `/gears` にアクセスする。

```
URL: /gears
  ↓
Next.js が src/app/(app)/gears/page.tsx を表示
  ↓
その前に src/app/(app)/layout.tsx が実行される
```

`layout.tsx` はまず認証チェックをします：

```typescript
// src/app/(app)/layout.tsx
export default function AppLayout({ children }) {
  const { user, loading } = useAuth()  // ← AuthContext から取得

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')  // 未ログインなら /login へ
    }
  }, [user, loading, router])

  if (loading) return <PageLoading />  // 認証確認中
  if (!user) return null               // 未ログイン（リダイレクト中）

  return (
    <SettingsProvider>
      <Header />
      <main>{children}</main>  {/* ← ここに GearsPage が入る */}
      <BottomNav />
    </SettingsProvider>
  )
}
```

---

## Step 2: データの初期読み込み

`GearsPage` が表示され、`useGears` フックが動きます：

```typescript
// src/app/(app)/gears/page.tsx
export default function GearsPage() {
  const { gears, loading, addGear, updateGear, deleteGear } = useGears()
  // ↑ この1行で以下が全部始まる
```

```typescript
// src/hooks/useGears.ts
export function useGears() {
  const { user } = useAuth()              // ログインユーザーを取得
  const [gears, setGears] = useState<Gear[]>([])   // 初期値：空配列
  const [loading, setLoading] = useState(true)     // 初期値：ロード中

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const data = await getGears(user.uid)  // ← Firestore から取得
    setGears(data)                         // ← 画面を更新
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()  // コンポーネント表示時に1回実行
  }, [load])
```

```typescript
// src/lib/firestore/gears.ts
export async function getGears(userId: string): Promise<Gear[]> {
  const q = query(
    collection(db, 'gears'),
    where('userId', '==', userId)  // 自分のデータのみ
  )
  const snap = await getDocs(q)    // Firestore に問い合わせ（HTTP 通信）
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gear))
}
```

**処理の流れ：**

```
GearsPage 表示
  → useGears() 呼び出し
    → useState で空配列 + ローディング状態を用意
    → useEffect で load() 実行
      → useAuth() でユーザーID取得
      → getGears(userId) で Firestore に問い合わせ
        → HTTP 通信（Google サーバーへ）
        → データ返却
      → setGears(data) で状態更新
      → React が GearsPage を再描画
        → ギアカード一覧が表示される
```

---

## Step 3: ユーザーが「追加」ボタンを押す

```typescript
// src/app/(app)/gears/page.tsx
const [showAddModal, setShowAddModal] = useState(false)

// JSX の中
<Button onClick={() => setShowAddModal(true)}>
  <Plus size={16} />
  追加
</Button>
```

`setShowAddModal(true)` が呼ばれると React が再描画し、モーダルが表示されます：

```typescript
// JSX の中
<Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="ギアを追加">
  <GearForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
</Modal>
```

---

## Step 4: フォームに入力して送信

`GearForm` コンポーネントが入力を受け付けます（フォーム管理に React Hook Form、バリデーションに Zod を使用）。

送信されると `handleAdd` 関数が呼ばれます：

```typescript
// src/app/(app)/gears/page.tsx
const handleAdd = async (data: GearFormData) => {
  try {
    setFormError(null)
    await addGear({           // ← useGears フックの addGear
      name: data.name,
      category: data.category as GearCategory,
      isRequired: data.isRequired,
      isConsumable: data.isConsumable,
      stock: data.isConsumable ? data.stock : undefined,
      memo: data.memo || undefined,
      imageUrl: data.imageUrl || undefined,
    })
    setShowAddModal(false)    // 成功したらモーダルを閉じる
  } catch (e) {
    setFormError(e instanceof Error ? e.message : '登録に失敗しました')
  }
}
```

---

## Step 5: Firestore への書き込み

`useGears` の `addGear` が Firestore 操作層を呼びます：

```typescript
// src/hooks/useGears.ts
const addGear = useCallback(
  async (data: Omit<Gear, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return
    await addGearFS(user.uid, data)  // ← Firestore に書き込み
    await load()                     // ← データを再読み込みして画面更新
  },
  [user, load]
)
```

```typescript
// src/lib/firestore/gears.ts
export async function addGear(
  userId: string,
  data: Omit<Gear, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'gears'), {
    ...data,
    userId,
    createdAt: Timestamp.now(),  // 作成日時を自動設定
  })
  return ref.id  // Firebase が自動生成した ID（例："abc123xyz"）
}
```

---

## Step 6: 画面の更新

`addGearFS` 完了後、`load()` が呼ばれて最新データを再取得します：

```typescript
await addGearFS(user.uid, data)
await load()  // ← Firestore から再取得 → setGears() → React が再描画
```

`setGears(data)` が呼ばれると、React はギア一覧を更新し、追加したギアが即座に表示されます。

---

## 全体のシーケンス図

```
[ユーザー]              [GearsPage]          [useGears]        [Firestore]

ページを開く ──────────→ 表示される
                          useGears() 呼ぶ ──→ load()
                                               getGears(uid) ──→ クエリ実行
                                             ←─ Gear[] 返る  ←── データ返却
                          再描画（一覧表示） ←─ setGears(data)

「追加」クリック ────────→ setShowAddModal(true)
                          モーダル表示

フォーム送信 ───────────→ handleAdd(data)
                          addGear(data) ──── → addGearFS(uid, data)
                                               addDoc() ──────→ 書き込み
                                             ←─ 完了          ←── 成功
                                               load()
                                               getGears(uid) ──→ クエリ実行
                                             ←─ 最新Gear[]   ←── データ返却
                          再描画（新ギア表示）←─ setGears(data)
モーダルが閉じる ←───────  setShowAddModal(false)
```

---

## データの型が全体を貫く

`Gear` 型（`src/types/index.ts`）は、どの層でも同じ型を使っています：

```
Firestore    → Gear（ドキュメントのスキーマ）
firestore/   → getGears(): Promise<Gear[]>  ← 型を保証して返す
useGears     → useState<Gear[]>             ← 型を持って管理
GearsPage    → const { gears } = useGears() ← Gear[] として扱う
GearCard     → gear: Gear（props）          ← 型を持って受け取る
```

TypeScript の型チェックにより、どこかで型が合わなければコンパイルエラーになります。

---

## コンポーネントツリー（全体像）

```
<RootLayout>              ← src/app/layout.tsx
  <AuthProvider>          ← 認証状態をグローバルに提供
    <AppLayout>           ← src/app/(app)/layout.tsx
      <SettingsProvider>  ← 設定をグローバルに提供
        <Header />
        <main>
          <GearsPage>     ← src/app/(app)/gears/page.tsx
            <Button />
            <CategoryFilter />
            <GearCard />  ← ×N（ギアの数だけ）
            <Modal>
              <GearForm />
            </Modal>
          </GearsPage>
        </main>
        <BottomNav />
      </SettingsProvider>
    </AppLayout>
  </AuthProvider>
</RootLayout>
```

---

## よくある「なぜ？」への答え

### Q: `useState` の値を直接変更してはいけないのはなぜ？

```typescript
// ❌ ダメ
gears.push(newGear)    // 配列を直接変更しても React は再描画しない

// ✅ 正しい
setGears([...gears, newGear])  // 新しい配列を渡すと React が再描画する
```

React は「前の状態と違う」と判断したとき再描画します。C言語のポインタを直接書き換えると、「変化を検知する仕組み」が働かないのと同じです。

### Q: `async/await` を忘れるとどうなる？

```typescript
// ❌ await を忘れると
addGearFS(userId, data)  // 書き込み中なのに次の行が実行される
await load()             // まだ書き込み完了していないのに読み込む → 新データが来ない

// ✅ 正しい
await addGearFS(userId, data)  // 書き込み完了を待ってから
await load()                   // 最新データを読み込む
```

### Q: `useCallback` の依存配列に何を書けばいい？

その関数の中で使っている「外の変数」を全部書きます：

```typescript
const addGear = useCallback(
  async (data) => {
    await addGearFS(user.uid, data)  // ← user を使っている
    await load()                     // ← load を使っている
  },
  [user, load]  // ← 使っている変数を依存配列に書く
)
```

---

## まとめ：各技術の担当範囲

```
TypeScript  ─ 全体の型安全を保証（間違いをコンパイル時に発見）
    ↓
React       ─ 状態管理と画面の自動更新
    ↓
Next.js     ─ URL とページの対応・共通レイアウト
    ↓
Firebase    ─ クラウド上のデータ永続化と認証
```

これでキャンプ用品管理アプリのコード全体が読めるようになりました！

---

## 索引（どこで何を使っているか）

| 機能 | ファイル | 使っている技術 |
|------|---------|-------------|
| ページ表示 | `src/app/(app)/gears/page.tsx` | Next.js, React, useState |
| ギア一覧 | `src/components/gears/GearCard.tsx` | React, props |
| データ管理 | `src/hooks/useGears.ts` | useState, useEffect, useCallback |
| DB 操作 | `src/lib/firestore/gears.ts` | Firebase Firestore |
| 認証 | `src/contexts/AuthContext.tsx` | Firebase Auth, useContext |
| 型定義 | `src/types/index.ts` | TypeScript |
| ルーティング | `src/app/(app)/layout.tsx` | Next.js, useRouter |
