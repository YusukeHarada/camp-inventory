# 第5章 Firebase — 認証とデータベース

## Firebase とは何か

Firebase は Google が提供する **クラウドサービス群** です。  
このアプリでは主に2つを使っています：

| サービス | 役割 | C言語でのイメージ |
|---------|------|----------------|
| **Firebase Auth** | ユーザー認証 | PAM / ログイン処理 |
| **Firestore** | NoSQL データベース | SQLite（ただしクラウド上） |

自前でサーバーを立てたり、ユーザー管理システムを作る必要がなく、「SDK（ライブラリ）を使うだけ」で動きます。

---

## Firebase の初期化

アプリ起動時に Firebase に接続します。SQLite で言えば `sqlite3_open()` に相当します：

```typescript
// src/lib/firebase.ts

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,    // 環境変数から取得
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
}

// Firebase アプリを初期化（1回だけ）
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// 認証オブジェクトを取得（グローバルに1つ）
export const auth = createAuth()

// Firestore（DB）オブジェクトを取得
export const db = createFirestore()
```

`process.env.NEXT_PUBLIC_FIREBASE_API_KEY` は `.env.local` というファイルに書いた環境変数です。  
C言語の `getenv("API_KEY")` と同じです。パスワードをソースコードに直書きしないための仕組みです。

---

## Firebase Auth — ユーザー認証

### Google ログイン

このアプリは Google アカウントでのログインだけをサポートしています：

```typescript
// src/contexts/AuthContext.tsx より
const signIn = async () => {
  const provider = new GoogleAuthProvider()      // Google 認証プロバイダー
  await signInWithPopup(auth, provider)          // ポップアップでログイン
}
// signInWithPopup が成功すると、onAuthStateChanged が呼ばれてユーザー情報が更新される
```

### 認証状態の監視

ページを開いたとき「ログイン済みかどうか」を Firebase に確認します：

```typescript
// src/contexts/AuthContext.tsx より
useEffect(() => {
  // Firebase に「ログイン状態が変わったら教えて」と登録
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    setUser(u)        // ユーザー情報をセット（null = 未ログイン）
    setLoading(false) // 確認完了
  })
  return unsubscribe  // コンポーネントが消えたとき監視を解除
}, [])
```

これにより：
- ページを開いたとき → 自動でログイン状態チェック
- ログイン済み → `user` にユーザー情報が入る
- 未ログイン → `user` が `null` → ログインページへリダイレクト

### ユーザー情報

ログイン後、`user` オブジェクトから情報を取得できます：

```typescript
const { user } = useAuth()

user.uid          // ユーザーの一意 ID（例："abc123xyz"）
user.email        // メールアドレス
user.displayName  // 表示名
```

`user.uid` は Firestore のデータと紐付けるキーとして使います（後述）。

---

## Firestore — NoSQL データベース

### SQL との違い

SQLite などの SQL データベースとの大きな違いは「**テーブルではなくコレクション（ドキュメント）**」の構造です：

```
SQL（テーブル）:
gears テーブル
| id     | userId | name       | category |
|--------|--------|------------|----------|
| gear1  | user1  | テント      | tent     |
| gear2  | user1  | チェア      | furniture|

Firestore（コレクション/ドキュメント）:
gears/            ← コレクション（テーブル相当）
  gear1/          ← ドキュメント（行相当）
    userId: "user1"
    name: "テント"
    category: "tent"
  gear2/
    userId: "user1"
    name: "チェア"
    category: "furniture"
```

各ドキュメントは JSON のような形式でデータを持ちます。

### コレクション構造（このアプリ）

```
gears/{gearId}      ← キャンプ用品
trips/{tripId}      ← キャンプの記録
tripGears/{id}      ← キャンプごとの持ち物
```

---

## Firestore の CRUD 操作

### Read（読み取り）

