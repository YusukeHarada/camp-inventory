# 第2章 React 基礎 — コンポーネントと JSX

## React とは何か

React は「画面（UI）を部品に分けて作る」ライブラリです。

HTML でページを作るとき、`<button>` や `<div>` などのタグを使います。  
React を使うと、自分で **カスタムタグ（コンポーネント）** を定義できます：

```html
<!-- 普通のHTML -->
<button class="btn btn-primary">追加</button>

<!-- React のカスタムコンポーネントを使う場合 -->
<Button variant="primary">追加</Button>
```

`<Button>` は自分で作った部品で、内部的には `<button>` タグに変換されます。

---

## コンポーネントの基本形

React のコンポーネントは **関数** です。

```typescript
// src/components/ui/Button.tsx（簡略版）

function Button({ children }) {
  return (
    <button className="rounded px-4 py-2 bg-blue-600 text-white">
      {children}
    </button>
  )
}
```

C言語で言えば：

```c
// C言語で「ボタンを描画する関数」を作るイメージ
void drawButton(const char *label) {
    printf("<button>%s</button>\n", label);
}
```

違いは：React のコンポーネントは HTML を文字列ではなく **構造（DOM）** として返し、ブラウザが効率よく更新できます。

---

## JSX — HTML に見える TypeScript

React のコンポーネントが返す部分（`return (...)` の中）は **JSX** と呼ばれます。  
見た目は HTML ですが、TypeScript として実行されます。

```typescript
// JSX（TypeScript の中に HTML 風の記法を埋め込む）
return (
  <div className="flex gap-3">
    <p>ギア名: {gear.name}</p>
    <Badge variant="warning">必須</Badge>
  </div>
)
```

**JSX の特徴：**
- HTML の `class` は JSX では `className`（`class` はTypeScriptの予約語）
- `{gear.name}` のように `{}` で TypeScript の式を埋め込める
- タグは必ず閉じる（`<br>` ではなく `<br />`）

---

## props — 関数の引数

コンポーネントへのデータの渡し方を **props**（プロパティ）と言います。  
C言語の関数の引数と同じ概念です。

```typescript
// src/components/gears/GearCard.tsx
type Props = {
  gear: Gear                    // Gear 型のデータ
  usageCount?: number           // 使用回数（省略可能）
  onEdit: (gear: Gear) => void  // 編集ボタンが押されたときに呼ぶ関数
  onDelete: (gear: Gear) => void
}

export function GearCard({ gear, usageCount, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <p className="font-medium">{gear.name}</p>
      {gear.isRequired && <Badge variant="warning">必須</Badge>}
      {usageCount !== undefined && (
        <span>{usageCount}回持参</span>
      )}
      <button onClick={() => onEdit(gear)}>編集</button>
      <button onClick={() => onDelete(gear)}>削除</button>
    </div>
  )
}
```

C言語との対比：

```c
// C言語の関数（引数でデータと処理を渡す）
void drawGearCard(
    const Gear *gear,
    int usageCount,
    void (*onEdit)(const Gear *),
    void (*onDelete)(const Gear *)
) {
    printf("<div>%s</div>", gear->name);
    // ボタンが押されたら onEdit(gear) を呼ぶ
}
```

**関数ポインタ（コールバック）** を渡す概念は全く同じです。  
TypeScript では `(gear: Gear) => void` が「Gear を受け取って戻り値なし」の関数型です。

---

## 条件付きレンダリング

JSX の中では `&&` や三項演算子で条件分岐できます：

```typescript
// GearCard.tsx より
{gear.isRequired && <Badge variant="warning">必須</Badge>}
// ↑ gear.isRequired が true のときだけ <Badge> を表示

{showGearImages && gear.imageUrl && (
  <img src={gear.imageUrl} alt={gear.name} />
)}
// ↑ 両方 true のときだけ画像を表示
```

C言語の `if` に相当します：

```c
if (gear->isRequired) {
    printf("<Badge>必須</Badge>");
}
```

---

## リストのレンダリング

