import { useEffect, type ReactNode } from 'react'
import { copy, fuelle } from './content/copy'
import { gewerke } from './content/gewerke'
import { gewerkseiten, gewerkText } from './content/gewerkseiten'
import { partner } from './content/partner'
import { RATGEBER_PFAD, ratgeber } from './content/ratgeber'
import { OverlayProvider } from './overlays'
import { Startseite } from './components/Startseite'
import { GewerkSeite } from './components/GewerkSeite'
import { LegalPage } from './components/LegalPage'
import { PartnerSeite } from './components/PartnerSeite'
import { RatgeberSeite } from './components/RatgeberSeite'

export interface Seite {
  titel: string
  beschreibung: string
  noindex?: boolean
  /** Pfad von der Startseite bis hierher (nur Seiten unter der Startseite): sichtbare Brotkrumen und BreadcrumbList im Kopf */
  brotkrumen?: { name: string; pfad: string }[]
  inhalt: () => ReactNode
}

const { rechtliches } = copy

export const seiten: Record<string, Seite> = {
  '/': { titel: copy.meta.titel, beschreibung: copy.meta.beschreibung, inhalt: () => <Startseite /> },
  '/partner-werden': { titel: partner.meta.titel, beschreibung: partner.meta.beschreibung, inhalt: () => <PartnerSeite /> },
  // Eine Notfall-Seite je Gewerk (Bauplan M7): ein neues Gewerk in gewerke.ts bekommt sie samt Sitemap-Eintrag und Vorrendern.
  ...Object.fromEntries(
    gewerke.map((g): [string, Seite] => {
      const text = gewerkText(g.id)
      return [
        `/${g.seite}`,
        {
          titel: text.titel,
          beschreibung: text.beschreibung,
          brotkrumen: [
            { name: gewerkseiten.brotkrumen.start, pfad: '/' },
            { name: g.name, pfad: `/${g.seite}` },
          ],
          inhalt: () => <GewerkSeite gewerk={g} />,
        },
      ]
    }),
  ),
  [RATGEBER_PFAD.slice(0, -1)]: {
    titel: ratgeber.meta.titel,
    beschreibung: ratgeber.meta.beschreibung,
    brotkrumen: [
      { name: gewerkseiten.brotkrumen.start, pfad: '/' },
      { name: ratgeber.name, pfad: RATGEBER_PFAD.slice(0, -1) },
    ],
    inhalt: () => <RatgeberSeite />,
  },
  '/impressum': {
    titel: fuelle(copy.meta.unterseite, { seite: rechtliches.impressum.titel }),
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="impressum" />,
  },
  '/datenschutz': {
    titel: fuelle(copy.meta.unterseite, { seite: rechtliches.datenschutz.titel }),
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="datenschutz" />,
  },
  '/agb': {
    titel: fuelle(copy.meta.unterseite, { seite: rechtliches.agb.titel }),
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="agb" />,
  },
  // Unbekannte Adressen: prerender.mjs schreibt sie als dist/404.html, public/.htaccess liefert sie mit Status 404 aus
  '/404': {
    titel: fuelle(copy.meta.unterseite, { seite: rechtliches.nichtGefunden.titel }),
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="nichtGefunden" />,
  },
}

/**
 * „/impressum/“ (so liefert der Webserver die Unterseiten aus), „/impressum.html“ und „/index.html“ auf die Schlüssel von `seiten`
 * abbilden. Unbekannte Pfade sind die 404-Seite: So hydriert der Browser dasselbe, was der Server als 404.html geschickt hat.
 */
export function normalisiere(pfad: string): string {
  const p = pfad.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1')
  return p in seiten ? p : '/404'
}

export function App({ pfad }: { pfad: string }) {
  // Markiert das Ende der Hydration (für Tests; vorher gehen Klicks auf vorgerenderte Knöpfe ins Leere).
  useEffect(() => {
    document.documentElement.dataset.hydriert = ''
  }, [])
  return <OverlayProvider>{seiten[normalisiere(pfad)].inhalt()}</OverlayProvider>
}
