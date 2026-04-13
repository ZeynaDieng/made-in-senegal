import type { WaxtuOrderStatus } from '../../../../types/orders'
import { requireAdmin } from '../../../utils/admin-auth'
import { findOrderByRef, patchOrderByRef } from '../../../utils/orders-store'

const ALLOWED: WaxtuOrderStatus[] = ['paid', 'fulfilled', 'cancelled']

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
  const existing = await findOrderByRef(ref)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Commande introuvable' })
  }

  const body = await readBody<{ status?: WaxtuOrderStatus; adminNote?: string }>(event).catch(() => ({}))
  const status = body.status
  const adminNote = body.adminNote

  if (status != null && !ALLOWED.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Statut invalide' })
  }
  if (status == null && adminNote === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune modification' })
  }

  const updated = await patchOrderByRef(ref, {
    ...(status != null ? { status } : {}),
    ...(adminNote !== undefined ? { adminNote: String(adminNote) } : {}),
  })
  return updated
})
