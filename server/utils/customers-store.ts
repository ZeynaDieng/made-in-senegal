import { createError } from 'h3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { AdminCustomerRow, WaxtuCustomer, WaxtuCustomersFile } from '../../types/customer'
import { getSharedNeonClient } from './neon-client-cache'

const customersPath = () => join(process.cwd(), '.data', 'waxtu-customers.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

function emptyFile(): WaxtuCustomersFile {
  return { version: 1, customers: [] }
}

function isFilesystemReadonlyError(e: unknown): boolean {
  const code = (e as NodeJS.ErrnoException)?.code
  return code === 'EROFS' || code === 'EACCES' || code === 'EPERM'
}

function isMissingTableError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /does not exist|relation .+ waxtu_customers/i.test(msg)
}

function rowToCustomer(r: Record<string, unknown>): WaxtuCustomer {
  const rawFavs = r.favorite_product_ids
  const favoriteProductIds = Array.isArray(rawFavs)
    ? rawFavs.map((x) => Number(x)).filter((n) => Number.isFinite(n))
    : typeof rawFavs === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(rawFavs)
            return Array.isArray(parsed) ? parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : []
          }
          catch {
            return []
          }
        })()
      : []

  return {
    id: String(r.id ?? ''),
    email: String(r.email ?? '').toLowerCase(),
    passwordHash: String(r.password_hash ?? ''),
    favoriteProductIds,
    loyaltyPoints: Math.max(0, Math.floor(Number(r.loyalty_points ?? 0) || 0)),
    createdAt:
      r.created_at != null ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
  }
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
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash, favorite_product_ids, loyalty_points, created_at
        FROM waxtu_customers
        WHERE email = ${e}
        LIMIT 1
      `
      const r = rows[0] as Record<string, unknown> | undefined
      return r ? rowToCustomer(r) : undefined
    }
    catch (err) {
      console.error('[waxtu] customers neon find by email', err)
      if (isMissingTableError(err)) {
        throw createError({
          statusCode: 503,
          statusMessage:
            'Table SQL absente : exécutez server/db/sql/003_customers.sql dans Neon (ou 000_neon_vercel_bootstrap.sql mis à jour).',
        })
      }
      throw createError({ statusCode: 500, statusMessage: 'Lecture du compte impossible.' })
    }
  }

  const { customers } = await readCustomersFile()
  return customers.find((c) => c.email === e)
}

export async function findCustomerById(id: string): Promise<WaxtuCustomer | undefined> {
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash, favorite_product_ids, loyalty_points, created_at
        FROM waxtu_customers
        WHERE id = ${id}
        LIMIT 1
      `
      const r = rows[0] as Record<string, unknown> | undefined
      return r ? rowToCustomer(r) : undefined
    }
    catch (err) {
      console.error('[waxtu] customers neon find by id', err)
      if (isMissingTableError(err)) return undefined
      throw createError({ statusCode: 500, statusMessage: 'Lecture du compte impossible.' })
    }
  }

  const { customers } = await readCustomersFile()
  return customers.find((c) => c.id === id)
}

export async function upsertCustomer(customer: WaxtuCustomer): Promise<void> {
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      await sql`
        INSERT INTO waxtu_customers (id, email, password_hash, favorite_product_ids, loyalty_points, created_at)
        VALUES (
          ${customer.id},
          ${customer.email},
          ${customer.passwordHash},
          ${JSON.stringify(customer.favoriteProductIds ?? [])}::jsonb,
          ${Math.max(0, Math.floor(customer.loyaltyPoints ?? 0))},
          ${customer.createdAt}::timestamptz
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          favorite_product_ids = EXCLUDED.favorite_product_ids,
          loyalty_points = EXCLUDED.loyalty_points,
          created_at = EXCLUDED.created_at
      `
      return
    }
    catch (err) {
      console.error('[waxtu] customers neon upsert', err)
      if (isMissingTableError(err)) {
        throw createError({
          statusCode: 503,
          statusMessage:
            'Table SQL absente : exécutez server/db/sql/003_customers.sql dans Neon (ou 000_neon_vercel_bootstrap.sql mis à jour).',
        })
      }
      throw createError({ statusCode: 500, statusMessage: 'Création du compte impossible.' })
    }
  }

  const file = await readCustomersFile()
  const idx = file.customers.findIndex((c) => c.id === customer.id)
  if (idx === -1) file.customers.push(customer)
  else file.customers[idx] = customer
  try {
    await writeCustomersFile(file)
  }
  catch (err) {
    console.error('[waxtu] customers file write', err)
    if (isFilesystemReadonlyError(err) || process.env.VERCEL) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'Impossible d’écrire sur le disque. Connectez Neon (DATABASE_URL) et exécutez server/db/sql/003_customers.sql.',
      })
    }
    throw err
  }
}

/** Points fidélité : +points (arrondi entier). */
export async function addLoyaltyPointsByEmail(email: string, points: number): Promise<void> {
  if (points <= 0) return
  const e = email.trim().toLowerCase()
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      await sql`
        UPDATE waxtu_customers
        SET loyalty_points = GREATEST(0, COALESCE(loyalty_points, 0) + ${Math.floor(points)})
        WHERE email = ${e}
      `
    }
    catch (err) {
      console.error('[waxtu] customers neon add points', err)
      if (isMissingTableError(err)) return
      throw err
    }
    return
  }

  const file = await readCustomersFile()
  const c = file.customers.find((x) => x.email === e)
  if (!c) return
  c.loyaltyPoints = Math.max(0, Math.floor((c.loyaltyPoints ?? 0) + points))
  await writeCustomersFile(file)
}

/** Liste pour l’admin (sans hash mot de passe). */
export async function listCustomersForAdmin(): Promise<AdminCustomerRow[]> {
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, email, favorite_product_ids, loyalty_points, created_at
        FROM waxtu_customers
        ORDER BY created_at DESC
      `
      return (rows as Record<string, unknown>[]).map((r) => {
        const favs = rowToCustomer({ ...r, password_hash: '' }).favoriteProductIds
        return {
          id: String(r.id ?? ''),
          email: String(r.email ?? ''),
          loyaltyPoints: Math.max(0, Math.floor(Number(r.loyalty_points ?? 0) || 0)),
          favoritesCount: favs.length,
          createdAt:
            r.created_at != null ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
        }
      })
    }
    catch (err) {
      if (isMissingTableError(err)) return []
      throw err
    }
  }

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
