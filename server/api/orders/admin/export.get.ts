import { requireAdmin } from '../../../utils/admin-auth'
import { readOrdersSorted } from '../../../utils/orders-store'

function csvEscape(s: string) {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const orders = await readOrdersSorted()
  const headers = [
    'ref',
    'paidAt',
    'status',
    'total',
    'subtotal',
    'discount',
    'customerEmail',
    'customerPhone',
    'customerName',
    'lines',
  ]
  const rows = orders.map((o) => [
    o.ref,
    o.paidAt,
    o.status,
    String(o.total),
    String(o.subtotal),
    String(o.discount),
    o.customer?.email ?? '',
    o.customer?.phone ?? '',
    o.customer?.name ?? '',
    o.lines.map((l) => `${l.name} x${l.qty}`).join('; '),
  ])
  const lines = [headers.join(','), ...rows.map((r) => r.map((c) => csvEscape(String(c))).join(','))]
  const body = `\uFEFF${lines.join('\n')}\n`
  setHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setHeader(event, 'content-disposition', 'attachment; filename="waxtu-commandes.csv"')
  return body
})
