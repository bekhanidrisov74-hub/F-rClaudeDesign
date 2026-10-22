import { DOMAIN, EMAIL, istPlatzhalter } from '../content/contact'

/** Adresse der Datei in dist/ (scripts/prerender.mjs) und im Netz (RFC 9116, Abschnitt 3). */
export const SECURITY_TXT_PFAD = '/.well-known/security.txt'

/**
 * Meldeweg für Sicherheitslücken nach RFC 9116: Contact, Expires, Preferred-Languages, Canonical.
 * Expires liegt einen Tag weniger als ein Jahr nach `jetzt` (UTC, ISO 8601; RFC 9116 empfiehlt unter einem Jahr); danach
 * gilt die Datei als veraltet, also mindestens jährlich neu bauen und hochladen. Zeilenenden LF, abschließender Zeilenumbruch. Ohne echte Domain fehlt Canonical.
 * `null`, solange die E-Mail-Adresse ein Platzhalter ist: Dann gibt es keine Datei.
 */
export function securityTxt({ email = EMAIL, domain = DOMAIN, jetzt = new Date() } = {}): string | null {
  if (istPlatzhalter(email)) return null
  const ablauf = new Date(jetzt)
  ablauf.setUTCFullYear(ablauf.getUTCFullYear() + 1)
  ablauf.setUTCDate(ablauf.getUTCDate() - 1)
  const zeilen = [
    `Contact: mailto:${email}`,
    `Expires: ${ablauf.toISOString()}`,
    'Preferred-Languages: de, en',
    ...(istPlatzhalter(domain) ? [] : [`Canonical: ${domain}${SECURITY_TXT_PFAD}`]),
  ]
  return `${zeilen.join('\n')}\n`
}
