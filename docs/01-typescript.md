# 第1章 TypeScript — 型のある JavaScript

## TypeScript とは何か

JavaScript（ブラウザで動くプログラミング言語）に **型チェック** を追加したものです。

C言語では変数の型を必ず書きますが、JavaScript はもともと型がありません：

```javascript
// JavaScript（型なし）
let x = 42        // 数値
x = "hello"       // 文字列に変えても OK（エラーにならない）
x = true          // 真偽値でも OK
```

TypeScript ではこれをC言語に近い形でエラーにできます：

```typescript
// TypeScript（型あり）
let x: number = 42
x = "hello"       // ❌ コンパイルエラー！ number に string は代入できない
```

---

## 基本的な型

| TypeScript | C言語の対応 | 例 |
|-----------|------------|-----|
| `string` | `char *` / `char[]` | `"テント"` |
| `number` | `int` / `double` | `42`, `3.14` |
| `boolean` | `_Bool` / `int` | `true`, `false` |
| `null` | `NULL` | `null` |
| `undefined` | 初期化前の変数 | `undefined` |

---

## type — C言語の struct に相当

C言語では構造体でデータをまとめます：

```c
// C言語
typedef struct {
    char *id;
    char *userId;
    char *name;
    char *category;
    int   isRequired;  // _Bool
    int   isConsumable;
} Gear;
```

TypeScript では `type` で同じことができます：

```typescript
// src/types/index.ts
export type Gear = {
  id: string
  userId: string
  name: string
  category: GearCategory    // 別の型を使える（後述）
  isRequired: boolean
  isConsumable: boolean
  stock?: number            // ? は「省略可能」を意味する（C言語にはない概念）
  memo?: string
  imageUrl?: string
  createdAt: Timestamp      // Firebase の日時型
}
```

**`?` マーク（省略可能な項目）：**  
`stock?: number` の `?` は「この項目がない場合もある」を意味します。  
C言語ではポインタを `NULL` にすることで似た表現をします：

```c
// C言語で省略可能を表現
struct Gear {
    int   *stock;   // NULL なら「値なし」
};

// TypeScript では型レベルで表現できる
type Gear = {
  stock?: number   // undefined または number
}
```

---

## ユニオン型 — 取りうる値を限定する

```typescript
// src/types/index.ts
export type GearCategory =
  | 'tent'       // テント
  | 'furniture'  // 家具
  | 'kitchen'    // キッチン
  | 'lighting'   // ライト
  | 'tools'      // 道具
  | 'apparel'    // ウェア
  | 'other'      // その他
```

これは C言語の `enum` に相当します：

```c
// C言語
typedef enum {
    CATEGORY_TENT,
    CATEGORY_FURNITURE,
    CATEGORY_KITCHEN,
    CATEGORY_LIGHTING,
    CATEGORY_TOOLS,
    CATEGORY_APPAREL,
    CATEGORY_OTHER
} GearCategory;
```

TypeScript のユニオン型は文字列そのものを使えるので、デバッグ時に値が読みやすいという利点があります。

---

## Omit と Partial — 型の変形

TypeScript では既存の型から「一部だけ変えた型」を作れます。

**Omit — 特定のフィールドを除く：**

```typescript
// Gear から id, userId, createdAt を除いた型
type GearInput = Omit<Gear, 'id' | 'userId' | 'createdAt'>

// これは以下と同じ意味
type GearInput = {
  name: string
  category: GearCategory
  isRequired: boolean
  isConsumable: boolean
  stock?: number
  memo?: string
  imageUrl?: string
}
```

実際にこのアプリで使っている場所（`src/lib/firestore/gears.ts`）：

```typescript
export async function addGear(
  userId: string,
  data: Omit<Gear, 'id' | 'userId' | 'createdAt'>  // ← id は DB が自動生成するので不要
): Promise<string> {
  // ...
}
```

**Partial — 全フィールドを省略可能にする：**

```typescript
// Gear の全フィールドが省略可能になった型
type GearUpdate = Partial<Omit<Gear, 'id' | 'userId' | 'createdAt'>>

// 使い方：更新したいフィールドだけ渡せばよい
await updateGear(id, { name: "新しい名前" })  // name だけ更新
```

---

## import / export — C言語の #include に相当

C言語：
```c
#include <stdio.h>
#include "gear.h"
```

TypeScript：
```typescript
// src/hooks/useGears.ts から
import type { Gear } from '@/types'
import { getGears, addGear } from '@/lib/firestore/gears'
```

**違い：**
- `import type` は型定義だけをインポート（実行時のコードは不要）
- `@/` は `src/` を意味するショートカット（設定で定義）
- C言語の `#include` と違い、必要なものだけ選んでインポートできる

---

## async / await — 非同期処理

TypeScript（と JavaScript）では、時間のかかる処理を **非同期**で行います。  
Firestore への読み書きはネットワーク通信なので、完了を待つ必要があります。

```c
// C言語（同期：処理が終わるまで止まる）
Gear *gears = sqlite3_query("SELECT ...");  // 完了まで待つ
printf("取得完了\n");
```

```typescript
// TypeScript（非同期：async/await で同期的に書ける）
async function loadGears() {
  const gears = await getGears(userId)  // 完了まで「待つ」と明示
  console.log("取得完了")
}
```

`await` がない場合、処理が完了する前に次の行が実行されてしまいます。  
C言語で `pthread_join()` を使わずにスレッドの結果を使おうとするのと似た問題が起きます。

---

## Promise — 「後で結果が来る」型

```typescript
// src/lib/firestore/gears.ts
export async function addGear(...): Promise<string> {
  // ...
  return ref.id  // string を返す（が非同期なのでラップされる）
}
```

`Promise<string>` は「いずれ `string` が手に入る」という型です。  
C言語にはない概念ですが、「ファイルを非同期で読む場合、結果はコールバックで受け取る」という感覚に近いです。

---

## まとめ

| 概念 | TypeScript | C言語 |
|------|-----------|-------|
| データ構造 | `type Gear = {...}` | `typedef struct {...} Gear;` |
| 選択肢を限定 | `type S = 'a' \| 'b'` | `enum {...}` |
| 省略可能 | `field?: string` | `char *field` (NULL チェック) |
| 型の変形 | `Omit<T, K>` | 手動で新しい struct を書く |
| 外部コードの利用 | `import { X } from './y'` | `#include "y.h"` |
| 非同期処理 | `async/await` | `pthread` + コールバック |

次の章では、この型定義を使って実際に画面を作る **React** について説明します。  
→ [第2章 React 基礎](./02-react-basics.md)
