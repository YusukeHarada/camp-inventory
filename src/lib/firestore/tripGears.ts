import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TripGear } from '@/types'

const COLLECTION = 'tripGears'

export async function getTripGears(tripId: string, userId: string): Promise<TripGear[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('tripId', '==', tripId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TripGear))
}

export async function getTripGearsByUserId(userId: string): Promise<TripGear[]> {
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TripGear))
}

export async function addTripGear(
  userId: string,
  tripId: string,
  gearId: string
): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('tripId', '==', tripId),
      where('gearId', '==', gearId)
    )
  )
  if (!existing.empty) return existing.docs[0].id

  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    tripId,
    gearId,
    checked: false,
    quantity: 1,
    quantityUsed: 0,
  })
  return ref.id
}

export async function updateTripGearChecked(id: string, checked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { checked })
}

export async function updateTripGearQuantity(
  id: string,
  quantity: number,
  quantityUsed: number
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { quantity, quantityUsed })
}

export async function updateTripGearConsumption(
  id: string,
  consumptionLevel: import('@/types').ConsumptionLevel | null
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { consumptionLevel: consumptionLevel ?? null })
}

export async function deleteTripGear(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function deleteTripGearsByTripId(tripId: string, userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('tripId', '==', tripId)
  )
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export async function deleteTripGearsByGearId(gearId: string, userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('gearId', '==', gearId)
  )
  const snap = await getDocs(q)
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
