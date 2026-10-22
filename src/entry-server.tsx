import { renderToString } from 'react-dom/server'
import { App, normalisiere, seiten, type Seite } from './App'
import { DOMAIN, istPlatzhalter } from './content/contact'

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
  ]
    .filter(Boolean)
    .join('\n    ')
  return { html: renderToString(<App pfad={schluessel} />), head }
}
