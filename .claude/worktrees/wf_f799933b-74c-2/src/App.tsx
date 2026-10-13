import type { ReactNode } from 'react'
import { copy } from './content/copy'
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
    titel: `${rechtliches.impressum.titel} – fixit247`,
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="impressum" />,
  },
  '/datenschutz': {
    titel: `${rechtliches.datenschutz.titel} – fixit247`,
    beschreibung: copy.meta.beschreibung,
    noindex: true,
    inhalt: () => <LegalPage seite="datenschutz" />,
  },
  '/agb': {
    titel: `${rechtliches.agb.titel} – fixit247`,
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
  return <OverlayProvider>{seiten[normalisiere(pfad)].inhalt()}</OverlayProvider>
}
