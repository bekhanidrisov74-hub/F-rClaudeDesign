import { renderToString } from 'react-dom/server'
import { App, normalisiere, seiten } from './App'
import { copy } from './content/copy'
import { DOMAIN, EMAIL, FIRMA, TELEFON, e164, istPlatzhalter } from './content/contact'

export { DOMAIN } from './content/contact'
export const pfade = Object.keys(seiten)

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const bekannt = (wert: string) => (istPlatzhalter(wert) ? undefined : wert)

/**
 * Strukturierte Daten der Startseite. Bewusst nur Organization: LocalBusiness, Plumber oder Service mit fixit247
 * als Anbieter würden behaupten, fixit247 repariere selbst. Platzhalter fallen weg (JSON.stringify lässt undefined aus).
 */
function strukturierteDaten(url: string | undefined) {
  const nummer = e164(TELEFON)
  const telefon = nummer ? `+${nummer}` : undefined
  const daten = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: copy.kopf.logo,
        legalName: bekannt(FIRMA),
        url,
        email: bekannt(EMAIL),
        telephone: telefon,
        description: copy.fuss.text,
        areaServed: { '@type': 'Country', name: 'Österreich' },
        contactPoint: telefon && {
          '@type': 'ContactPoint',
          telephone: telefon,
          contactType: 'customer service',
          areaServed: 'AT',
          availableLanguage: 'de',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59',
          },
        },
      },
      // Für den Seitennamen über dem Suchtreffer; braucht die Adresse.
      url && { '@type': 'WebSite', name: copy.kopf.logo, url, inLanguage: 'de-AT' },
    ].filter(Boolean),
  }
  return `<script type="application/ld+json">${JSON.stringify(daten).replace(/</g, '\\u003c')}</script>`
}

export function render(pfad: string) {
  const schluessel = normalisiere(pfad)
  const seite = seiten[schluessel]
  const domainBekannt = !istPlatzhalter(DOMAIN)
  // Unterseiten liegen als ordner/index.html und haben ihre Adresse mit Schrägstrich am Ende.
  const url = DOMAIN + (schluessel === '/' ? '/' : `${schluessel}/`)
  const head = [
    `<title>${esc(seite.titel)}</title>`,
    `<meta name="description" content="${esc(seite.beschreibung)}" />`,
    seite.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:title" content="${esc(seite.titel)}" />`,
    `<meta property="og:description" content="${esc(seite.beschreibung)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="de_AT" />',
    `<meta property="og:site_name" content="${esc(copy.kopf.logo)}" />`,
    domainBekannt ? `<meta property="og:url" content="${esc(url)}" />` : '',
    // Vorschaubild für WhatsApp und Facebook; braucht eine absolute Adresse.
    domainBekannt ? `<meta property="og:image" content="${esc(DOMAIN)}/images/bild-1-1200.webp" />` : '',
    domainBekannt && !seite.noindex ? `<link rel="canonical" href="${esc(url)}" />` : '',
    schluessel === '/' ? strukturierteDaten(domainBekannt ? url : undefined) : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  return { html: renderToString(<App pfad={schluessel} />), head }
}
