/**
 * Évite que GET /api/paytech/init soit traité comme une page Vue (404 « Page not found »).
 * L’init PayTech doit être appelée en POST uniquement (voir init.post.ts).
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Allow', 'POST')
  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed',
    message: 'POST uniquement : utilisez le bouton Payer sur /checkout (corps JSON items, refCommand, customer.email).',
  })
})
