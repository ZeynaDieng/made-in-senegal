import { createError, readBody } from 'h3'
import { getCustomerFromEvent } from '../../utils/customer-from-event'
import { upsertCustomer } from '../../utils/customers-store'

export default defineEventHandler(async (event) => {
  const c = await getCustomerFromEvent(event)
  if (!c) {
    throw createError({ statusCode: 401, statusMessage: 'Connexion requise' })
  }

  const body = await readBody<{ productId?: number; action?: 'add' | 'remove' }>(event).catch(
    () => ({} as { productId?: number; action?: 'add' | 'remove' }),
  )
  const productId = Number(body.productId)
  const action = body.action
  if (!Number.isFinite(productId) || productId <= 0 || (action !== 'add' && action !== 'remove')) {
    throw createError({ statusCode: 400, statusMessage: 'productId et action (add|remove) requis' })
  }

  const set = new Set(c.favoriteProductIds)
  if (action === 'add') set.add(Math.floor(productId))
  else set.delete(Math.floor(productId))

  const next = { ...c, favoriteProductIds: [...set].sort((a, b) => a - b) }
  await upsertCustomer(next)

  return {
    ok: true,
    favoriteProductIds: next.favoriteProductIds,
  }
})
