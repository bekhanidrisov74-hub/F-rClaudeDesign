// KI-Erfassung über das Backend (lokal /api/chat, live public/chat.php). Der Schlüssel liegt nur dort.
// Liefert die Felder des Werkzeugs „erfassen“ oder null: bei Fehler, Kontingent, fremdem Format oder nach 18 s. Dann läuft
// Luna mit den lokalen Regeln weiter, ohne Fehlermeldung; eine Frage beantwortet sie dann mit dem Hinweis aufs Telefon.
// Die Felder prüft flow.ts (uebernimm).
import { chatEndpunkt } from '../lib/endpunkte'
import { zuschlaegeJetzt } from '../lib/zuschlagJetzt'
import type { Erfasser } from './flow'

/** Wie pruefe() in public/chat.php: Andere Pfade (404-Seite mit fremder Adresse) gehen ohne Seite mit. */
const SEITE_RE = /^\/[a-z0-9/-]{0,60}$/

export const erfasseUeberApi: Erfasser = async (messages, state) => {
  const endpunkt = chatEndpunkt()
  if (!endpunkt) return null
  try {
    // Seite und Zuschlag kennt nur der Browser: wo der Chat offen ist und was gerade in Wien gilt (Preisrechner, Bauplan M6).
    const seite = SEITE_RE.test(location.pathname) ? location.pathname : undefined
    const body = JSON.stringify({ messages, state: { ...state, seite, zuschlag: zuschlaegeJetzt(new Date()) } })
    // Ohne Content-Type: ein String geht als text/plain, eine einfache Anfrage ohne Preflight (chat.php liest php://input).
    const antwort = await fetch(endpunkt, { method: 'POST', body, signal: AbortSignal.timeout(18_000) })
    const daten = (await antwort.json()) as { message?: { tool_calls?: { function?: { name?: string; arguments?: string } }[] } }
    const werkzeug = daten?.message?.tool_calls?.[0]?.function
    if (werkzeug?.name !== 'erfassen' || typeof werkzeug.arguments !== 'string') return null
    return JSON.parse(werkzeug.arguments) as unknown
  } catch {
    return null
  }
}
