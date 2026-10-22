import { expect, test } from 'vitest'
import { EMAIL, istPlatzhalter } from '../content/contact'
import { SECURITY_TXT_PFAD, securityTxt } from './securityTxt'

const BEISPIEL = { email: 'sicherheit@beispiel.at', domain: 'https://fixit247.at', jetzt: new Date('2026-10-22T00:00:00.000Z') }

test('alle Felder nach RFC 9116, Expires einen Tag weniger als ein Jahr nach dem übergebenen Datum, LF und Zeilenumbruch am Ende', () => {
  const text = securityTxt(BEISPIEL)
  expect(text).toBe(
    [
      'Contact: mailto:sicherheit@beispiel.at',
      'Expires: 2027-10-21T00:00:00.000Z',
      'Preferred-Languages: de, en',
      'Canonical: https://fixit247.at/.well-known/security.txt',
      '',
    ].join('\n'),
  )
  expect(text).not.toContain('\r')
  expect(text!.endsWith('\n')).toBe(true)
  expect(text).toContain(`Canonical: https://fixit247.at${SECURITY_TXT_PFAD}\n`)
})

test('Expires ist ISO 8601 in UTC und folgt dem Datum, nicht der Ortszeit', () => {
  const zeit = new Date('2026-12-31T23:30:15.123Z')
  const expires = securityTxt({ ...BEISPIEL, jetzt: zeit })!.match(/^Expires: (.+)$/m)![1]
  expect(expires).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  expect(expires).toBe('2027-12-30T23:30:15.123Z')
})

test('ohne übergebenes Datum zählt der Zeitpunkt des Aufrufs', () => {
  const vorher = Date.now()
  const expires = Date.parse(securityTxt({ email: BEISPIEL.email })!.match(/^Expires: (.+)$/m)![1])
  expect(expires).toBeGreaterThan(vorher + 363 * 24 * 3600 * 1000)
  expect(expires).toBeLessThan(vorher + 366 * 24 * 3600 * 1000)
})

test('ohne echte Domain fehlt die Canonical-Zeile', () => {
  const text = securityTxt({ ...BEISPIEL, domain: '[Domain]' })!
  expect(text).not.toContain('Canonical')
  expect(text.split('\n')).toEqual([
    'Contact: mailto:sicherheit@beispiel.at',
    'Expires: 2027-10-21T00:00:00.000Z',
    'Preferred-Languages: de, en',
    '',
  ])
})

test('Platzhalter bei der E-Mail-Adresse ergibt keine Datei', () => {
  expect(securityTxt({ ...BEISPIEL, email: '[E-Mail-Adresse]' })).toBeNull()
})

test('die Datei mit den echten Kontaktdaten gibt es erst, wenn die E-Mail-Adresse kein Platzhalter mehr ist', () => {
  expect(securityTxt() === null).toBe(istPlatzhalter(EMAIL))
})
