// Kontaktdaten. Platzhalter laut SPEC 9, bis die echten Daten da sind.
export const TELEFON = '[Telefonnummer]'
export const WHATSAPP = '[WhatsApp-Nummer]'
export const EMAIL = '[E-Mail-Adresse]'
export const FIRMA = '[Firmenname]'
/** Für sitemap.xml, robots.txt und og:url, z. B. 'https://www.fixit247.at' (ohne Schrägstrich am Ende). */
export const DOMAIN = '[Domain]'

export const istPlatzhalter = (wert: string) => /^\[.*\]$/.test(wert)
