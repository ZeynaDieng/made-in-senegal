import type { WaxtuCms } from '../../../types/cms'
import type { WaxtuStoredOrder } from '../../../types/orders'
import { requireAdmin } from '../../utils/admin-auth'
import { readCms } from '../../utils/cms-store'
import { listCustomersForAdmin } from '../../utils/customers-store'
import { readOrdersSorted } from '../../utils/orders-store'

function cmsStats(c: WaxtuCms) {
  const sectionsOn = c.sections?.filter((s) => s.enabled !== false).length ?? 0
  const forSale = c.products?.filter((p) => p.forSale && p.stock > 0).length ?? 0
  return {
    products: c.products?.length ?? 0,
    forSale,
    sections: c.sections?.length ?? 0,
    sectionsOn,
    promoOn: c.promotions?.active === true,
  }
}

function ordersSummary(orders: WaxtuStoredOrder[]) {
  const now = Date.now()
  const d30 = 30 * 24 * 60 * 60 * 1000
  const recent30 = orders.filter((o) => new Date(o.paidAt).getTime() > now - d30)
  const revenueAll = orders.reduce((s, o) => s + o.total, 0)
  const revenue30 = recent30.reduce((s, o) => s + o.total, 0)
  return {
    count: orders.length,
    count30: recent30.length,
    revenueAll,
    revenue30,
  }
}

function catalogAlerts(cms: WaxtuCms) {
  const low: { id: number; name: string; stock: number }[] = []
  const out: { id: number; name: string }[] = []
  for (const p of cms.products) {
    if (!p.forSale) continue
    if (p.stock <= 0) out.push({ id: p.id, name: p.name })
    else if (p.stock <= 3) low.push({ id: p.id, name: p.name, stock: p.stock })
  }
  return { lowStock: low, outOfStock: out }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })
  const cms = await readCms()
  const orders = await readOrdersSorted()
  const recentOrders = orders.slice(0, 8)
  const customers = await listCustomersForAdmin()
  const hasKey = !!String(config.resendApiKey || '').trim()
  const hasFrom = !!String(config.mailFrom || '').trim()
  const hasTo = !!String(config.mailToShop || '').trim()
  const mailConfigured = hasKey && hasFrom && hasTo
  const mailMissing: string[] = []
  if (!hasKey) mailMissing.push('NUXT_RESEND_API_KEY')
  if (!hasFrom) mailMissing.push('NUXT_MAIL_FROM')
  if (!hasTo) mailMissing.push('NUXT_MAIL_TO_SHOP')

  return {
    stats: cmsStats(cms),
    orders: ordersSummary(orders),
    recentOrders,
    alerts: catalogAlerts(cms),
    customers: {
      count: customers.length,
      recent: customers.slice(0, 8),
    },
    mail: {
      configured: mailConfigured,
      missing: mailMissing,
    },
  }
})
