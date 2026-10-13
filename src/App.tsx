import { useEffect, type ReactNode } from 'react'
import { copy, fuelle } from './content/copy'
import { OverlayProvider } from './overlays'
import { Startseite } from './components/Startseite'
import { LegalPage } from './components/LegalPage'

export interface Seite {
  titel: string
  beschreibung: string
  noindex?: boolean
  inhalt: () => ReactNode
}

const { rechtliches } = copy

export const seiten: Record<string, Seite> = {
  '/': { titel: copy.meta.titel, beschreibung: copy.meta.beschreibung, inhalt: () => <Startseite /> },
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

/** „/impressum.html“, „/impressum/“ und „/index.html“ auf die Schlüssel von `seiten` abbilden. */
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
