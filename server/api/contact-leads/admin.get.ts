import { requireAdmin } from '../../utils/admin-auth'
import { readContactLeadsSorted } from '../../utils/contact-leads-store'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const leads = await readContactLeadsSorted()
  return { leads, total: leads.length }
})
