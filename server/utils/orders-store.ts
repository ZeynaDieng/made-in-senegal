import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { WaxtuOrderPatch, WaxtuOrderStatus, WaxtuOrdersFile, WaxtuStoredOrder } from '../../types/orders'

const ordersPath = () => join(process.cwd(), '.data', 'waxtu-orders.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

function emptyFile(): WaxtuOrdersFile {
  return { version: 1, orders: [] }
}

function normalizeOrder(o: WaxtuStoredOrder): WaxtuStoredOrder {
  const status = (o.status ?? 'paid') as WaxtuOrderStatus
  return { ...o, version: 1, status }
}

export async function readOrdersFile(): Promise<WaxtuOrdersFile> {
  try {
    const raw = await readFile(ordersPath(), 'utf-8')
    const parsed = JSON.parse(raw) as WaxtuOrdersFile
    if (!parsed || !Array.isArray(parsed.orders)) return emptyFile()
    return {
      version: 1,
      orders: parsed.orders
        .filter((o) => o && typeof o.ref === 'string')
        .map((o) => normalizeOrder(o as WaxtuStoredOrder)),
    }
  }
  catch {
    return emptyFile()
  }
}

export async function readOrdersSorted(): Promise<WaxtuStoredOrder[]> {
  const { orders } = await readOrdersFile()
  return [...orders].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
  )
}

export async function findOrderByRef(ref: string): Promise<WaxtuStoredOrder | undefined> {
  if (!ref) return undefined
  const { orders } = await readOrdersFile()
  return orders.find((o) => o.ref === ref)
}

/** @returns true si la commande a été ajoutée (pas doublon). */
export async function appendPaidOrder(order: WaxtuStoredOrder): Promise<boolean> {
  const path = ordersPath()
  await ensureDir(path)
  const file = await readOrdersFile()
  if (file.orders.some((o) => o.ref === order.ref)) return false
  file.orders.push(normalizeOrder(order))
  await writeFile(path, JSON.stringify(file, null, 2), 'utf-8')
  return true
}

export async function patchOrderByRef(ref: string, patch: WaxtuOrderPatch): Promise<WaxtuStoredOrder | null> {
  if (!ref) return null
  const path = ordersPath()
  const file = await readOrdersFile()
  const idx = file.orders.findIndex((o) => o.ref === ref)
  if (idx < 0) return null
  const cur = file.orders[idx]!
  const next: WaxtuStoredOrder = {
    ...cur,
    ...(patch.status != null ? { status: patch.status } : {}),
    ...(patch.adminNote !== undefined ? { adminNote: patch.adminNote } : {}),
  }
  file.orders[idx] = normalizeOrder(next)
  await ensureDir(path)
  await writeFile(path, JSON.stringify(file, null, 2), 'utf-8')
  return file.orders[idx]!
}

export type { WaxtuOrderPatch } from '../../types/orders'
