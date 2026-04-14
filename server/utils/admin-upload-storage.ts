import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { put } from '@vercel/blob'
import { createError } from 'h3'

/** Vercel injecte `BLOB_READ_WRITE_TOKEN` quand un store Blob est lié au projet. */
export function readAdminBlobTokenFromEnv(): string {
  return String(process.env.BLOB_READ_WRITE_TOKEN || process.env.NUXT_BLOB_READ_WRITE_TOKEN || '').trim()
}

function isReadOnlyFsError(e: unknown): boolean {
  const c = e as { code?: string; message?: string }
  return c?.code === 'EROFS'
    || c?.code === 'EPERM'
    || /read-only|EROFS/i.test(String(c?.message ?? e))
}

export type SaveAdminUploadOpts = {
  storageFileName: string
  data: Buffer
  /** URL retournée si stockage local (`public/uploads/waxtu/…`). */
  localPublicPath: string
  contentType: string
  /** Vercel Blob : recommandé pour les gros fichiers (ex. vidéo). */
  multipart?: boolean
  /** Si vide : `BLOB_READ_WRITE_TOKEN` / `NUXT_BLOB_READ_WRITE_TOKEN` / `runtimeConfig.blobReadWriteToken` (passé par l’appelant). */
  blobToken?: string
}

/**
 * Enregistre un fichier média admin : Vercel Blob si token présent, sinon `public/uploads/waxtu/`.
 * Sur Vercel sans Blob, le disque est en lecture seule → erreur 503 explicite.
 */
export async function saveAdminUploadToPublic(opts: SaveAdminUploadOpts): Promise<{ url: string }> {
  const token = String(opts.blobToken || readAdminBlobTokenFromEnv()).trim()
  if (token) {
    try {
      const pathname = `waxtu/${opts.storageFileName}`
      const blob = await put(pathname, opts.data, {
        access: 'public',
        token,
        contentType: opts.contentType,
        addRandomSuffix: false,
        multipart: opts.multipart === true,
      })
      return { url: blob.url }
    }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      throw createError({
        statusCode: 502,
        statusMessage: `Échec envoi stockage Blob : ${msg.slice(0, 220)}`,
      })
    }
  }

  const dir = join(process.cwd(), 'public', 'uploads', 'waxtu')
  await mkdir(dir, { recursive: true })
  const abs = join(dir, opts.storageFileName)
  try {
    await writeFile(abs, opts.data)
  }
  catch (e: unknown) {
    if (isReadOnlyFsError(e)) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'Impossible d\'écrire les fichiers (disque en lecture seule). Sur Vercel : Storage → Blob, liez un store au projet et définissez BLOB_READ_WRITE_TOKEN (ou NUXT_BLOB_READ_WRITE_TOKEN).',
      })
    }
    throw e
  }
  return { url: opts.localPublicPath }
}
