import type { Timestamp } from 'firebase/firestore'

export type GearCategory =
  | 'tent'
  | 'furniture'
  | 'kitchen'
  | 'lighting'
  | 'tools'
  | 'apparel'
  | 'other'

export type ConsumptionLevel = 'little' | 'half' | 'most' | 'all'

export type Gear = {
  id: string
  userId: string
  name: string
  category: GearCategory
  isRequired: boolean
  isConsumable: boolean
  memo?: string
  imageUrl?: string
  createdAt: Timestamp
}

export type CampTrip = {
  id: string
  userId: string
  name: string
  date: string
  location?: string
  memo?: string
  createdAt: Timestamp
}

export type TripGear = {
  id: string
  userId: string
  tripId: string
  gearId: string
  checked: boolean
  consumptionLevel?: ConsumptionLevel
}
