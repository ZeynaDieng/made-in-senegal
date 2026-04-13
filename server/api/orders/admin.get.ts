import { requireAdmin } from '../../utils/admin-auth'
import { readOrdersSorted } from '../../utils/orders-store'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const query = getQuery(event)
  const limitRaw = Number(query.limit)
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(200, Math.floor(limitRaw)) : 100
  const orders = await readOrdersSorted()
  return { orders: orders.slice(0, limit), total: orders.length }
})
