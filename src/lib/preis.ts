// Preisrechner (SPEC 5). Beträge in Cent (Ganzzahlen). Format: Komma, zwei Nachkommastellen, Tausenderpunkt,
// „ €“ nach der Zahl. Bewusst ohne Intl: 'de-AT' liefert „€ 219,90“ und je nach ICU andere Leerzeichen.
import { copy } from '../content/copy'
import type { Gewerk } from '../content/gewerke'

export const cent = (euro: number) => Math.round(euro * 100)

/** „2.189,90“ */
export function zahl(betragCent: number): string {
  const ganz = Math.floor(betragCent / 100)
  const rest = String(betragCent % 100).padStart(2, '0')
  return `${String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${rest}`
}

/** „2.189,90 €“ */
export const euro = (betragCent: number) => `${zahl(betragCent)} €`

/** Spanne in einer Zeile: „190,00–280,00 €“ (Halbgeviertstrich ohne Leerzeichen) */
export const spanneZeile = (min: number, max: number) => `${zahl(min)}–${euro(max)}`

/** Gesamt: „ca. 219,90 € – 309,90 €“ */
export const spanneGesamt = (min: number, max: number) => `${copy.rechner.ca} ${euro(min)} – ${euro(max)}`

/** „Sonntag“, „Sonntag und Nacht“, „Sonntag, Feiertag und Nacht“ */
export const aufzaehlung = (teile: readonly string[]) =>
  teile.length < 2 ? (teile[0] ?? '') : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`

export const STUNDEN = { min: 1, max: 12, start: 2 } as const
export const stundenText = (n: number) => `${n} ${n === 1 ? copy.rechner.stunde : copy.rechner.stunden}`

export type ZuschlagId = (typeof copy.rechner.zuschlaege)[number]['id']

export interface Ergebnis {
  einsatz: boolean
  arbeit: { min: number; max: number }
  anfahrt: number
  zuschlag: { min: number; max: number } | null
  gesamt: { min: number; max: number }
  /** „Installateur, 2 Stunden, kein Zuschlag“ */
  unterzeile: string
  /** Namen der gewählten Zuschläge in fester Reihenfolge */
  gewaehlt: string[]
}

export function rechne(g: Gewerk, stunden: number, zuschlaege: readonly ZuschlagId[]): Ergebnis {
  const einsatz = g.abrechnung === 'einsatz'
  const faktor = einsatz ? 1 : Math.min(Math.max(stunden, STUNDEN.min), STUNDEN.max)
  const arbeit = { min: cent(g.min) * faktor, max: cent(g.max) * faktor }
  const anfahrt = cent(g.anfahrt)
  // Höchstens ein Zuschlag zählt: +100 % auf die Arbeit, nicht auf die Anfahrt (SPEC 5, Annahme SPEC 11).
  const zuschlag = zuschlaege.length > 0 ? { ...arbeit } : null
  const gesamt = {
    min: arbeit.min + (zuschlag?.min ?? 0) + anfahrt,
    max: arbeit.max + (zuschlag?.max ?? 0) + anfahrt,
  }
  const gewaehlt = copy.rechner.zuschlaege.filter((z) => zuschlaege.includes(z.id)).map((z) => z.name)
  const unterzeile = [
    g.name,
    einsatz ? copy.rechner.ergebnis.proEinsatz : stundenText(faktor),
    gewaehlt.length ? aufzaehlung(gewaehlt) : copy.rechner.ergebnis.keinZuschlag,
  ].join(', ')
  return { einsatz, arbeit, anfahrt, zuschlag, gesamt, unterzeile, gewaehlt }
}
