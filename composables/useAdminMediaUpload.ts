/**
 * Envoi d’image vers POST /api/admin/upload-image (auth Bearer admin).
 */
export async function uploadAdminMedia(file: File): Promise<string> {
  const token = import.meta.client ? localStorage.getItem('waxtu-admin-token') : null
  const body = new FormData()
  body.append('file', file)
  return (
    await $fetch<{ url: string }>('/api/admin/upload-image', {
      method: 'POST',
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  ).url
}

/**
 * Envoi d’une vidéo MP4 vers POST /api/admin/upload-video (auth Bearer admin, max 80 Mo).
 */
export async function uploadAdminVideo(file: File): Promise<string> {
  const token = import.meta.client ? localStorage.getItem('waxtu-admin-token') : null
  const body = new FormData()
  body.append('file', file)
  return (
    await $fetch<{ url: string }>('/api/admin/upload-video', {
      method: 'POST',
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  ).url
}
