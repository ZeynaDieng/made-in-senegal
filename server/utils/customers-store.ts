import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { AdminCustomerRow, WaxtuCustomer, WaxtuCustomersFile } from '../../types/customer'

const customersPath = () => join(process.cwd(), '.data', 'waxtu-customers.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

function emptyFile(): WaxtuCustomersFile {
  return { version: 1, customers: [] }
}

export async function readCustomersFile(): Promise<WaxtuCustomersFile> {
  try {
    const raw = await readFile(customersPath(), 'utf-8')
    const parsed = JSON.parse(raw) as WaxtuCustomersFile
    if (!parsed || !Array.isArray(parsed.customers)) return emptyFile()
    return {
      version: 1,
      customers: parsed.customers.filter((c) => c && typeof c.id === 'string' && typeof c.email === 'string'),
    }
  }
  catch {
    return emptyFile()
  }
}

export async function writeCustomersFile(file: WaxtuCustomersFile): Promise<void> {
  const path = customersPath()
  await ensureDir(path)
  await writeFile(path, JSON.stringify(file, null, 2), 'utf-8')
}

export async function findCustomerByEmail(email: string): Promise<WaxtuCustomer | undefined> {
  const e = email.trim().toLowerCase()
  const { customers } = await readCustomersFile()
  return customers.find((c) => c.email === e)
}

export async function findCustomerById(id: string): Promise<WaxtuCustomer | undefined> {
  const { customers } = await readCustomersFile()
  return customers.find((c) => c.id === id)
}

export async function upsertCustomer(customer: WaxtuCustomer): Promise<void> {
  const file = await readCustomersFile()
  const idx = file.customers.findIndex((c) => c.id === customer.id)
  if (idx === -1) file.customers.push(customer)
  else file.customers[idx] = customer
  await writeCustomersFile(file)
}

/** Points fidélité : +points (arrondi entier). */
export async function addLoyaltyPointsByEmail(email: string, points: number): Promise<void> {
  if (points <= 0) return
  const e = email.trim().toLowerCase()
  const file = await readCustomersFile()
  const c = file.customers.find((x) => x.email === e)
  if (!c) return
  c.loyaltyPoints = Math.max(0, Math.floor((c.loyaltyPoints ?? 0) + points))
  await writeCustomersFile(file)
}

/** Liste pour l’admin (sans hash mot de passe). */
export async function listCustomersForAdmin(): Promise<AdminCustomerRow[]> {
  const { customers } = await readCustomersFile()
  return customers
    .map((c) => ({
      id: c.id,
      email: c.email,
      loyaltyPoints: Math.max(0, Math.floor(c.loyaltyPoints ?? 0)),
      favoritesCount: Array.isArray(c.favoriteProductIds) ? c.favoriteProductIds.length : 0,
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : '',
    }))
    .sort((a, b) => {
      const ta = Date.parse(a.createdAt) || 0
      const tb = Date.parse(b.createdAt) || 0
      return tb - ta
    })
}
