import type { Angaben } from '../flow'

export interface ErfolgProps {
  angaben: Angaben
  anfragenummer: string
  /** „Chat schließen“ (nur im Vollbild unter 640 px sichtbar) */
  onSchliessen: () => void
}

// Platzhalter aus Phase 4: wird vom ui-builder ersetzt.
export function Erfolg(props: ErfolgProps) {
  void props
  return null
}
