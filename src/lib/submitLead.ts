// Versand für Formular und Luna an den Anfrage-Eingang (public/anfrage.php, Aufgabe Abschnitt 6).
// Die Partner-Bewerbung (src/lib/bewerbung.ts) nutzt denselben Eingang über posteAnEingang.
// POST als URLSearchParams (einfache Anfrage ohne Preflight).
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
/** Id im Format F247-XXXXXX (Anfrage) bzw. P247-XXXXXX (Partner-Bewerbung), wird auch als Nummer angezeigt */
export function zufallsnummer(praefix: 'F247' | 'P247' = 'F247'): string {
  const zahlen = crypto.getRandomValues(new Uint32Array(6))
  return `${praefix}-${[...zahlen].map((z) => ZEICHEN[z % ZEICHEN.length]).join('')}`
}

export const buildPayload = (lead: Lead) =>
  new URLSearchParams({ art: 'anfrage', ...lead, antworten: JSON.stringify(lead.antworten), dsgvo: 'on' })

/** POST an den Eingang (Anfrage und Partner-Bewerbung). HTTP-Fehler und Timeout nach 20 s werfen; zurück kommt das JSON. */
export async function posteAnEingang(body: URLSearchParams): Promise<{ ok?: unknown; match?: unknown } | null> {
  const endpunkt = formEndpunkt()
  if (!endpunkt) throw new Error('Kein Anfrage-Eingang konfiguriert (VITE_FORM_ENDPOINT)')
  const antwort = await fetch(endpunkt, { method: 'POST', body, signal: AbortSignal.timeout(20_000) })
  if (!antwort.ok) throw new Error(`Nicht angenommen (HTTP ${antwort.status})`)
  return (await antwort.json()) as { ok?: unknown; match?: unknown } | null
}

export async function submitLead(lead: Lead): Promise<Match> {
  const inhalt = await posteAnEingang(buildPayload(lead))
  if (inhalt?.ok !== true || (inhalt.match !== 'FOUND' && inhalt.match !== 'NONE')) throw new Error('Antwort nicht im erwarteten Format')
  return inhalt.match
}
