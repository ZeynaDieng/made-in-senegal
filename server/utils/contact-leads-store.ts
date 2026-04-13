import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { WaxtuContactLead, WaxtuContactLeadsFile } from '../../types/contact-lead'

const leadsPath = () => join(process.cwd(), '.data', 'waxtu-contact-leads.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

function emptyFile(): WaxtuContactLeadsFile {
  return { version: 1, leads: [] }
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
  const path = leadsPath()
  await ensureDir(path)
  const file = await readContactLeadsFile()
  file.leads.push(lead)
  await writeFile(path, JSON.stringify(file, null, 2), 'utf-8')
}

export async function readContactLeadsSorted(): Promise<WaxtuContactLead[]> {
  const { leads } = await readContactLeadsFile()
  return [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
