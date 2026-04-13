import type { H3Event } from 'h3'
import type { WaxtuCustomer } from '../../types/customer'
import { verifyCustomerJwt } from './customer-jwt'
import { findCustomerById } from './customers-store'
import { readCustomerTokenFromEvent } from './customer-session-cookie'

export async function getCustomerFromEvent(event: H3Event): Promise<WaxtuCustomer | null> {
  const config = useRuntimeConfig()
  const secret = String(config.customerSessionSecret || '').trim()
  if (!secret) return null
  const token = readCustomerTokenFromEvent(event)
  if (!token) return null
  const v = verifyCustomerJwt(token, secret)
  if (!v) return null
  const c = await findCustomerById(v.customerId)
  if (!c || c.email !== v.email) return null
  return c
}
