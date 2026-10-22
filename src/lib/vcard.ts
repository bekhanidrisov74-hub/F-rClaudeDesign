import { DOMAIN, FIRMA, TELEFON, e164, istPlatzhalter } from '../content/contact'

/** Adresse der Datei im Fuß-Link und in dist/ (scripts/prerender.mjs). */
export const VCARD_PFAD = '/fixit247.vcf'

// Text-Werte nach RFC 2426 (3.4 und 4): Backslash, Semikolon, Komma und Zeilenumbruch maskieren.
const maskiere = (text: string) => text.replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n')

/**
 * Kontaktkarte (vCard 3.0, RFC 2426) für „Nummer speichern“: Firma als Name, Telefon als +43…, Webseite.
 * N steht als „;Firma;;;“ (Firma im Vornamen-Feld), FN und ORG tragen dieselbe Firma. TEL und URL sind keine Text-Werte
 * und bleiben unmaskiert. Zeilenenden CRLF, auch nach END:VCARD. Zeilen werden nicht gefaltet (Namen bleiben kurz).
 * `null`, solange Telefon oder Firma ein Platzhalter ist: Dann gibt es weder Datei noch Link.
 */
export function vcard({ firma = FIRMA, telefon = TELEFON, domain = DOMAIN } = {}): string | null {
  const nummer = e164(telefon)
  if (!nummer || istPlatzhalter(firma)) return null
  const name = maskiere(firma)
  const zeilen = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${name};;;`,
    `FN:${name}`,
    `ORG:${name}`,
    `TEL;TYPE=WORK,VOICE:+${nummer}`,
    ...(istPlatzhalter(domain) ? [] : [`URL:${domain}`]),
    'END:VCARD',
  ]
  return `${zeilen.join('\r\n')}\r\n`
}

/** Die Karte mit den echten Kontaktdaten; Fuß und Prerender lesen sie von hier. */
export const vcardText = vcard()
