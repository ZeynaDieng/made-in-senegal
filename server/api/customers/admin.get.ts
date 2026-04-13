import { requireAdmin } from '../../utils/admin-auth'
import { listCustomersForAdmin } from '../../utils/customers-store'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const customers = await listCustomersForAdmin()
  return { customers }
})
