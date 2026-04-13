import { getCustomerFromEvent } from '../../utils/customer-from-event'

export default defineEventHandler(async (event) => {
  const c = await getCustomerFromEvent(event)
  if (!c) return { customer: null }
  return {
    customer: {
      id: c.id,
      email: c.email,
      favoriteProductIds: c.favoriteProductIds,
      loyaltyPoints: c.loyaltyPoints,
    },
  }
})
