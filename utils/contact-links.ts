/** Chiffres uniquement (indicatif pays inclus), pour `tel:` et wa.me. */
export function phoneDigitsOnly(raw: string): string {
  return String(raw ?? '').replace(/\D/g, '')
}

/** Lien `tel:` en E.164 (ex. +221784490808). */
export function contactTelHref(phone: string): string | null {
  const d = phoneDigitsOnly(phone)
  if (!d) return null
  return `tel:+${d}`
}

/** Ouverture WhatsApp Web / app avec le même numéro que la fiche contact. */
export function contactWhatsappHref(phone: string): string | null {
  const d = phoneDigitsOnly(phone)
  if (!d) return null
  return `https://wa.me/${d}`
}
