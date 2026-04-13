import type { WaxtuCms } from '../../../types/cms'
import { normalizeCms, readCms, writeCms } from '../../utils/cms-store'
import { requireAdmin } from '../../utils/admin-auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const body = await readBody<WaxtuCms>(event)
  if (!body || body.version !== 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid CMS payload' })
  }
  await writeCms(normalizeCms(body))
  return await readCms()
})
