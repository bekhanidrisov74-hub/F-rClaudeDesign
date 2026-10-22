import { useEffect, type ReactNode } from 'react'
import { copy, fuelle } from './content/copy'
import { gewerke } from './content/gewerke'
import { gewerkseiten, gewerkText } from './content/gewerkseiten'
import { partner } from './content/partner'
import { OverlayProvider } from './overlays'
import { Startseite } from './components/Startseite'
import { GewerkSeite } from './components/GewerkSeite'
import { LegalPage } from './components/LegalPage'
import { PartnerSeite } from './components/PartnerSeite'

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
}

/** „/impressum/“ (so liefert der Webserver die Unterseiten aus), „/impressum.html“ und „/index.html“ auf die Schlüssel von `seiten` abbilden. */
export function normalisiere(pfad: string): string {
  const p = pfad.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1')
  return p in seiten ? p : '/'
}

export function App({ pfad }: { pfad: string }) {
  // Markiert das Ende der Hydration (für Tests; vorher gehen Klicks auf vorgerenderte Knöpfe ins Leere).
  useEffect(() => {
    document.documentElement.dataset.hydriert = ''
  }, [])
  return <OverlayProvider>{seiten[normalisiere(pfad)].inhalt()}</OverlayProvider>
}
