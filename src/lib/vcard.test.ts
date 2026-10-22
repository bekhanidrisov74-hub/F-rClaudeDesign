import { expect, test } from 'vitest'
import { FIRMA, TELEFON, istPlatzhalter } from '../content/contact'
import { vcard, vcardText } from './vcard'

const BEISPIEL = { firma: 'Muster GmbH', telefon: '0660 123 45 67', domain: 'https://fixit247.at' }

test('vCard 3.0 mit Firma, Nummer als +43… und Webseite, Zeilen mit CRLF', () => {
  const karte = vcard(BEISPIEL)
  expect(karte).toBe(
    [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;Muster GmbH;;;',
      'FN:Muster GmbH',
      'ORG:Muster GmbH',
      'TEL;TYPE=WORK,VOICE:+436601234567',
      'URL:https://fixit247.at',
      'END:VCARD',
      '',
    ].join('\r\n'),
  )
  // kein einzelnes LF: Jede Zeile endet mit CRLF
  expect(karte!.split('\r\n').every((zeile) => !zeile.includes('\n') && !zeile.includes('\r'))).toBe(true)
})

test('Nummer in anderer Schreibweise ergibt dieselbe +43-Nummer', () => {
  expect(vcard({ ...BEISPIEL, telefon: '+43 660 1234567' })).toContain('TEL;TYPE=WORK,VOICE:+436601234567\r\n')
})

test('Sonderzeichen im Namen werden nach RFC 2426 maskiert', () => {
  const karte = vcard({ ...BEISPIEL, firma: 'Muster, GmbH; Co\\Zeile\nzwei' })!
  const maskiert = 'Muster\\, GmbH\\; Co\\\\Zeile\\nzwei'
  expect(karte).toContain(`N:;${maskiert};;;\r\n`)
  expect(karte).toContain(`FN:${maskiert}\r\n`)
  expect(karte).toContain(`ORG:${maskiert}\r\n`)
  // das rohe Zeilenende darf die Karte nicht aufbrechen
  expect(karte.split('\r\n')).toHaveLength(9)
})

test('ohne echte Domain fehlt die URL-Zeile', () => {
  expect(vcard({ ...BEISPIEL, domain: '[Domain]' })).not.toContain('URL:')
})

test('Platzhalter bei Telefon oder Firma ergeben keine Karte', () => {
  expect(vcard({ ...BEISPIEL, telefon: '[Telefonnummer]' })).toBeNull()
  expect(vcard({ ...BEISPIEL, firma: '[Firmenname]' })).toBeNull()
  expect(vcard({ firma: '[Firmenname]', telefon: '[Telefonnummer]' })).toBeNull()
})

test('die Karte mit den echten Kontaktdaten gibt es erst, wenn Telefon und Firma keine Platzhalter mehr sind', () => {
  expect(vcardText === null).toBe(istPlatzhalter(TELEFON) || istPlatzhalter(FIRMA))
})
