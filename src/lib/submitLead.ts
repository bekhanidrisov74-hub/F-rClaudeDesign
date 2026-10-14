// Versand für Formular und Luna an den Anfrage-Eingang (tools/apps-script.gs, Aufgabe Abschnitt 6).
// POST als URLSearchParams (einfache Anfrage ohne Preflight, nötig für Apps Script).
// Erfolg ist nur JSON { ok: true, match: 'FOUND' | 'NONE' }; alles andere und ein Timeout nach 20 s sind Fehler.
import type { DringlichkeitId } from '../content/copy'
import { formEndpunkt } from './endpunkte'

export type Match = 'FOUND' | 'NONE'

export interface Lead {
  /** Je Anfrage einmal vergeben, bleibt beim erneuten Senden gleich (der Eingang erkennt Doppelsendungen) */
  anfrageId: string
  name: string
  tel: string
  email: string
  plz: string
  ort: string
  /** id aus gewerke.ts, leer bei „Weiß ich nicht“ */
  kategorie: string
  /** Name des Gewerks bzw. „Weiß ich nicht“ */
  bereich: string
  /** leer: das Formular fragt nicht danach, der Eingang nimmt dann URGENT an */
  dringlichkeit: DringlichkeitId | ''
  wunschtermin: string
  /** lesbare Zusammenfassung */
  text: string
  antworten: Record<string, string>
}

const ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
/** Anfrage-Id im Format F247-XXXXXX, wird auch als Anfragenummer angezeigt */
export function zufallsnummer(): string {
  const zahlen = crypto.getRandomValues(new Uint32Array(6))
  return `F247-${[...zahlen].map((z) => ZEICHEN[z % ZEICHEN.length]).join('')}`
}

export const buildPayload = (lead: Lead) =>
  new URLSearchParams({ art: 'anfrage', ...lead, antworten: JSON.stringify(lead.antworten), dsgvo: 'on' })

export async function submitLead(lead: Lead): Promise<Match> {
  const endpunkt = formEndpunkt()
  if (!endpunkt) throw new Error('Kein Anfrage-Eingang konfiguriert (VITE_FORM_ENDPOINT)')
  const antwort = await fetch(endpunkt, { method: 'POST', body: buildPayload(lead), signal: AbortSignal.timeout(20_000) })
  if (!antwort.ok) throw new Error(`Anfrage nicht angenommen (HTTP ${antwort.status})`)
  const inhalt = (await antwort.json()) as { ok?: unknown; match?: unknown } | null
  if (inhalt?.ok !== true || (inhalt.match !== 'FOUND' && inhalt.match !== 'NONE')) throw new Error('Antwort nicht im erwarteten Format')
  return inhalt.match
}
