export type WaxtuContactLead = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  message: string
}

export type WaxtuContactLeadsFile = {
  version: 1
  leads: WaxtuContactLead[]
}
