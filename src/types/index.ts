import type { Timestamp } from 'firebase/firestore'

export type GearCategory =
  | 'tent-tarp'
  | 'bedding'
  | 'furniture'
  | 'cookware'
  | 'tableware'
  | 'fuel-ignition'
  | 'light-lantern'
  | 'coolerbox'
  | 'storage'
  | 'carry-cart'
  | 'battery'
  | 'air-conditioning'
  | 'field-gear'
  | 'apparel'
  | 'bag'
  | 'shoes'
  | 'other'

export type Gear = {
  id: string
  userId: string
  name: string
  category: GearCategory
  isRequired: boolean
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
}
