import type { RefObject } from 'react'
import type { Angaben } from '../flow'

export interface ZusammenfassungProps {
  angaben: Angaben
  einwilligung: boolean
  onEinwilligung: (an: boolean) => void
  /** Fehlertext anzeigen (SPEC 9: „Bitte stimmen Sie der Weitergabe zu …“) */
  einwilligungFehlt: boolean
  /** Die Checkbox; LunaChat fokussiert sie, wenn die Einwilligung fehlt */
  einwilligungRef: RefObject<HTMLInputElement | null>
  sendend: boolean
  onAbsenden: () => void
  onAendern: () => void
}

// Platzhalter aus Phase 4: wird vom ui-builder ersetzt.
export function Zusammenfassung(props: ZusammenfassungProps) {
  void props
  return null
}
