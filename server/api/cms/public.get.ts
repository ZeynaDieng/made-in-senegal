import { defaultCms } from '../../../data/default-cms'
import type { WaxtuCms } from '../../../types/cms'
import { readCms } from '../../utils/cms-store'
import { filterSellableProducts } from '../../utils/storefront'

/** Si le CMS n’a aucune section active (ex. admin), on garde la landing maquette. */
function ensurePublicLanding(cms: WaxtuCms): WaxtuCms {
  /** `enabled` absent = visible ; seul `false` désactive. */
  const hasVisible = cms.sections?.some((s) => s.enabled !== false)
  if (hasVisible) return cms
  return {
    ...cms,
    sections: structuredClone(defaultCms.sections),
  }
}

export default defineEventHandler(async () => {
  const cms = await readCms()
  return ensurePublicLanding(filterSellableProducts(cms))
})
