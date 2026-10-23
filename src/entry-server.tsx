import { renderToString } from 'react-dom/server'
import { App, normalisiere, seiten, type Seite } from './App'
import { copy } from './content/copy'
import { DOMAIN, EMAIL, FIRMA, TELEFON, e164, istPlatzhalter } from './content/contact'

export { DOMAIN } from './content/contact'
export { VCARD_PFAD, vcardText } from './lib/vcard'
export { SECURITY_TXT_PFAD, securityTxt } from './lib/securityTxt'
export const pfade = Object.keys(seiten)

/** Kanonische Adresse einer Seite: Unterseiten liegen als ordner/index.html, mit Schrägstrich am Ende (seo.md, Punkt 3). */
export const adresse = (pfad: string) => DOMAIN + (pfad === '/' ? '/' : `${pfad}/`)

/** Alle Seiten ohne noindex, für sitemap.xml (seo.md, Punkt 5) */
export const indexierbar = pfade.filter((pfad) => !seiten[pfad].noindex)

/** BreadcrumbList für Seiten unter der Startseite; die Namen sind die der sichtbaren Brotkrumen (seo.md, „Strukturierte Daten“). */
const brotkrumenJson = (brotkrumen: NonNullable<Seite['brotkrumen']>) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: brotkrumen.map((krume, i) => ({ '@type': 'ListItem', position: i + 1, name: krume.name, item: adresse(krume.pfad) })),
  }).replace(/</g, '\\u003c') // „<“ darf im Skript nie vorkommen (</script>)

const bekannt = (wert: string) => (istPlatzhalter(wert) ? undefined : wert)

/**
 * Strukturierte Daten der Startseite: nur Organization und WebSite (seo.md). LocalBusiness, Plumber oder Service mit
 * fixit247 als Anbieter würden behaupten, fixit247 repariere selbst. Platzhalter fallen weg (JSON.stringify lässt undefined aus).
 */
const startseiteJson = () => {
  const nummer = e164(TELEFON)
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: copy.kopf.logo,
        legalName: bekannt(FIRMA),
        url: adresse('/'),
        email: bekannt(EMAIL),
        telephone: nummer ? `+${nummer}` : undefined,
        description: copy.fuss.text,
        areaServed: { '@type': 'Country', name: 'Österreich' },
      },
      // bestimmt den Seitennamen über dem Suchtreffer
      { '@type': 'WebSite', name: copy.kopf.logo, url: adresse('/'), inLanguage: 'de-AT' },
    ],
  }).replace(/</g, '\\u003c')
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function render(pfad: string) {
  const schluessel = normalisiere(pfad)
  const seite = seiten[schluessel]
  const domainBekannt = !istPlatzhalter(DOMAIN)
  const url = adresse(schluessel)
  const head = [
    `<title>${esc(seite.titel)}</title>`,
    `<meta name="description" content="${esc(seite.beschreibung)}" />`,
    seite.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:title" content="${esc(seite.titel)}" />`,
    `<meta property="og:description" content="${esc(seite.beschreibung)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="de_AT" />',
    // Die 404-Seite hat keine eigene Adresse, sie steht unter jedem unbekannten Pfad
    domainBekannt && schluessel !== '/404' ? `<meta property="og:url" content="${esc(url)}" />` : '',
    domainBekannt && !seite.noindex ? `<link rel="canonical" href="${esc(url)}" />` : '',
    domainBekannt && seite.brotkrumen ? `<script type="application/ld+json">${brotkrumenJson(seite.brotkrumen)}</script>` : '',
    domainBekannt && schluessel === '/' ? `<script type="application/ld+json">${startseiteJson()}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  return { html: renderToString(<App pfad={schluessel} />), head }
}
