import { readCms } from '../../utils/cms-store'
import { requireAdmin } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  return await readCms()
})
