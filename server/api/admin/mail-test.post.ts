import { requireAdmin } from '../../utils/admin-auth'
import { sendMailPingToShop } from '../../utils/mail'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  await sendMailPingToShop()
  return { ok: true as const }
})
