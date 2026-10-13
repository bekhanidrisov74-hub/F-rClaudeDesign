import { expect, test } from 'vitest'
import { cent, euro } from './preis'

test('Euro-Format mit Komma, Tausenderpunkt und Zeichen dahinter', () => {
  expect(euro(2990)).toBe('29,90 €')
  expect(euro(19000)).toBe('190,00 €')
  expect(euro(108000)).toBe('1.080,00 €')
  expect(euro(338990)).toBe('3.389,90 €')
  expect(euro(5)).toBe('0,05 €')
})

test('Euro → Cent ohne Gleitkommafehler', () => {
  expect(cent(29.9)).toBe(2990)
  expect(cent(19.9)).toBe(1990)
  expect(cent(0.1 + 0.2)).toBe(30)
})
