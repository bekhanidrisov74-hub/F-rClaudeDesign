import { renderToString } from 'react-dom/server'
import { App, normalisiere, seiten } from './App'
import { DOMAIN, istPlatzhalter } from './content/contact'

export { DOMAIN } from './content/contact'
export const pfade = Object.keys(seiten)

/** Kanonische Adresse einer Seite: Unterseiten liegen als ordner/index.html, mit Schrägstrich am Ende (seo.md, Punkt 3). */
export const adresse = (pfad: string) => DOMAIN + (pfad === '/' ? '/' : `${pfad}/`)

/** Alle Seiten ohne noindex, für sitemap.xml (seo.md, Punkt 5) */
export const indexierbar = pfade.filter((pfad) => !seiten[pfad].noindex)

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
    domainBekannt ? `<meta property="og:url" content="${esc(url)}" />` : '',
    domainBekannt && !seite.noindex ? `<link rel="canonical" href="${esc(url)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  return { html: renderToString(<App pfad={schluessel} />), head }
}
