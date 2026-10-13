import { expect, test } from 'vitest'
import { e164, mailHref, telHref, whatsappHref } from './contact'

test('österreichische Nummern werden zu E.164', () => {
  expect(e164('0660 123 45 67')).toBe('436601234567')
  expect(e164('+43 660 1234567')).toBe('436601234567')
  expect(e164('0043 (660) 123-45-67')).toBe('436601234567')
  expect(e164('01 234 56 78')).toBe('4312345678')
  expect(e164('[Telefonnummer]')).toBe('')
})

test('Links mit Platzhaltern bleiben gültig, ohne erfundene Nummer', () => {
  expect(telHref).toBe('tel:')
  expect(whatsappHref).toBe('https://wa.me/?text=Hallo%20fixit247%2C%20ich%20brauche%20Hilfe%3A%20')
  expect(mailHref).toBe('mailto:')
})
