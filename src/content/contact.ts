// Kontaktdaten. Platzhalter laut SPEC 9, bis die echten Daten da sind.
// Telefonnummern in üblicher Schreibweise eintragen, z. B. '0660 123 45 67' oder '+43 660 1234567'.
export const TELEFON = '[Telefonnummer]'
export const WHATSAPP = '[WhatsApp-Nummer]'
export const EMAIL = '[E-Mail-Adresse]'
export const FIRMA = '[Firmenname]'
/** Für sitemap.xml, robots.txt und og:url, z. B. 'https://www.fixit247.at' (ohne Schrägstrich am Ende). */
export const DOMAIN = '[Domain]'

export const WHATSAPP_TEXT = 'Hallo fixit247, ich brauche Hilfe: '

export const istPlatzhalter = (wert: string) => /^\[.*\]$/.test(wert)

/** Österreichische Nummer → E.164 ohne „+“: '0660 123 45 67' → '436601234567'. Leer bei Platzhalter. */
export function e164(nummer: string): string {
  if (istPlatzhalter(nummer)) return ''
  const ziffern = nummer.replace(/[^\d+]/g, '')
  if (ziffern.startsWith('+')) return ziffern.slice(1)
  if (ziffern.startsWith('00')) return ziffern.slice(2)
  if (ziffern.startsWith('0')) return `43${ziffern.slice(1)}`
  return ziffern
}

const nummerTel = e164(TELEFON)
const nummerWa = e164(WHATSAPP)

export const telHref = nummerTel ? `tel:+${nummerTel}` : 'tel:'
export const whatsappHref = `https://wa.me/${nummerWa}?text=${encodeURIComponent(WHATSAPP_TEXT)}`
export const mailHref = istPlatzhalter(EMAIL) ? 'mailto:' : `mailto:${EMAIL}`
