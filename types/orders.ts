/** Ligne telle qu’enregistrée au moment du paiement (prix figés). */
export interface WaxtuOrderLine {
  productId: number
  name: string
  qty: number
  unitPrice: number
  /** qty * unitPrice (avant remise globale). */
  lineSubtotal: number
}

export type WaxtuOrderStatus = 'paid' | 'fulfilled' | 'cancelled'

export interface WaxtuOrderCustomer {
  email?: string
  phone?: string
  name?: string
}

/** Métadonnées PayTech non sensibles (support / suivi). */
export interface WaxtuOrderPaytechMeta {
  paymentMethod?: string
  token?: string
  typeEvent?: string
}

export interface WaxtuStoredOrder {
  version: 1
  /** Même identifiant que `ref_command` / checkout (`WAXTU-…`). */
  ref: string
  status: WaxtuOrderStatus
  currency: 'XOF'
  /** Date/heure réception IPN valide (ISO 8601). */
  paidAt: string
  subtotal: number
  discount: number
  total: number
  lines: WaxtuOrderLine[]
  customer?: WaxtuOrderCustomer
  /** Note interne (éditable depuis l’admin). */
  adminNote?: string
  paytechMeta?: WaxtuOrderPaytechMeta
}

export interface WaxtuOrdersFile {
  version: 1
  orders: WaxtuStoredOrder[]
}

export type WaxtuOrderPatch = {
  status?: WaxtuOrderStatus
  adminNote?: string
}
