import { describe, expect, it } from 'vitest'
import { contactTelHref, contactWhatsappHref, phoneDigitsOnly } from './contact-links'

describe('contact-links', () => {
  it('extrait les chiffres du numéro affiché', () => {
    expect(phoneDigitsOnly('+221 78 449 08 08')).toBe('221784490808')
  })

  it('génère tel: et wa.me', () => {
    expect(contactTelHref('+221 78 449 08 08')).toBe('tel:+221784490808')
    expect(contactWhatsappHref('+221 78 449 08 08')).toBe('https://wa.me/221784490808')
  })
})
