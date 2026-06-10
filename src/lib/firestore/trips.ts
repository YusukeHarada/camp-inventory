import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CampTrip } from '@/types'

const COLLECTION = 'trips'

export async function getTrips(userId: string): Promise<CampTrip[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CampTrip))
}

export async function getTrip(id: string): Promise<CampTrip | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as CampTrip
}

export async function addTrip(
  userId: string,
  data: Omit<CampTrip, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export async function updateTrip(
  id: string,
  data: Partial<Omit<CampTrip, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deleteTrip(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
