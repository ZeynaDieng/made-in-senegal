import { defaultCms } from '../data/default-cms'
import type { WaxtuCms } from '../types/cms'

export function usePublicCms() {
  return useAsyncData<WaxtuCms>(
    'waxtu-cms-public',
    async () => {
      try {
        return await $fetch<WaxtuCms>('/api/cms/public')
      }
      catch {
        return structuredClone(defaultCms)
      }
    },
    { server: true },
  )
}
