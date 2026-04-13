import { requireAdmin } from '../../../utils/admin-auth'
import { findOrderByRef } from '../../../utils/orders-store'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const ref = decodeURIComponent(String(getRouterParam(event, 'ref') ?? '')).trim()
  if (!ref) {
    throw createError({ statusCode: 400, statusMessage: 'Référence manquante' })
  }
  const order = await findOrderByRef(ref)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Commande introuvable' })
  }
  return order
})