```typescript
// src/lib/firestore/gears.ts より

export async function getGears(userId: string): Promise<Gear[]> {
  const q = query(
    collection(db, 'gears'),    // gears コレクション
    where('userId', '==', userId)  // WHERE userId = 'xxx'
  )
  const snap = await getDocs(q)  // SELECT 実行
  const gears = snap.docs.map((d) => ({
    id: d.id,      // ドキュメント ID
    ...d.data()    // ドキュメントのフィールド全部
  } as Gear))
  return gears.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}
```

SQL で書くと：
```sql
SELECT id, userId, name, category, ...
FROM gears
WHERE userId = 'xxx'
ORDER BY createdAt DESC
```

### Create（作成）

```typescript
export async function addGear(
  userId: string,
  data: Omit<Gear, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'gears'), {
    ...data,
    userId,
    createdAt: Timestamp.now(),  // 現在時刻を自動設定
  })
  return ref.id  // Firebase が自動生成した ID を返す
}
```

SQL で書くと：
```sql
INSERT INTO gears (userId, name, category, ..., createdAt)
VALUES ('user1', 'テント', 'tent', ..., NOW())
RETURNING id
```

### Update（更新）

```typescript
export async function updateGear(
  id: string,
  data: Partial<Omit<Gear, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'gears', id), data)
}
```

SQL で書くと：
```sql
UPDATE gears SET name = '...', category = '...' WHERE id = 'gear1'
```

### Delete（削除）

```typescript
export async function deleteGear(id: string): Promise<void> {
  await deleteDoc(doc(db, 'gears', id))
}
```

SQL で書くと：
```sql
DELETE FROM gears WHERE id = 'gear1'
```

---

## セキュリティ — なぜ userId で絞り込むか

Firestore はクラウド上にあり、誰でもアクセスできるように見えますが、**セキュリティルール** で制限しています：

```
// Firebase セキュリティルール（Firestore Rules）
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gears/{gearId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      // ↑ ログイン中のユーザーIDと、ドキュメントの userId が一致するときだけ OK
    }
  }
}
```

さらにコード側でも `where('userId', '==', userId)` と絞り込んでいます：

```typescript
const q = query(
  collection(db, 'gears'),
  where('userId', '==', userId)  // 自分のデータだけ取得
)
```

これで「他人のデータが見える」「他人のデータを書き換えられる」というセキュリティ問題を防いでいます。

---

## 非同期処理と await

Firestore の操作は**ネットワーク通信**を伴うため、必ず `await` が必要です：

```typescript
// ❌ await を忘れると
const snap = getDocs(q)    // Promise オブジェクトが返る（まだデータがない）
const gears = snap.docs    // undefined になる

// ✅ await すると
const snap = await getDocs(q)  // データが来るまで待つ
const gears = snap.docs        // 正しくデータが入っている
```

C言語でのイメージ：

```c
// ❌ 完了を待たずに結果を使う（間違い）
int fd = open("file.txt", O_RDONLY);
// 非同期で読み込み開始...
char buf[100] = result;  // まだデータが来ていない！

// ✅ 完了を待って使う（正しい）
ssize_t n = read(fd, buf, sizeof(buf));  // 読み込み完了まで待つ
// これで buf にデータが入っている
```

---

## まとめ

| 操作 | Firestore | SQL |
|------|-----------|-----|
| 読み取り | `getDocs(query(...))` | `SELECT ... WHERE ...` |
| 作成 | `addDoc(collection, data)` | `INSERT INTO ...` |
| 更新 | `updateDoc(doc, data)` | `UPDATE ... SET ...` |
| 削除 | `deleteDoc(doc)` | `DELETE FROM ...` |
| 条件 | `where('field', '==', value)` | `WHERE field = value` |
| 並び替え | `orderBy('field', 'desc')` | `ORDER BY field DESC` |

次の章では、これまで学んだすべての概念がどうつながるかを、アプリ全体のデータフローで確認します。  
→ [第6章 データフロー](./06-data-flow.md)