配列をループして複数の要素を表示するには `.map()` を使います：

```typescript
// src/app/(app)/gears/page.tsx より
{filteredGears.map((gear) => (
  <GearCard
    key={gear.id}    // ← リストの各要素には key が必要
    gear={gear}
    onEdit={setEditingGear}
    onDelete={setDeletingGear}
  />
))}
```

C言語の `for` ループに相当：

```c
for (int i = 0; i < filteredGearsCount; i++) {
    drawGearCard(&filteredGears[i], onEdit, onDelete);
}
```

**`key` について：** React はリストが変化したとき、どの要素が変わったかを効率よく検出するために `key` を使います。ユニークな ID（`gear.id`）を使うのが最善です。

---

## コンポーネントの組み合わせ

小さな部品を組み合わせて大きなページを作ります：

```
GearsPage（ページ全体）
  ├── Button（追加ボタン）
  ├── CategoryFilter（カテゴリフィルタ）
  ├── GearCard × N（ギア一覧）
  │   ├── Badge（バッジ）
  │   └── button（編集・削除ボタン）
  └── Modal（ポップアップ）
      └── GearForm（フォーム）
```

これはC言語でモジュール分割するのと同じ発想です：
- `GearCard` は「ギアを1つ表示する責任」だけを持つ
- `GearsPage` は「ギア一覧ページ全体の制御」を担う

---

## 実際のコード：GearCard（全体）

```typescript
// src/components/gears/GearCard.tsx
'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { GEAR_CATEGORY_LABELS } from '@/lib/constants/categories'
import { useSettings } from '@/contexts/SettingsContext'
import type { Gear } from '@/types'

type Props = {
  gear: Gear
  usageCount?: number
  onEdit: (gear: Gear) => void
  onDelete: (gear: Gear) => void
}

export function GearCard({ gear, usageCount, onEdit, onDelete }: Props) {
  const { showGearImages } = useSettings()  // 設定からサムネイル表示フラグを取得

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {/* 設定で画像表示がONかつ画像URLがある場合だけ表示 */}
      {showGearImages && gear.imageUrl && (
        <img
          src={gear.imageUrl}
          alt={gear.name}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{gear.name}</p>
          {gear.isRequired && <Badge variant="warning">必須</Badge>}
          {gear.isConsumable && <Badge variant="primary">消耗品</Badge>}
          {gear.isConsumable && gear.stock !== undefined && (
            <Badge variant={gear.stock === 0 ? 'danger' : gear.stock <= 2 ? 'warning' : 'secondary'}>
              在庫 {gear.stock}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{GEAR_CATEGORY_LABELS[gear.category]}</Badge>
          {usageCount !== undefined && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{usageCount}回持参</span>
          )}
        </div>
        {gear.memo && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{gear.memo}</p>
        )}
      </div>
      {/* 編集・削除ボタン（アイコン） */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(gear)}      // クリック時に onEdit(gear) を呼ぶ
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title="編集"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(gear)}    // クリック時に onDelete(gear) を呼ぶ
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="削除"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
```

---

## Tailwind CSS — クラス名でスタイルを当てる

コードの `className="flex items-start gap-3 rounded-xl border..."` は **Tailwind CSS** の記法です。

通常の CSS：
```css
.card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  padding: 16px;
}
```

Tailwind CSS：
```html
<div class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
```

短いクラス名を組み合わせて書くだけでスタイルが当たります。  
HTML の `style="..."` の強化版と思ってください。

---

## まとめ

| 概念 | React | C言語 |
|------|-------|-------|
| 部品 | コンポーネント（関数） | 関数 |
| データの受け渡し | props | 関数の引数 |
| コールバック | `onClick={() => fn(gear)}` | 関数ポインタ |
| ループ | `.map()` | `for` ループ |
| 条件表示 | `{condition && <JSX />}` | `if` 文 |

次の章では、コンポーネントに **状態（変化するデータ）** を持たせる仕組みを説明します。  
→ [第3章 React フック](./03-react-hooks.md)
