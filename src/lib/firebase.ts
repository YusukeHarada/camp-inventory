import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:placeholder',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// sessionStorage を避けて IndexedDB → localStorage の順で fallback する。
// これにより iOS Safari の ITP や Chrome のストレージ分離による
// "missing initial state" エラーを回避する。
function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    })
  } catch {
    // すでに初期化済みの場合は getAuth で取得
    return getAuth(app)
  }
}

export const auth = createAuth()
export const db = getFirestore(app)
