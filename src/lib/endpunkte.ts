// Endpunkte nach Hostname (Aufgabe, Abschnitt 8): lokal die Attrappen bzw. die OpenAI-Weiterleitung aus
// tools/lokale-api.ts, live die Apps-Script-Web-Apps aus der Build-Umgebung. So schicken Tests nie an den
// echten Eingang, auch wenn die Variablen beim Build gesetzt sind.
const lokal = () => ['localhost', '127.0.0.1', '[::1]'].includes(globalThis.location?.hostname ?? '')

/** KI-Erfassung (tools/apps-script-chat.gs). Leer = Luna läuft nur mit den lokalen Regeln. */
export const chatEndpunkt = (): string => (lokal() ? '/api/chat' : (import.meta.env.VITE_CHAT_ENDPOINT ?? ''))

/** Anfrage-Eingang für Formular und Luna (tools/apps-script.gs). Leer = Senden schlägt fehl. */
export const formEndpunkt = (): string => (lokal() ? '/api/anfrage' : (import.meta.env.VITE_FORM_ENDPOINT ?? ''))
