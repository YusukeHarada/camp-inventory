# 第3章 React フック — 状態管理（最重要）

## フックとは何か

前の章で、コンポーネントは「関数」だと説明しました。  
しかし普通の関数では、ボタンを押すたびに関数が呼ばれ直しても **前回の値を覚えていられません**。

```typescript
// これはダメな例
function GearsPage() {
  let showModal = false              // 毎回 false にリセットされる

  return (
    <button onClick={() => { showModal = true }}>追加</button>
    // ↑ クリックしても画面は変わらない（showModal を変えても再描画されない）
  )
}
```

**フック** は React が提供する特別な関数で、コンポーネントに「状態」と「副作用」を持たせます。

---

## useState — 状態を持つ変数

`useState` は「変化したら画面を再描画する変数」を作ります。

```typescript
const [value, setValue] = useState(初期値)
//     ↑ 現在値   ↑ 更新関数
```

C言語の `static` 変数に似ていますが、値を更新すると **React が自動で画面を再描画** します：

```c
// C言語の static（値を覚えるが画面は自分で更新）
static int showModal = 0;

void onClick() {
    showModal = 1;
    redraw();  // 自分で再描画を呼ぶ必要がある
}
```

```typescript
// React の useState（値を覚えて、変更時に自動再描画）
const [showAddModal, setShowAddModal] = useState(false)

// クリックされたら
setShowAddModal(true)   // これだけで画面が自動で更新される
```

---

## 実際のコード：GearsPage の状態管理

```typescript
// src/app/(app)/gears/page.tsx より
export default function GearsPage() {
  const { gears, loading, addGear, updateGear, deleteGear } = useGears()

  // ── このページが持つ「状態」たち ──
  const [selectedCategory, setSelectedCategory] = useState<GearCategory | null>(null)
  // カテゴリフィルタ。null = 全表示、'tent' = テントだけ表示

  const [showAddModal, setShowAddModal] = useState(false)
  // 「追加」モーダルが開いているか

  const [editingGear, setEditingGear] = useState<Gear | null>(null)
  // 編集中のギア。null = 編集モーダルは閉じている

  const [deletingGear, setDeletingGear] = useState<Gear | null>(null)
  // 削除確認中のギア

  const [isDeleting, setIsDeleting] = useState(false)
  // 削除処理中か（ボタンをグレーアウトするため）

  const [formError, setFormError] = useState<string | null>(null)
  // フォームエラーメッセージ
```

全部で6つの状態を持っています。それぞれが独立していて、どれかが変わるとページが再描画されます。

---

## useEffect — 初期化・副作用

`useEffect` は「コンポーネントが画面に表示されたタイミング」などで処理を実行します。

C言語で言えば、`main()` 関数の先頭で行う初期化処理に相当します：

```c
// C言語（main で初期化）
int main() {
    Gear *gears = loadGearsFromDB();  // 起動時にDB読み込み
    // 以降、gears を使う
}
```

```typescript
// React（useEffect で初期化）
useEffect(() => {
  load()  // コンポーネントが表示されたらデータを読み込む
}, [load])
//  ↑ 依存配列：load が変わったときだけ実行
```

**依存配列 `[]` の意味：**

```typescript
useEffect(() => {
  load()
}, [])
// ↑ [] = 最初の1回だけ実行（マウント時のみ）

useEffect(() => {
  load()
}, [load])
// ↑ [load] = load 関数が変わったときに実行

useEffect(() => {
  load()
})
// ↑ 依存配列なし = 毎回の再描画で実行（危険！無限ループになりやすい）
```

---

## useEffect の実際の例：認証状態の監視

```typescript
// src/contexts/AuthContext.tsx より
useEffect(() => {
  // Firebase に「ログイン状態が変わったら教えて」と登録
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    setUser(u)        // ユーザー情報を更新
    setLoading(false) // ローディング終了
  })

  // コンポーネントが画面から消えたとき（クリーンアップ）
  return unsubscribe  // 「監視をやめる」関数を返す
}, [])
// ↑ [] = コンポーネントが最初に表示されたとき1回だけ登録
```

`return unsubscribe` はC言語の「後始末」に相当します：

```c
// C言語のイメージ
void init() {
    signal(SIGINT, handler);  // イベント監視を登録

    // プログラム終了時に解除
    atexit(cleanupSignalHandler);
}
```

---

## useCallback — 関数のメモ化

`useCallback` は「関数を毎回作り直さない」ようにするフックです。

