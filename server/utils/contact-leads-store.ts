import { createError } from 'h3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { WaxtuContactLead, WaxtuContactLeadsFile } from '../../types/contact-lead'
import { getSharedNeonClient } from './neon-client-cache'

const leadsPath = () => join(process.cwd(), '.data', 'waxtu-contact-leads.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

function emptyFile(): WaxtuContactLeadsFile {
  return { version: 1, leads: [] }
}

function isFilesystemReadonlyError(e: unknown): boolean {
  const code = (e as NodeJS.ErrnoException)?.code
  return code === 'EROFS' || code === 'EACCES' || code === 'EPERM'
}

function isMissingTableError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /does not exist|relation .+ waxtu_contact_leads/i.test(msg)
}

export async function readContactLeadsFile(): Promise<WaxtuContactLeadsFile> {
  try {
    const raw = await readFile(leadsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as WaxtuContactLeadsFile
    if (!parsed || !Array.isArray(parsed.leads)) return emptyFile()
    return {
      version: 1,
      leads: parsed.leads.filter((l) => l && typeof l.id === 'string' && typeof l.email === 'string'),
    }
  }
  catch {
    return emptyFile()
  }
}

export async function appendContactLead(lead: WaxtuContactLead): Promise<void> {
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      await sql`
        INSERT INTO waxtu_contact_leads (id, created_at, first_name, last_name, email, message)
        VALUES (
          ${lead.id},
          ${lead.createdAt}::timestamptz,
          ${lead.firstName},
          ${lead.lastName},
          ${lead.email},
          ${lead.message}
        )
      `
    }
    catch (e) {
      console.error('[waxtu] contact-leads neon insert', e)
      if (isMissingTableError(e)) {
        throw createError({
          statusCode: 503,
          statusMessage:
            'Table SQL absente : exécutez server/db/sql/000_neon_vercel_bootstrap.sql (ou 002_contact_leads.sql) dans Neon.',
        })
      }
      throw createError({ statusCode: 500, statusMessage: 'Enregistrement du message impossible.' })
    }
    return
  }

  const path = leadsPath()
  try {
    await ensureDir(path)
    const file = await readContactLeadsFile()
    file.leads.push(lead)
    await writeFile(path, JSON.stringify(file, null, 2), 'utf-8')
  }
  catch (e) {
    console.error('[waxtu] contact-leads file write', e)
    if (isFilesystemReadonlyError(e) || process.env.VERCEL) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'Impossible d’écrire sur le disque. Connectez Neon (DATABASE_URL) et exécutez server/db/sql/000_neon_vercel_bootstrap.sql.',
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Enregistrement du message impossible.' })
  }
}

export async function readContactLeadsSorted(): Promise<WaxtuContactLead[]> {
  const sql = getSharedNeonClient()
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, created_at, first_name, last_name, email, message
        FROM waxtu_contact_leads
        ORDER BY created_at DESC
      `
      return (rows as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        createdAt:
          r.created_at != null ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
        firstName: String(r.first_name),
        lastName: String(r.last_name),
        email: String(r.email),
        message: String(r.message),
      }))
    }
    catch (e) {
      if (isMissingTableError(e)) return []
      throw e
    }
  }

  const { leads } = await readContactLeadsFile()
  return [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
