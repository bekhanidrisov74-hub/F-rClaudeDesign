// KI-Erfassung über das Backend (lokal /api/chat, live tools/apps-script-chat.gs). Der Schlüssel liegt nur dort.
// Liefert immer ein Objekt: bei Fehler, Kontingent, fremdem Format oder nach 12 s ein leeres. Dann läuft Luna
// mit den lokalen Regeln weiter, ohne Fehlermeldung. Die Felder prüft flow.ts (uebernimm).
import { chatEndpunkt } from '../lib/endpunkte'
import type { Erfasser } from './flow'

export const erfasseUeberApi: Erfasser = async (messages, state) => {
  const endpunkt = chatEndpunkt()
  if (!endpunkt) return {}
  try {
    // Ohne Content-Type: ein String geht als text/plain, eine einfache Anfrage ohne Preflight (nötig für Apps Script).
    const antwort = await fetch(endpunkt, { method: 'POST', body: JSON.stringify({ messages, state }), signal: AbortSignal.timeout(12_000) })
    const daten = (await antwort.json()) as { message?: { tool_calls?: { function?: { name?: string; arguments?: string } }[] } }
    const werkzeug = daten?.message?.tool_calls?.[0]?.function
    if (werkzeug?.name !== 'erfassen' || typeof werkzeug.arguments !== 'string') return {}
    return JSON.parse(werkzeug.arguments) as unknown
  } catch {
    return {}
  }
}