```typescript
// src/hooks/useGears.ts より
const load = useCallback(async () => {
  if (!user) return
  setLoading(true)
  try {
    const data = await getGears(user.uid)
    setGears(data)
  } finally {
    setLoading(false)
  }
}, [user])
// ↑ user が変わらない限り、load 関数は同じオブジェクトを使い回す
```

**なぜ必要か？**

React では再描画のたびにコンポーネント関数が実行されます。  
毎回新しい `load` 関数が作られると、`useEffect` の依存配列 `[load]` が「変わった」と判断して、無限ループになります：

```
再描画 → load が新しい関数になる → useEffect が実行 → load() → データ更新
→ 再描画 → load が新しい関数になる → ... （無限ループ）
```

`useCallback` を使うと `[user]` が変わらない限り同じ `load` を使い回すので、無限ループを防げます。

---

## useContext — グローバル変数

`useContext` は「離れたコンポーネント間でデータを共有する」仕組みです。

C言語の `extern` 変数に相当します：

```c
// C言語（グローバル変数）
extern User *currentUser;  // どの.cファイルからでも使える

void someFunction() {
    printf("ログイン中: %s\n", currentUser->name);
}
```

```typescript
// React（useContext）
// どのコンポーネントからでも呼べる
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// 使う側
function GearCard({ gear }) {
  const { user } = useAuth()  // 認証情報をどこでも取得できる
  // ...
}
```

---

## Context の仕組み：Provider と Consumer

Context は「提供側（Provider）」と「受け取り側（Consumer）」の2つで動きます：

```typescript
// 提供側（src/contexts/AuthContext.tsx）
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // ...

  return (
    // Provider で囲んだすべての子コンポーネントが値を使える
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

```typescript
// 配置（src/app/layout.tsx）
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>   {/* ← ここで囲む */}
          {children}     {/* ← すべてのページが使える */}
        </AuthProvider>
      </body>
    </html>
  )
}
```

```typescript
// 受け取り側（任意のコンポーネントで）
function SomeComponent() {
  const { user, signIn, signOut } = useAuth()  // どこでも使える
}
```

---

## カスタムフック — 再利用可能なロジックのまとめ

`useGears.ts` のように、複数のフックをまとめた「カスタムフック」を作れます。

```typescript
// src/hooks/useGears.ts
export function useGears() {
  const { user } = useAuth()           // 認証情報を取得
  const [gears, setGears] = useState<Gear[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getGears(user.uid)  // DB からデータ取得
      setGears(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()  // 最初に読み込む
  }, [load])

  const addGear = useCallback(
    async (data: Omit<Gear, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return
      await addGearFS(user.uid, data)  // DB に追加
      await load()                     // 再読み込み
    },
    [user, load]
  )

  // updateGear, deleteGear も同じパターン...

  return { gears, loading, addGear, updateGear, deleteGear, reload: load }
}
```

使う側（ページ）はシンプルになります：

```typescript
// src/app/(app)/gears/page.tsx
export default function GearsPage() {
  const { gears, loading, addGear, updateGear, deleteGear } = useGears()
  // ↑ 1行でギアの全操作が使える
}
```

C言語で言えば、`gear_manager.h` に CRUD 関数をまとめて、`main.c` から呼ぶイメージです。

---

## フックの使用ルール

フックには重要なルールがあります：

1. **コンポーネント関数のトップレベルでのみ呼べる**（if・for・別の関数の中ではダメ）
2. **名前は必ず `use` で始まる**（`useState`, `useEffect`, `useGears` など）

```typescript
// ❌ ダメな例
function Component() {
  if (someCondition) {
    const [state, setState] = useState(0)  // if の中ではダメ
  }
}

// ✅ 正しい例
function Component() {
  const [state, setState] = useState(0)  // トップレベルに置く
  if (someCondition) {
    setState(1)  // 使うのは OK
  }
}
```

---

## まとめ

| フック | 役割 | C言語で言うと |
|-------|------|------------|
| `useState` | 変化する値を保持（変更時に再描画） | `static` 変数 + 再描画トリガー |
| `useEffect` | 初期化・副作用（マウント時など） | `main()` の初期化処理 |
| `useCallback` | 関数をメモ化（無限ループ防止） | 関数ポインタを再作成しない |
| `useContext` | グローバル状態を参照 | `extern` 変数 |
| カスタムフック | ロジックをまとめる | ライブラリ関数のまとめ |

次の章では、これらのコンポーネントをどうやってページのURLに対応させるか（ルーティング）を説明します。  
→ [第4章 Next.js](./04-nextjs.md)
