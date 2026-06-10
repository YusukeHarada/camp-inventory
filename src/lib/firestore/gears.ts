import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Gear } from '@/types'

const COLLECTION = 'gears'

export async function getGears(userId: string): Promise<Gear[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  const gears = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gear))
  return gears.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

export async function addGear(
  userId: string,
  data: Omit<Gear, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export async function updateGear(
  id: string,
  data: Partial<Omit<Gear, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deleteGear(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
