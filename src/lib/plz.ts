import { bezirke } from '../content/bezirke'
import { copy, fuelle } from '../content/copy'
import { teilePlzOrt } from './validate'

// PLZ-Verzeichnis (src/content/plz.json, erzeugt mit scripts/plz.mjs). Rund 18 KB gzip: wird erst geladen,
// wenn Luna, die Partner-Bewerbung oder das Anfrageformular es brauchen (eigener Chunk), nicht mit der Startseite.
let liste: Promise<Readonly<Record<string, string>>> | undefined

export const ladePlz = () => (liste ??= import('../content/plz.json').then((m) => m.default as Record<string, string>))

export interface OrtsHinweis {
  plz: string
  ort: string
  /** „Stockerau“, in Wien „Wien, 10. Bezirk (Favoriten)“ */
  text: string
  /** Im Feld steht nur die PLZ: Der Ort lässt sich einsetzen. */
  nurPlz: boolean
}

/** Ort (in Wien mit Bezirk) zur PLZ am Anfang der Eingabe. null bei unbekannter PLZ oder ohne PLZ am Anfang. */
export function ortsHinweis(eingabe: string, verzeichnis: Readonly<Record<string, string>>): OrtsHinweis | null {
  const geteilt = teilePlzOrt(eingabe)
  const ort = geteilt && verzeichnis[geteilt.plz]
  if (!geteilt || !ort) return null
  const bezirk = bezirke[geteilt.plz]
  return { plz: geteilt.plz, ort, text: bezirk ? fuelle(copy.anfrage.bezirk, { ort, ...bezirk }) : ort, nurPlz: geteilt.ort === '' }
}
