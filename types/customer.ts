export type WaxtuCustomer = {
  id: string
  email: string
  passwordHash: string
  favoriteProductIds: number[]
  loyaltyPoints: number
  createdAt: string
}

export type WaxtuCustomersFile = {
  version: 1
  customers: WaxtuCustomer[]
}

/** Ligne admin (sans secrets). */
export type AdminCustomerRow = {
  id: string
  email: string
  loyaltyPoints: number
  favoritesCount: number
  createdAt: string
}
