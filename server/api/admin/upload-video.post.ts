import { randomUUID } from 'node:crypto'
import { createError, readMultipartFormData } from 'h3'
import { requireAdmin } from '../../utils/admin-auth'
import { saveAdminUploadToPublic } from '../../utils/admin-upload-storage'

/** Limite serveur (ajustez l’hébergement si besoin). */
const MAX_BYTES = 80 * 1024 * 1024 // 80 Mo

const ALLOWED_MIME: Record<string, string> = {
  'video/mp4': '.mp4',
}

function extFromMime(mime: string): string | null {
  const m = mime.split(';')[0]?.trim().toLowerCase() ?? ''
  return ALLOWED_MIME[m] ?? null
}

function extFromFilename(name: string): string | null {
  return name.toLowerCase().endsWith('.mp4') ? '.mp4' : null
}

/** Boîte ISO « ftyp » (fichiers MP4 usuels). */
function bufferLooksLikeMp4(buf: Buffer): boolean {
  if (buf.length < 12) return false
  return buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70
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
      message: 'Format non accepté : MP4 uniquement (video/mp4).',
    })
  }

  if (!bufferLooksLikeMp4(file.data)) {
    throw createError({ statusCode: 400, message: 'Le fichier ne ressemble pas à une vidéo MP4 valide.' })
  }

  if (file.data.length > MAX_BYTES) {
    throw createError({
      statusCode: 400,
      message: `Vidéo trop volumineuse (max ${MAX_BYTES / 1024 / 1024} Mo).`,
    })
  }

  const name = `video-${randomUUID().replace(/-/g, '')}${ext}`
  const localPath = `/uploads/waxtu/${name}`
  const rawMime = (file.type || 'video/mp4').split(';')[0].trim() || 'video/mp4'
  const { url } = await saveAdminUploadToPublic({
    storageFileName: name,
    data: file.data,
    localPublicPath: localPath,
    contentType: rawMime,
    blobToken: String(config.blobReadWriteToken || '').trim(),
    /** Grosses vidéos : upload fragmenté côté Blob. */
    multipart: file.data.length > 8 * 1024 * 1024,
  })
  return { url }
})
