// Versand für Formular und Luna (SPEC 9).
// Mit VITE_LEAD_ENDPOINT: POST als JSON, Antwort { "anfragenummer": "…" }.
// Ohne: lokaler Ersatz, meldet nach 800 ms Erfolg; mit ?fehler=1 in der URL einen Fehler (für Tests).

export type Dringlichkeit = 'sofort' | 'heute' | 'tage'

export interface LeadDaten {
  quelle: 'formular' | 'luna'
  /** id aus gewerke.ts, null bei „Weiß ich nicht“ oder Freitext */
  gewerk: string | null
  beschreibung: string
  plz: string
  ort: string
  dringlichkeit: Dringlichkeit | null
  name: string
  telefon: string
  einwilligung: true
}

export interface Lead extends LeadDaten {
  /** ISO-8601 */
  zeit: string
}

export const buildPayload = (daten: LeadDaten, jetzt = new Date()): Lead => ({ ...daten, zeit: jetzt.toISOString() })

const ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
/** Anfragenummer im Format F247-XXXXXX (nur im lokalen Ersatz, sonst vom Server) */
export function zufallsnummer(): string {
  const zahlen = crypto.getRandomValues(new Uint32Array(6))
  return `F247-${[...zahlen].map((z) => ZEICHEN[z % ZEICHEN.length]).join('')}`
}

export async function submitLead(daten: LeadDaten): Promise<{ anfragenummer: string }> {
  const lead = buildPayload(daten)
  const endpunkt = import.meta.env.VITE_LEAD_ENDPOINT
  if (!endpunkt) return lokalerErsatz()

  const antwort = await fetch(endpunkt, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  })
  if (!antwort.ok) throw new Error(`Anfrage nicht angenommen (HTTP ${antwort.status})`)
  const inhalt: unknown = await antwort.json()
  const nummer = (inhalt as { anfragenummer?: unknown } | null)?.anfragenummer
  if (typeof nummer !== 'string' || !nummer) throw new Error('Antwort ohne Anfragenummer')
  return { anfragenummer: nummer }
}

async function lokalerErsatz(): Promise<{ anfragenummer: string }> {
  await new Promise((fertig) => setTimeout(fertig, 800))
  if (new URLSearchParams(globalThis.location?.search ?? '').get('fehler') === '1') throw new Error('Testfehler (?fehler=1)')
  return { anfragenummer: zufallsnummer() }
}
