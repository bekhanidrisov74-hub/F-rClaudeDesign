// Kontaktdaten (Telefon, WhatsApp, E-Mail von Beks' alter Website, 22.10.2026; Firmenname noch Platzhalter).
// Telefonnummern in üblicher Schreibweise eintragen, z. B. '0660 123 45 67' oder '+43 660 1234567'.
export const TELEFON = '0676 4777700'
export const WHATSAPP = '0676 4777700'
export const EMAIL = 'office@fixit247.at'
export const FIRMA = '[Firmenname]'
/** Für sitemap.xml, robots.txt, og:url und canonical (ohne Schrägstrich am Ende). www leitet public/.htaccess hierher um. */
export const DOMAIN = 'https://fixit247.at'

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

/**
 * Betreff der Beschwerde-Mail (nicht im Design, Bauplan M8, Text von Beks freigegeben am 22.10.2026). Die Anfragenummer tippt die
 * Kundin oder der Kunde selbst dahinter, darum endet der Betreff mit einem Leerzeichen.
 */
export const BESCHWERDE_BETREFF = 'Beschwerde zu Anfrage '
/** mailto-Link an `email` mit vorbefülltem Betreff; wie mailHref bei Platzhalter nur 'mailto:'. */
export const beschwerdeLink = (email: string) =>
  istPlatzhalter(email) ? 'mailto:' : `mailto:${email}?subject=${encodeURIComponent(BESCHWERDE_BETREFF)}`
export const beschwerdeHref = beschwerdeLink(EMAIL)
