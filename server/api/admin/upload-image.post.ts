import { randomUUID } from 'node:crypto'
import { createError, readMultipartFormData } from 'h3'
import { requireAdmin } from '../../utils/admin-auth'
import { saveAdminUploadToPublic } from '../../utils/admin-upload-storage'

const MAX_BYTES = 6 * 1024 * 1024 // 6 Mo

const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function extFromMime(mime: string): string | null {
  const m = mime.split(';')[0]?.trim().toLowerCase() ?? ''
  return ALLOWED[m] ?? null
}

function extFromFilename(name: string): string | null {
  const n = name.toLowerCase()
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return '.jpg'
  if (n.endsWith('.png')) return '.png'
  if (n.endsWith('.webp')) return '.webp'
  if (n.endsWith('.gif')) return '.gif'
  return null
}

function bufferMatchesImageExt(buf: Buffer, ext: string): boolean {
  if (buf.length < 12) return false
  if (ext === '.jpg') return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF
  if (ext === '.png') {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47
  }
  if (ext === '.gif') return buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46
  if (ext === '.webp') {
    return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  }
  return false
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.data?.length && p.filename)
  if (!file?.data) {
    throw createError({ statusCode: 400, message: 'Fichier « file » manquant' })
  }

  const rawType = (file.type || '').split(';')[0].trim().toLowerCase()
  const ext = extFromMime(rawType) ?? extFromFilename(file.filename || '')
  if (!ext) {
    throw createError({
      statusCode: 400,
      message: 'Format non accepté (JPEG, PNG, WebP ou GIF uniquement).',
    })
  }

  if (!bufferMatchesImageExt(file.data, ext)) {
    throw createError({ statusCode: 400, message: 'Le fichier ne correspond pas à une image valide.' })
  }

  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, message: `Fichier trop volumineux (max ${MAX_BYTES / 1024 / 1024} Mo).` })
  }

  const name = `${randomUUID().replace(/-/g, '')}${ext}`
  const localPath = `/uploads/waxtu/${name}`
  const rawMime = (file.type || 'application/octet-stream').split(';')[0].trim() || 'application/octet-stream'
  const { url } = await saveAdminUploadToPublic({
    storageFileName: name,
    data: file.data,
    localPublicPath: localPath,
    contentType: rawMime,
    blobToken: String(config.blobReadWriteToken || '').trim(),
  })
  return { url }
})
