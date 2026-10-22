import { expect, test } from 'vitest'
import { BESCHWERDE_BETREFF, beschwerdeHref, beschwerdeLink, e164, mailHref, telHref, whatsappHref } from './contact'

test('österreichische Nummern werden zu E.164', () => {
  expect(e164('0660 123 45 67')).toBe('436601234567')
  expect(e164('+43 660 1234567')).toBe('436601234567')
  expect(e164('0043 (660) 123-45-67')).toBe('436601234567')
  expect(e164('01 234 56 78')).toBe('4312345678')
  expect(e164('[Telefonnummer]')).toBe('')
})

test('Links mit den echten Kontaktdaten', () => {
  expect(telHref).toBe('tel:+436764777700')
  expect(whatsappHref).toBe('https://wa.me/436764777700?text=Hallo%20fixit247%2C%20ich%20brauche%20Hilfe%3A%20')
  expect(mailHref).toBe('mailto:office@fixit247.at')
})

test('Beschwerde-Link (M8): echte Adresse mit kodiertem Betreff, Platzhalter nur „mailto:“', () => {
  const link = beschwerdeLink('maria@beispiel.at')
  expect(link).toBe('mailto:maria@beispiel.at?subject=Beschwerde%20zu%20Anfrage%20')
  expect(new URL(link).searchParams.get('subject')).toBe(BESCHWERDE_BETREFF)
  expect(beschwerdeLink('[E-Mail-Adresse]')).toBe('mailto:')
  expect(beschwerdeHref).toBe(beschwerdeLink('office@fixit247.at'))
})
