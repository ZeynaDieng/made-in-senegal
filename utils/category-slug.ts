import type { CmsCategory } from '../types/cms'

export function slugifyCategoryId(name: string): string {
  const base = String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'categorie'
  return base.slice(0, 48)
}

export function uniqueCategoryId(name: string, existing: CmsCategory[]): string {
  let id = slugifyCategoryId(name)
  let n = 0
  while (existing.some((c) => c.id === id)) {
    n++
    id = `${slugifyCategoryId(name)}-${n}`
  }
  return id
}
