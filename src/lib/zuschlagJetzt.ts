// Welcher Zuschlag gilt gerade in Wien (Bauplan M6)? Zeiten und Feiertage stehen in src/content/feiertage.ts.
// Gerechnet wird in der Wiener Zeit (Intl mit timeZone, also richtig über die Sommerzeit), nie in der Zeit des Geräts.
import { BEWEGLICHE_FEIERTAGE, FESTE_FEIERTAGE, NACHT } from '../content/feiertage'
import type { ZuschlagId } from './preis'

const WIEN = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Vienna',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  hourCycle: 'h23', // 0–23, nie „24“ um Mitternacht
})

export interface WienerZeit {
  jahr: number
  monat: number
  tag: number
  /** 0–23 */
  stunde: number
  /** 0 = Sonntag */
  wochentag: number
}

export function wienerZeit(zeitpunkt: Date): WienerZeit {
  const teile = Object.fromEntries(WIEN.formatToParts(zeitpunkt).map((t) => [t.type, Number(t.value)]))
  const { year: jahr, month: monat, day: tag, hour: stunde } = teile
  return { jahr, monat, tag, stunde, wochentag: new Date(Date.UTC(jahr, monat - 1, tag)).getUTCDay() }
}

/** Ostersonntag (gregorianisch, Meeus/Jones/Butcher). */
export function ostersonntag(jahr: number): { monat: number; tag: number } {
  const a = jahr % 19
  const b = Math.floor(jahr / 100)
  const c = jahr % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const summe = h + l - 7 * m + 114
  return { monat: Math.floor(summe / 31), tag: (summe % 31) + 1 }
}

export function istFeiertag({ jahr, monat, tag }: Pick<WienerZeit, 'jahr' | 'monat' | 'tag'>): boolean {
  if (FESTE_FEIERTAGE.some((f) => f.monat === monat && f.tag === tag)) return true
  const ostern = ostersonntag(jahr)
  const heute = Date.UTC(jahr, monat - 1, tag)
  return BEWEGLICHE_FEIERTAGE.some((f) => Date.UTC(jahr, ostern.monat - 1, ostern.tag + f.tageNachOstern) === heute)
}

/**
 * Die Zuschläge, die zum Zeitpunkt in Wien zutreffen, in der Reihenfolge Feiertag, Sonntag, Nacht (die erste gilt für „Übernehmen“).
 * Nach der Wiener Uhr: Sonntag und Feiertage gelten von 0 bis 24 Uhr des Kalendertags, Nacht ab 18 bis vor 8 Uhr.
 */
export function zuschlaegeJetzt(zeitpunkt: Date): ZuschlagId[] {
  const z = wienerZeit(zeitpunkt)
  const treffer: ZuschlagId[] = []
  if (istFeiertag(z)) treffer.push('feiertag')
  if (z.wochentag === 0) treffer.push('sonntag')
  if (z.stunde >= NACHT.beginn || z.stunde < NACHT.ende) treffer.push('nacht')
  return treffer
}
